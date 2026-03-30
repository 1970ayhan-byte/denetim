'use client'

import { usePathname } from 'next/navigation'
import { PanelsHeader } from '@/components/panels/PanelsHeader'

export default function PanelsLayout({ children }) {
  const pathname = usePathname()
  const isAdminShell = pathname?.startsWith('/admin')

  return (
    <div className="min-h-screen bg-background">
      {!isAdminShell && <PanelsHeader />}
      {children}
    </div>
  )
}
