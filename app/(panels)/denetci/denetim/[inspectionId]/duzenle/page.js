'use client'

import { RequireRole } from '@/components/auth/RequireRole'
import { DenetimDuzenleClient } from '@/components/inspector/DenetimDuzenleClient'
import { useAuth } from '@/components/providers/AuthProvider'

export default function DenetimDuzenlePage() {
  const { token } = useAuth()

  return (
    <RequireRole role="inspector">
      <DenetimDuzenleClient token={token} />
    </RequireRole>
  )
}
