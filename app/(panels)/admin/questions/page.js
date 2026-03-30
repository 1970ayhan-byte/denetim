'use client'

import { QuestionsTab } from '@/components/admin/tabs/QuestionsTab'
import { useAuth } from '@/components/providers/AuthProvider'

export default function AdminQuestionsPage() {
  const { token } = useAuth()
  return <QuestionsTab token={token} />
}
