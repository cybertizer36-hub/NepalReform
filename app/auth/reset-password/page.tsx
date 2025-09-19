"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordStrengthIndicator } from "@/components/password-strength-indicator"
import { useAuth } from "@/contexts/auth-context"
import { validatePassword } from "@/lib/utils/auth-validation"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Eye, EyeOff, AlertCircle, CheckCircle, Shield } from "lucide-react"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<{
    password?: string
    repeatPassword?: string
    general?: string
  }>({})
  const [touched, setTouched] = useState({
    password: false,
    repeatPassword: false,
  })

  const { updatePassword, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check if user is authenticated (they should be after clicking reset link)
  useEffect(() => {
    if (!user) {
      // If not authenticated, they probably need to click the reset link again
      router.push('/auth/forgot-password')
    }
  }, [user, router])

  const handleFieldTouch = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}

    // Password validation
    const passwordValidation = validatePassword(password)
    if (!password) {
      newErrors.password = "Password is required"
    } else if (!passwordValidation.isValid) {
      newErrors.password = "Password does not meet requirements"
    }

    // Repeat password validation
    if (!repeatPassword) {
      newErrors.repeatPassword = "Please confirm your password"
    } else if (password !== repeatPassword) {
      newErrors.repeatPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFieldValidation = (field: string, value: string) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'password':
        if (touched.password) {
          const passwordValidation = validatePassword(value)
          if (!value) {
            newErrors.password = "Password is required"
          } else if (!passwordValidation.isValid) {
            newErrors.password = "Password does not meet requirements"
          } else {
            delete newErrors.password
          }
        }
        // Also revalidate repeat password if it was touched
        if (touched.repeatPassword) {
          if (repeatPassword && value !== repeatPassword) {
            newErrors.repeatPassword = "Passwords do not match"
          } else if (repeatPassword && value === repeatPassword) {
            delete newErrors.repeatPassword
          }
        }
        break
      case 'repeatPassword':
        if (touched.repeatPassword) {
          if (!value) {
            newErrors.repeatPassword = "Please confirm your password"
          } else if (password !== value) {
            newErrors.repeatPassword = "Passwords do not match"
          } else {
            delete newErrors.repeatPassword
          }
        }
        break
    }

    setErrors(newErrors)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await updatePassword(password)

      if (error) {
        if (error.message.includes('Password should be')) {
          setErrors({ password: error.message })
        } else if (error.message.includes('Unable to process request')) {
          setErrors({ general: 'The reset link may have expired. Please request a new one.' })
        } else {
          setErrors({ general: error.message })
        }
        return
      }

      setIsSuccess(true)
      toast.success('Password updated successfully!', {
        description: 'You can now sign in with your new password.',
      })

      // Redirect to login after success
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)

    } catch (err) {
      console.error('Password reset error:', err)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Show success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Password Updated!</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your password has been successfully updated
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-sm text-muted-foreground">
                You will be automatically redirected to the login page, or you can click the button below.
              </p>

              <Button asChild className="w-full h-12">
                <Link href="/auth/login">
                  Continue to Login
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If not authenticated, show message to use reset link
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Access Required</CardTitle>
              <CardDescription className="text-muted-foreground">
                Please click the reset link in your email to access this page
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-sm text-muted-foreground">
                To reset your password, you need to click the secure link we sent to your email address.
              </p>

              <div className="space-y-3">
                <Button asChild className="w-full h-12">
                  <Link href="/auth/forgot-password">
                    Request New Reset Link
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full h-12">
                  <Link href="/auth/login">
                    Back to Login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Set New Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      handleFieldValidation('password', e.target.value)
                    }}
                    onBlur={() => handleFieldTouch('password')}
                    className={`h-12 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
                {password && <PasswordStrengthIndicator password={password} />}
              </div>

              <div className="space-y-2">
                <Label htmlFor="repeat-password" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="repeat-password"
                    type={showRepeatPassword ? "text" : "password"}
                    required
                    value={repeatPassword}
                    onChange={(e) => {
                      setRepeatPassword(e.target.value)
                      handleFieldValidation('repeatPassword', e.target.value)
                    }}
                    onBlur={() => handleFieldTouch('repeatPassword')}
                    className={`h-12 pr-10 ${errors.repeatPassword ? 'border-red-500' : touched.repeatPassword && password === repeatPassword && repeatPassword ? 'border-green-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showRepeatPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                {errors.repeatPassword && (
                  <p className="text-sm text-red-600">{errors.repeatPassword}</p>
                )}
                {touched.repeatPassword && password === repeatPassword && repeatPassword && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>Passwords match</span>
                  </div>
                )}
              </div>

              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-primary">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <Link href="https://nexalaris.com/" target="_blank" className="text-primary hover:underline font-medium">
              Nexalaris Tech Pvt. Ltd
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
