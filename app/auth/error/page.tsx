import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive rounded-full flex items-center justify-center">
              <span className="text-2xl text-white">⚠️</span>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {params?.error ? (
              <p className="text-sm text-muted-foreground">Error: {params.error}</p>
            ) : (
              <p className="text-sm text-muted-foreground">An unspecified error occurred.</p>
            )}
            <Link href="/auth/login" className="inline-block text-primary hover:underline font-medium">
              Back to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
