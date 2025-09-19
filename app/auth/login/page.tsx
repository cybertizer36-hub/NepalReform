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
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Eye, EyeOff, AlertCircle, CheckCircle, Mail } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [emailTouched, setEmailTouched] = useState(false)

  const { signIn, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(redirectTo)
    }
  }, [user, router, redirectTo])

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailBlur = () => {
    setEmailTouched(true)
    if (email && !validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }))
    } else {
      setErrors(prev => ({ ...prev, email: undefined }))
    }
  }

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const { user, error } = await signIn(email, password)

      if (error) {
        // Handle specific error types
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please try again.' })
        } else if (error.message.includes('Email not confirmed')) {
          setErrors({ general: 'Please check your email and click the confirmation link before signing in.' })
        } else if (error.message.includes('Too many requests')) {
          setErrors({ general: 'Too many login attempts. Please wait a moment and try again.' })
        } else {
          setErrors({ general: error.message })
        }
        return
      }

      if (user) {
        toast.success('Welcome back!', {
          description: 'You have been successfully signed in.',
        })
        router.push(redirectTo)
      }
    } catch (err) {
      console.error('Login error:', err)
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <img src="/nepal-flag-logo.png" alt="NepalReforms Logo" className="w-12 h-12 object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your account to share and vote on opinions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              {errors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
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
