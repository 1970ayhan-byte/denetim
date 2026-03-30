'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { LogOut, Menu, Shield } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { ADMIN_NAV } from '@/components/admin/adminNavConfig'
import { cn } from '@/lib/utils'

function NavLinks({ onNavigate, className }) {
  const pathname = usePathname()
  return (
    <nav className={cn('flex flex-col gap-0.5', className)}>
      {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/admin/dashboard' && pathname?.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
              active
                ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/5 text-amber-100 shadow-[inset_3px_0_0_0] shadow-amber-500'
                : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-100',
            )}
          >
            <Icon
              className={cn(
                'h-[18px] w-[18px] shrink-0 transition-colors',
                active ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300',
              )}
            />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminShell({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const current = ADMIN_NAV.find((n) => pathname === n.href || (n.href !== '/admin/dashboard' && pathname?.startsWith(n.href)))
  const pageTitle = current?.label ?? 'Yönetim'

  const closeMobile = () => setMobileOpen(false)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen flex bg-[#0c0c0f]">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
        <div className="p-5 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-500/30">
              <Shield className="h-5 w-5 text-amber-400" aria-hidden />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 leading-snug">
                Sarımeşe Danışmanlık
              </p>
              <p className="text-sm font-semibold text-zinc-100 leading-tight">Yönetim</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 pt-4 pb-5">
          <NavLinks />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-zinc-100">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-14 md:h-16 items-center gap-3 border-b border-zinc-200/80 bg-white/90 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden shrink-0 -ml-1" aria-label="Menü">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] border-zinc-800 bg-zinc-950 p-0 text-zinc-100">
              <div className="p-5 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15">
                    <Shield className="h-4 w-4 text-amber-400" />
                  </div>
                  <span className="font-semibold text-zinc-100">Sarımeşe Danışmanlık</span>
                </div>
              </div>
              <div className="p-3">
                <NavLinks onNavigate={closeMobile} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-semibold tracking-tight text-zinc-900 truncate">{pageTitle}</h1>
            <p className="text-xs text-zinc-500 hidden sm:block truncate">Yönetim konsolu</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-sm text-zinc-600 max-w-[140px] truncate hidden sm:inline" title={user?.name}>
              {user?.name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-zinc-300">
              <LogOut className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Çıkış</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
