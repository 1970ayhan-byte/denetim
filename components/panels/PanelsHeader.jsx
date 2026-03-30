'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'

export function PanelsHeader() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-primary hover:underline">
          ← Ana siteye dön
        </Link>
        <div className="flex items-center gap-3">
          {user && <span className="text-sm text-muted-foreground hidden sm:inline">{user.name}</span>}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-1" />
            Çıkış
          </Button>
        </div>
      </div>
    </header>
  )
}
