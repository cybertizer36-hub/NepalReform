"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, Users, MessageSquare, Vote } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

const words = ["Read", "Challenge", "Improve"]

export function HeroSection() {
  const scrollToAgendas = () => {
    const agendasSection = document.getElementById("agendas-section")
    agendasSection?.scrollIntoView({ behavior: "smooth" })
  }

  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, 2000) // change word every 2s
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-16 sm:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-primary rounded-full animate-pulse" />
        <div className="absolute top-32 right-20 w-16 h-16 bg-secondary/20 rounded-lg rotate-45 animate-bounce" />
        <div className="absolute bottom-20 left-1/4 w-12 h-12 border-2 border-accent rounded-full animate-pulse" />
        <div className="absolute bottom-32 right-1/3 w-8 h-8 bg-primary/20 rounded-full animate-bounce" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              🇳🇵 Made for Nepal's Future
            </Badge>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              <span className="text-primary">Nepal</span>Reforms
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground font-medium">
              Your Voice in Nepal's Democratic Future
            </p>
          </div>

          {/* Description */}
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-lg text-foreground leading-relaxed">
              Nepal's democracy is at a crossroads. This platform is where citizens shape the future, through ideas, debate, and action. From tackling corruption to rethinking elections, your voice can turn protest into progress.
            </p>
            <p className="text-base text-muted-foreground">
              Born from the bold energy of Gen Z, and strengthened by the wisdom and support of experts, professionals, and concerned Nepalis of all ages and sectors, this movement is bigger than any one generation.
            </p>
            <p className="text-base text-muted-foreground">
              This manifesto isn't just words, it's a roadmap for a just, accountable Nepal.
            </p>
          </div>

          {/* Animated Text */}
          <div className="text-center space-y-4">
            <div className="text-2xl md:text-3xl font-semibold flex justify-center items-center gap-2">
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-primary"
              >
                {words[index]}
              </motion.span>
              <span>it</span>
            </div>

            <div className="text-lg md:text-xl font-bold">
              let&apos;s make it real
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 py-8">
            <div className="flex items-center gap-2 text-center">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">20+</div>
                <div className="text-sm text-muted-foreground">Reform Agendas</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-center">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">∞</div>
                <div className="text-sm text-muted-foreground">Suggestions</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-center">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <Vote className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">100%</div>
                <div className="text-sm text-muted-foreground">Democratic</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Replaced Email Button with Animated Border */}
            <motion.div
              className="relative rounded-md p-[3px] overflow-hidden"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "300% 300%",
                backgroundImage:
                  "linear-gradient(270deg, #db2777, #7c3aed, #2563eb, #db2777)", // animated gradient border
              }}
            >
              <Button
                size="lg"
                asChild
                className="relative z-10 px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Link href="mailto:suggestions@nepalreforms.com">
                  Email Us
                </Link>
              </Button>
            </motion.div>


            <Button
              variant="outline"
              size="lg"
              onClick={scrollToAgendas}
              className="px-8 py-3 text-base font-medium bg-transparent"
            >
              Explore Agendas
              <ArrowDown className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
