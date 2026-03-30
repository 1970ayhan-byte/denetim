'use client'

import { RequireRole } from '@/components/auth/RequireRole'
import { InspectorInspectionList } from '@/components/inspector/InspectorInspectionList'
import { useAuth } from '@/components/providers/AuthProvider'

export default function DenetciPage() {
  const { token, user } = useAuth()

  return (
    <RequireRole role="inspector">
      <InspectorInspectionList token={token} user={user} />
    </RequireRole>
  )
}
