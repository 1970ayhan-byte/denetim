'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { SiteNav } from '@/components/site/SiteNav'
import { SiteFooter } from '@/components/site/SiteFooter'
import WhatsAppButton from '@/components/WhatsAppButton'
import { useAuth } from '@/components/providers/AuthProvider'

export default function SiteLayout({ children }) {
  const pathname = usePathname()
  const { user } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteNav />
      <main className="flex-1">{children}</main>
      {!user && <WhatsAppButton />}
      <SiteFooter />
    </div>
  )
}
