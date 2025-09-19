"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { validateEmail } from "@/lib/utils/auth-validation"
import Link from "next/link"
import { useState } from "react"
import { AlertCircle, CheckCircle, Mail, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({})
  const [emailTouched, setEmailTouched] = useState(false)

  const { resetPassword } = useAuth()

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    
    if (emailTouched) {
      if (!value) {
        setErrors(prev => ({ ...prev, email: "Email is required" }))
      } else if (!validateEmail(value)) {
        setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }))
      } else {
        setErrors(prev => ({ ...prev, email: undefined }))
      }
    }
  }

  const handleEmailBlur = () => {
    setEmailTouched(true)
    if (email && !validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }))
    } else if (!email) {
      setErrors(prev => ({ ...prev, email: "Email is required" }))
    } else {
      setErrors(prev => ({ ...prev, email: undefined }))
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setErrors({ email: "Email is required" })
      return
    }

    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email address" })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await resetPassword(email)

      if (error) {
        if (error.message.includes('User not found')) {
          setErrors({ email: 'No account found with this email address' })
        } else if (error.message.includes('Email rate limit exceeded')) {
          setErrors({ general: 'Too many reset requests. Please wait before requesting again.' })
        } else {
          setErrors({ general: error.message })
        }
        return
      }

      setIsSuccess(true)
      toast.success('Password reset email sent!', {
        description: 'Check your inbox for further instructions.',
      })
    } catch (err) {
      console.error('Password reset error:', err)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Check Your Email</CardTitle>
              <CardDescription className="text-muted-foreground">
                We've sent password reset instructions to your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  If an account with <strong>{email}</strong> exists, you will receive password reset instructions shortly.
                </p>
                <p className="text-sm text-muted-foreground">
                  Don't forget to check your spam folder!
                </p>
              </div>

              <div className="space-y-3">
                <Button asChild className="w-full h-12">
                  <Link href="/auth/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Link>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSuccess(false)
                    setEmail("")
                    setEmailTouched(false)
                    setErrors({})
                  }}
                  className="w-full h-12"
                >
                  Try Different Email
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
              <img src="/nepal-flag-logo.png" alt="NepalReforms Logo" className="w-12 h-12 object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email address and we'll send you instructions to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    className={`h-12 pr-10 ${errors.email ? 'border-red-500' : emailTouched && validateEmail(email) ? 'border-green-500' : ''}`}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {emailTouched && (
                      validateEmail(email) ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : email ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      )
                    )}
                  </div>
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Instructions"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/auth/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-1" />
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
