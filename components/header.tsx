"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, User, Menu, X, BookOpen, Home, Download, ChevronDown, Quote } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ClientOnly } from "@/components/client-only"
import { useHydration } from "@/hooks/use-hydration"
import { LanguageToggle } from "@/components/language-toggle"

// Locally define Supabase's AuthChangeEvent type union (from internal source)
type AuthChangeEvent =
  | "SIGNED_IN"
  | "SIGNED_OUT"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "PASSWORD_RECOVERY"
  | "TOKEN_REFRESHED"
  | "MFA_CHALLENGE_VERIFIED"
  | "MFA_VERIFIED"
  | "MFA_ENROLL";
// Minimal Session type interface (can be expanded if needed)
interface Session {
  user: {
    id: string;
    email: string;
    // Add more fields if required
  };
  // Add other session properties here as needed, based on project usage
}

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isHydrated = useHydration()
  const supabase = createClient()

  useEffect(() => {
    if (!isHydrated) return

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    checkUser()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, isHydrated])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const handleDownloadEnglish = () => {
    const englishUrl =
      "https://nokrhvgrfcletinhsalt.supabase.co/storage/v1/object/sign/Manifestobucket/Nepal_Manifesto_What_Comes_After_the_Streets_Offline.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yZTMwMzU3Mi0zYTNmLTRjYmQtOTg1NC0yZjQyYWI4YmE4MTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNYW5pZmVzdG9idWNrZXQvTmVwYWxfTWFuaWZlc3RvX1doYXRfQ29tZXNfQWZ0ZXJfdGhlX1N0cmVldHNfT2ZmbGluZS5wZGYiLCJpYXQiOjE3NTc2MTQyODksImV4cCI6MTc4OTE1MDI4OX0.9jeGonZUV7CgaQe55oHg5JvUhrhPYQg-OIw2gigiVQg"
    window.open(englishUrl, "_blank")
  }

  const handleDownloadNepali = () => {
    const nepaliUrl =
      "https://nokrhvgrfcletinhsalt.supabase.co/storage/v1/object/sign/Manifestobucket/Nepali_language_Manifesto.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yZTMwMzU3Mi0zYTNmLTRjYmQtOTg1NC0yZjQyYWI4YmE4MTkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJNYW5pZmVzdG9idWNrZXQvTmVwYWxpX2xhbmd1YWdlX01hbmlmZXN0by5wZGYiLCJpYXQiOjE3NTc2MTQzMTYsImV4cCI6MTc4OTE1MDMxNn0.7jJXfea5IKF9S709YBKssa_FWzkIg5u213gErQMojr4"
    window.open(nepaliUrl, "_blank")
  }

  // Auth component with hydration-safe rendering
  const AuthSection = () => {
    if (!isHydrated) {
      // Render a neutral placeholder during SSR to prevent hydration mismatch
      return <div className="w-20 h-8 animate-pulse bg-gray-200 rounded" />
    }

    return user ? (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {user.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-sm">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    ) : (
      <Button asChild size="sm">
        <Link href="/auth/login">
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Link>
      </Button>
    )
  }

  // Mobile auth section
  const MobileAuthSection = () => {
    if (!isHydrated) {
      return <div className="w-full h-8 animate-pulse bg-gray-200 rounded" />
    }

    return user ? (
      <div className="space-y-3 pt-3 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-foreground">{user.email}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    ) : (
      <Button asChild size="sm" className="w-full">
        <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Link>
      </Button>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 relative">
                <Image
                  src="/nepal-flag-logo.png"
                  alt="NepalReforms Logo"
                  fill
                  className="object-contain rounded-none"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">NepalReforms</h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                href="https://lawcommission.gov.np/content/13437/nepal-s-constitution/"
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Constitution
              </Link>
              <Link
                href="/testimonials"
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <Quote className="h-4 w-4" />
                Testimonials
              </Link>
              
              <ClientOnly fallback={<div className="w-32 h-4" />}>
                {user && (
                  <>
                    <Link
                      href="/create-opinion"
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      Create Agenda
                    </Link>
                    <Link
                      href="/profile"
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      Profile
                    </Link>
                  </>
                )}
              </ClientOnly>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    className="relative rounded-md p-[2px] overflow-hidden"
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
                        "linear-gradient(270deg, #ffffff, #374151, #ffffff)", // white + dark gray (tailwind's gray-700)
                    }}
                  >
                    <Button
                      size="sm"
                      className="relative z-10 text-sm font-medium bg-gray-600 text-white hover:bg-gray-800"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Manifesto
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleDownloadEnglish} className="cursor-pointer">
                    <Download className="h-4 w-4 mr-2" />
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadNepali} className="cursor-pointer">
                    <Download className="h-4 w-4 mr-2" />
                    Nepali
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            <AuthSection />
            <LanguageToggle />
          </div>

          {/* Mobile Language Toggle and Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <LanguageToggle />
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-sm">
            <div className="px-4 py-4 space-y-4">
              <nav className="space-y-2">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <Link
                  href="/#agendas-section"
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BookOpen className="h-4 w-4" />
                  27 Reforms
                </Link>
                <Link
                  href="/testimonials"
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Quote className="h-4 w-4" />
                  Testimonials
                </Link>
                
                <ClientOnly>
                  {user && (
                    <>
                      <Link
                        href="/create-opinion"
                        className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Create Opinion
                      </Link>
                      <Link
                        href="/profile"
                        className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    </>
                  )}
                </ClientOnly>
                
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-sm font-medium text-foreground">Download Full Manifesto:</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleDownloadEnglish()
                      setIsMenuOpen(false)
                    }}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    English
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleDownloadNepali()
                      setIsMenuOpen(false)
                    }}
                    className="w-full justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Nepali
                  </Button>
                </div>
              </nav>

              <MobileAuthSection />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
