'use client'

import { StaffTab } from '@/components/admin/tabs/StaffTab'
import { useAuth } from '@/components/providers/AuthProvider'

export default function AdminStaffPage() {
  const { token } = useAuth()
  return <StaffTab token={token} />
}
