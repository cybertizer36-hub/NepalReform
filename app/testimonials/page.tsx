import { Header } from "@/components/header"
import { TestimonialsGrid } from "@/components/testimonials-grid"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Testimonials | Nepal Reforms Platform",
  description: "Hear from the voices of Nepal supporting democratic reform and transformation",
}

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Community Testimonials</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Voices from across Nepal supporting democratic reform and positive change. 
              These are the stories of citizens who believe in a better future for our nation.
            </p>
          </div>
          <TestimonialsGrid />
        </div>
      </main>
    </div>
  )
}
