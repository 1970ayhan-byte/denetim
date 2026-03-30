'use client'

import { RequireRole } from '@/components/auth/RequireRole'
import { InspectorPanel } from '@/components/inspector/InspectorPanel'
import { useAuth } from '@/components/providers/AuthProvider'

export default function DenetciPage() {
  const { token, user } = useAuth()

  return (
    <RequireRole role="inspector">
      <InspectorPanel token={token} user={user} />
    </RequireRole>
  )
}
