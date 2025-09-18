import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Basic health check - you can add more sophisticated checks here
    const healthCheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: new Date().toISOString(),
      status: 'healthy',
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.npm_package_version || '1.0.0'
    }

    // You can add additional checks here:
    // - Database connectivity
    // - External service availability
    // - Memory usage
    // - File system access
    
    return NextResponse.json(healthCheck, { status: 200 })
  } catch (error) {
    const errorResponse = {
      uptime: process.uptime(),
      message: 'Service Unavailable',
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }

    return NextResponse.json(errorResponse, { status: 503 })
  }
}

// Support for HEAD requests (common for health checks)
export async function HEAD(request: NextRequest) {
  try {
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}
