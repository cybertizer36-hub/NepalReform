import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ManifestoList } from "@/components/manifesto-list"
import { TestimonialCarousel } from "@/components/testimonial-carousel"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <HeroSection />

        <section id="agendas-section" className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Nepal Reform Manifesto</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Explore 27 comprehensive reform proposals for Nepal's democratic transformation. Each proposal includes
                detailed solutions, real-world evidence, implementation timelines, and performance targets based on
                international best practices.
              </p>
            </div>
            <div className="max-w-3xl mx-auto mt-12 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-8 space-y-6 mb-16">
              <h2 className="text-2xl font-bold text-foreground">How to Engage:</h2>
              <ul className="list-disc list-inside space-y-3 text-lg text-muted-foreground">
                <li>Read the Reform Agendas listed below.</li>
                <li>
                  Explore the Full Manifesto — available in both English and Nepali
                  <span className="italic"> (top right of this page)</span>.
                </li>
                <li>Vote on the Reform Agendas to show your support.</li>
                <li>Sign In to access the suggestion form if you notice something missing.</li>
                <li>
                  Email Us Your Feedback — compile your thoughts and send them to:{" "}
                  <a
                    href="mailto:suggestions@nepalreforms.com"
                    className="text-primary font-medium hover:underline"
                  >
                    suggestions@nepalreforms.com
                  </a>
                </li>
                <li>
                  Spread the Word — share this platform with your friends, family,
                  neighbors, and colleagues.
                </li>
              </ul>
            </div>

            <ManifestoList />
          </div>
        </section>

        {/* Testimonials Section */}
        <TestimonialCarousel />

        {/* Footer or Additional Content */}
        <footer className="bg-muted/50 border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center gap-3">
              <img src="/nepal-flag-logo.png" alt="NepalReforms Logo" className="w-8 h-8 object-contain" />
              <span className="text-lg font-semibold text-foreground">NepalReforms</span>
            </div>
            <p className="text-sm text-muted-foreground">Empowering Nepal's youth to shape democratic reforms</p>
            {/* Powered by */}
            <div className="pt-8 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Proudly developed by{" "}
                <Link
                  href="https://nexalaris.com/"
                  target="_blank"
                  className="text-primary hover:underline font-medium"
                >
                  Nexalaris Tech Pvt. Ltd.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
      </main>
    </div>
  )
}
