"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ManifestoList } from "@/components/manifesto-list"
import { TestimonialCarousel } from "@/components/testimonial-carousel"
import Link from "next/link"
import { useTranslation } from "react-i18next"

export default function HomePage() {
  const { t } = useTranslation('common')

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <HeroSection />

        <section id="agendas-section" className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {t('home.manifestoTitle')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t('home.manifestoDescription')}
              </p>
            </div>
            <div className="max-w-3xl mx-auto mt-12 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md p-8 space-y-6 mb-16">
              <h2 className="text-2xl font-bold text-foreground">{t('home.howToEngage')}</h2>
              <ul className="list-disc list-inside space-y-3 text-lg text-muted-foreground">
                <li>{t('home.engageSteps.read')}</li>
                <li>
                  {t('home.engageSteps.explore')}
                  <span className="italic"> {t('home.engageSteps.topRight')}</span>.
                </li>
                <li>{t('home.engageSteps.vote')}</li>
                <li>{t('home.engageSteps.signIn')}</li>
                <li>
                  {t('home.engageSteps.email')}{" "}
                  <a
                    href="mailto:suggestions@nepalreforms.com"
                    className="text-primary font-medium hover:underline"
                  >
                    suggestions@nepalreforms.com
                  </a>
                </li>
                <li>{t('home.engageSteps.share')}</li>
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
              <p className="text-sm text-muted-foreground">{t('footer.tagline')}</p>
              {/* Powered by */}
              <div className="pt-8 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  {t('footer.poweredBy')}{" "}
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
