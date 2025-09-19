'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RefreshCw, Home, Mail } from 'lucide-react'
import Link from 'next/link'

interface AuthErrorProps {
  error: Error | string
  onRetry?: () => void
  showHomeButton?: boolean
  showRefreshButton?: boolean
  title?: string
}

export function AuthError({
  error,
  onRetry,
  showHomeButton = true,
  showRefreshButton = true,
  title = 'Authentication Error'
}: AuthErrorProps) {
  const errorMessage = typeof error === 'string' ? error : error.message
  
  // Determine error type and provide helpful messages
  const getErrorDetails = (message: string) => {
    if (message.includes('Invalid login credentials')) {
      return {
        title: 'Invalid Credentials',
        description: 'The email or password you entered is incorrect. Please try again.',
        actionText: 'Try Again',
        showEmailSupport: false,
      }
    }
    
    if (message.includes('Email not confirmed')) {
      return {
        title: 'Email Not Verified',
        description: 'Please check your email and click the verification link before signing in.',
        actionText: 'Resend Verification',
        showEmailSupport: true,
      }
    }
    
    if (message.includes('Too many requests')) {
      return {
        title: 'Too Many Attempts',
        description: 'Please wait a moment before trying again.',
        actionText: 'Try Again Later',
        showEmailSupport: false,
      }
    }
    
    if (message.includes('Network')) {
      return {
        title: 'Connection Problem',
        description: 'Please check your internet connection and try again.',
        actionText: 'Retry',
        showEmailSupport: false,
      }
    }
    
    return {
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
      actionText: 'Try Again',
      showEmailSupport: true,
    }
  }

  const errorDetails = getErrorDetails(errorMessage)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-6">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {errorDetails.title}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {errorDetails.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {onRetry && (
                <Button onClick={onRetry} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {errorDetails.actionText}
                </Button>
              )}
              
              {showRefreshButton && (
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()} 
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
              )}
              
              {showHomeButton && (
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Go to Homepage
                  </Link>
                </Button>
              )}
              
              {errorDetails.showEmailSupport && (
                <Button asChild variant="ghost" className="w-full">
                  <Link href="mailto:support@nepalreforms.com">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Support
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <Link href="mailto:support@nepalreforms.com" className="text-primary hover:underline font-medium">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// Specific error components for common scenarios
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <AuthError
      error="Network connection failed"
      onRetry={onRetry}
      title="Connection Problem"
    />
  )
}

export function SessionExpiredError() {
  return (
    <AuthError
      error="Your session has expired. Please sign in again."
      title="Session Expired"
      showRefreshButton={false}
    />
  )
}

export function UnauthorizedError() {
  return (
    <AuthError
      error="You don't have permission to access this resource."
      title="Access Denied"
      showRefreshButton={false}
    />
  )
}
