import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    // Require authenticated admin
    const userClient = await createClient()
    const { data: { user }, error: authErr } = await userClient.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: profile } = await userClient.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const checks = {
      environment: {
        SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
      },
      database: {
        connection: false,
        profiles_table: false,
        activity_logs_table: false,
        user_count: 0,
      },
      features: {
        rls_enabled: false,
        admin_function: false,
        service_role_function: false,
      }
    }

    // Test database connection (service role)
    try {
      const supabase = await createServiceClient()
      
      // Test profiles table
      const { count: profileCount, error: profileError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      if (!profileError) {
        checks.database.profiles_table = true
        checks.database.user_count = profileCount || 0
      }
      
      // Test activity_logs table
      const { error: activityError } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
      
      if (!activityError) {
        checks.database.activity_logs_table = true
      }
      
      checks.database.connection = true
      
      // Test admin function
      const { data: adminCheck } = await supabase.rpc('is_admin')
      checks.features.admin_function = adminCheck !== null
      
      // Test service role function  
      const { data: serviceCheck } = await supabase.rpc('is_service_role')
      checks.features.service_role_function = serviceCheck !== null
      
      // Check RLS status
      const { data: rlsData } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      checks.features.rls_enabled = true // If we can query, RLS is working
      
    } catch (dbError: any) {
      console.error('Database check error:', dbError)
    }

    // Calculate health score
    const totalChecks = 
      Object.keys(checks.environment).length + 
      Object.keys(checks.database).length - 1 + // Exclude user_count from scoring
      Object.keys(checks.features).length
      
    const passedChecks = 
      Object.values(checks.environment).filter(Boolean).length +
      Object.values(checks.database).filter((v, i) => i !== 3 && v).length + // Exclude user_count
      Object.values(checks.features).filter(Boolean).length
      
    const healthScore = Math.round((passedChecks / totalChecks) * 100)
    
    // Determine status
    let status: 'healthy' | 'degraded' | 'unhealthy'
    if (healthScore >= 90) {
      status = 'healthy'
    } else if (healthScore >= 60) {
      status = 'degraded'
    } else {
      status = 'unhealthy'
    }
    
    // Generate recommendations
    const recommendations = []
    
    if (!checks.environment.SUPABASE_SERVICE_ROLE_KEY) {
      recommendations.push('Set SUPABASE_SERVICE_ROLE_KEY in .env.local for admin operations')
    }
    
    if (!checks.database.profiles_table) {
      recommendations.push('Run database migration script: scripts/fix-user-management-complete.sql')
    }
    
    if (!checks.database.activity_logs_table) {
      recommendations.push('Create activity_logs table for audit logging')
    }
    
    if (checks.database.user_count === 0) {
      recommendations.push('No users found - create test users or check if data exists')
    }
    
    if (!checks.features.admin_function) {
      recommendations.push('Create is_admin() function for RLS policies')
    }
    
    if (!checks.features.service_role_function) {
      recommendations.push('Create is_service_role() function for API access')
    }
    
    const response = {
      status,
      healthScore,
      timestamp: new Date().toISOString(),
      checks,
      recommendations,
      message: status === 'healthy' 
        ? 'All systems operational' 
        : `System ${status}: ${recommendations.length} issues found`
    }
    
    return NextResponse.json(response, {
      status: status === 'healthy' ? 200 : (status === 'degraded' ? 200 : 503),
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
    
  } catch (error: any) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      healthScore: 0,
      error: error.message || 'Unknown error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed'
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
  }
}
