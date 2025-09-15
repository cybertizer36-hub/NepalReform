import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { Header } from "@/components/header"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Reform Proposal Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                The reform proposal you're looking for doesn't exist. Please check the URL or browse our available
                reforms.
              </p>
              <p className="text-sm text-muted-foreground">
                We have 27 comprehensive reform proposals available for Nepal's democratic transformation.
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Link href="/#agendas-section">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    View All Reforms
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">Go Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
