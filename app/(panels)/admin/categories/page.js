'use client'

import { CategoriesTab } from '@/components/admin/tabs/CategoriesTab'
import { useAuth } from '@/components/providers/AuthProvider'

export default function AdminCategoriesPage() {
  const { token } = useAuth()
  return <CategoriesTab token={token} />
}
