'use client'

import { PackagesTab } from '@/components/admin/tabs/PackagesTab'
import { useAuth } from '@/components/providers/AuthProvider'

export default function AdminPackagesPage() {
  const { token } = useAuth()
  return <PackagesTab token={token} />
}
