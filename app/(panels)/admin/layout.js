import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient'

export const metadata = {
  title: 'Yönetim paneli',
}

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
