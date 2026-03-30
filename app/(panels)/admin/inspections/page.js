'use client'

import { InspectionsTab } from '@/components/admin/tabs/InspectionsTab'
import { useAuth } from '@/components/providers/AuthProvider'

export default function AdminInspectionsPage() {
  const { token } = useAuth()
  return <InspectionsTab token={token} />
}
