import {
  LayoutDashboard,
  FolderTree,
  ListChecks,
  Users,
  Package,
  MapPin,
  Mail,
  CreditCard,
  ClipboardList,
  Newspaper,
  UserCog,
} from 'lucide-react'

export const ADMIN_NAV = [
  { href: '/admin/dashboard', label: 'Raporlama', icon: LayoutDashboard },
  { href: '/admin/categories', label: 'Kategoriler', icon: FolderTree },
  { href: '/admin/questions', label: 'Sorular', icon: ListChecks },
  { href: '/admin/staff', label: 'Personel', icon: Users },
  { href: '/admin/packages', label: 'Paketler', icon: Package },
  { href: '/admin/cities', label: 'İller', icon: MapPin },
  { href: '/admin/messages', label: 'Mesajlar', icon: Mail },
  { href: '/admin/payments', label: 'Ödemeler', icon: CreditCard },
  { href: '/admin/inspections', label: 'Denetimler', icon: ClipboardList },
  { href: '/admin/news', label: 'Haberler', icon: Newspaper },
  { href: '/admin/assignments', label: 'Denetim atama', icon: UserCog },
]
