'use client'

import { DashboardTab } from '@/components/admin/tabs/DashboardTab'
import { useAuth } from '@/components/providers/AuthProvider'

export default function AdminDashboardPage() {
  const { token } = useAuth()
  return <DashboardTab token={token} />
}
