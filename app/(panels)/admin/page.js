'use client'

import { RequireRole } from '@/components/auth/RequireRole'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { useAuth } from '@/components/providers/AuthProvider'

export default function AdminPage() {
  const { token } = useAuth()

  return (
    <RequireRole role="admin">
      <AdminPanel token={token} />
    </RequireRole>
  )
}
