'use client'

import { NewsManagementTab } from '@/components/admin/tabs/NewsManagementTab'
import { useAuth } from '@/components/providers/AuthProvider'

export default function AdminNewsPage() {
  const { token } = useAuth()
  return <NewsManagementTab token={token} />
}
