'use client'

import { CitiesTab } from '@/components/admin/tabs/CitiesTab'
import { useAuth } from '@/components/providers/AuthProvider'

export default function AdminCitiesPage() {
  const { token } = useAuth()
  return <CitiesTab token={token} />
}
