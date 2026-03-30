'use client'

import { InspectionAssignmentTab } from '@/components/admin/tabs/InspectionAssignmentTab'
import { useAuth } from '@/components/providers/AuthProvider'

export default function AdminAssignmentsPage() {
  const { token } = useAuth()
  return <InspectionAssignmentTab token={token} />
}
