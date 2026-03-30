'use client'

import { Suspense } from 'react'
import { RequireRole } from '@/components/auth/RequireRole'
import { DenetimAkisClient } from '@/components/inspector/DenetimAkisClient'
import { useAuth } from '@/components/providers/AuthProvider'

function AkisFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
      Yükleniyor...
    </div>
  )
}

export default function DenetimAkisPage() {
  const { token } = useAuth()

  return (
    <RequireRole role="inspector">
      <Suspense fallback={<AkisFallback />}>
        <DenetimAkisClient token={token} />
      </Suspense>
    </RequireRole>
  )
}
