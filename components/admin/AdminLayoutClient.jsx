'use client'

import { RequireRole } from '@/components/auth/RequireRole'
import { AdminShell } from '@/components/admin/AdminShell'

export function AdminLayoutClient({ children }) {
  return (
    <RequireRole role="admin">
      <AdminShell>{children}</AdminShell>
    </RequireRole>
  )
}
