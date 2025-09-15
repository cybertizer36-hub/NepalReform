import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <img src="/nepal-flag-logo.png" alt="NepalReforms Logo" className="w-12 h-12 object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Welcome to NepalReforms!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Check your email to confirm your account
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You've successfully signed up. Please check your email to confirm your account before signing in.
            </p>
            <Link href="/auth/login" className="inline-block text-primary hover:underline font-medium">
              Back to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
