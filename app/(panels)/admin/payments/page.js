'use client'

import { PaymentsTab } from '@/components/admin/tabs/PaymentsTab'
import { useAuth } from '@/components/providers/AuthProvider'

export default function AdminPaymentsPage() {
  const { token } = useAuth()
  return <PaymentsTab token={token} />
}
