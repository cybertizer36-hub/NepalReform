"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

export function AuthButton() {
  const { t } = useTranslation('common')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string, session: import("@supabase/supabase-js").Session | null) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <Button variant="ghost" disabled>
        {t('suggestions.loading')}
      </Button>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{t('auth.welcome')}, {user.email}</span>
        <Button variant="outline" onClick={handleSignOut}>
          {t('header.signOut')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" onClick={() => router.push("/auth/login")}>
        {t('header.signIn')}
      </Button>
      <Button onClick={() => router.push("/auth/sign-up")}>{t('auth.signUp')}</Button>
    </div>
  )
}
