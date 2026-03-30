'use client'

import { PanelsHeader } from '@/components/panels/PanelsHeader'

export default function PanelsLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <PanelsHeader />
      {children}
    </div>
  )
}
