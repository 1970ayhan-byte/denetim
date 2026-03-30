'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

export function RequireRole({ role, children }) {
  const router = useRouter()
  const { user, token, hydrated } = useAuth()

  useEffect(() => {
    if (!hydrated) return
    if (!token || !user) {
      router.replace('/giris')
      return
    }
    if (role === 'admin' && user.role !== 'admin') {
      router.replace('/giris')
      return
    }
    if (role === 'inspector' && user.role !== 'inspector') {
      router.replace('/giris')
      return
    }
  }, [hydrated, token, user, role, router])

  if (!hydrated || !token || !user) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
        Yükleniyor...
      </div>
    )
  }

  if (role === 'admin' && user.role !== 'admin') return null
  if (role === 'inspector' && user.role !== 'inspector') return null

  return children
}
