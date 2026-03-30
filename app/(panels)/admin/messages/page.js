'use client'

import { MessagesTab } from '@/components/admin/tabs/MessagesTab'
import { useAuth } from '@/components/providers/AuthProvider'

export default function AdminMessagesPage() {
  const { token } = useAuth()
  return <MessagesTab token={token} />
}
