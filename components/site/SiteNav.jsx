'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'

const navClass = (active) =>
  `text-sm hover:text-primary ${active ? 'text-primary font-medium' : ''}`

export function SiteNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-16">
          <Link href="/" className="text-xl font-bold text-primary absolute left-4 md:static md:mr-8">
            SARIMEŞE DANIŞMANLIK
          </Link>

          {!user && (
            <div className="hidden md:flex items-center justify-center space-x-8 flex-1">
              <Link href="/" className={navClass(pathname === '/')}>
                Anasayfa
              </Link>
              <Link href="/hizmetler" className={navClass(pathname === '/hizmetler')}>
                Hizmetlerimiz
              </Link>
              <Link href="/paketler" className={navClass(pathname === '/paketler')}>
                Paketler
              </Link>
              <Link href="/haberler" className={navClass(pathname === '/haberler' || pathname.startsWith('/haberler/'))}>
                Bizden Haberler
              </Link>
              <Link href="/iletisim" className={navClass(pathname === '/iletisim')}>
                İletişim
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-4 absolute right-4 md:static">
            {user ? (
              <>
                <span className="text-sm hidden md:inline">
                  {user.name} ({user.role === 'admin' ? 'Admin' : 'Denetçi'})
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={user.role === 'admin' ? '/admin' : '/denetci'}>Panel</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/giris">Giriş Yap</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/iletisim">Bilgi Al</Link>
                </Button>
              </>
            )}

            <button type="button" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && !user && (
          <div className="md:hidden py-4 space-y-2">
            <Link href="/" className="block w-full text-left px-4 py-2 hover:bg-muted">
              Anasayfa
            </Link>
            <Link href="/hizmetler" className="block w-full text-left px-4 py-2 hover:bg-muted">
              Hizmetlerimiz
            </Link>
            <Link href="/paketler" className="block w-full text-left px-4 py-2 hover:bg-muted">
              Paketler
            </Link>
            <Link href="/haberler" className="block w-full text-left px-4 py-2 hover:bg-muted">
              Bizden Haberler
            </Link>
            <Link href="/iletisim" className="block w-full text-left px-4 py-2 hover:bg-muted">
              İletişim
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
