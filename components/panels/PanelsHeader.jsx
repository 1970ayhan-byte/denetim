'use client'

import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { cn } from '@/lib/utils'

function initialsFromName(name) {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function PanelsHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const panelHint =
    pathname?.startsWith('/denetci') ? 'Denetçi paneli' : 'Panel'

  const denetimAkis =
    typeof pathname === 'string' && pathname.includes('/denetci/denetim/')

  return (
    <header
      className={cn(
        denetimAkis ? 'relative z-10' : 'sticky top-0 z-50',
        'border-b border-zinc-200/90',
        'bg-gradient-to-b from-white to-zinc-50/95 shadow-sm shadow-zinc-900/[0.04]',
        'supports-[backdrop-filter]:backdrop-blur-md supports-[backdrop-filter]:bg-white/85',
      )}
    >
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-3 sm:px-5 md:px-6">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/70 to-amber-500/0"
          aria-hidden
        />

        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-600/25 ring-1 ring-amber-600/20 sm:h-10 sm:w-10"
            aria-hidden
          >
            <ShieldCheck className="h-[1.15rem] w-[1.15rem] sm:h-5 sm:w-5" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-tight text-zinc-900 sm:text-sm md:text-base">
              Sarımeşe Danışmanlık
            </p>
            <p className="truncate text-[11px] font-medium uppercase tracking-wide text-amber-800/90 sm:text-xs">
              {panelHint}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 min-h-[44px] max-w-[min(100vw-10rem,18rem)] shrink-0 touch-manipulation gap-2 rounded-xl border-zinc-200 bg-white px-2.5 shadow-sm hover:bg-zinc-50 sm:px-3"
                  aria-label="Hesap menüsü"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-xs font-bold text-white shadow-sm ring-1 ring-amber-600/30"
                    aria-hidden
                  >
                    {initialsFromName(user.name)}
                  </span>
                  <span className="min-w-0 flex-1 text-left sm:max-w-[11rem]">
                    <span className="block truncate text-xs font-semibold leading-tight text-zinc-900">
                      {user.name}
                    </span>
                    <span className="hidden text-[11px] text-zinc-500 sm:block">
                      Hesabım
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-xl border-zinc-200 p-1 shadow-lg">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-start gap-3 py-1">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-sm font-bold text-amber-900">
                      {initialsFromName(user.name)}
                    </span>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="truncate text-sm font-semibold text-zinc-900">{user.name}</p>
                      {user.phone ? (
                        <p className="truncate text-xs text-zinc-500">{user.phone}</p>
                      ) : null}
                      <p className="text-[11px] font-medium uppercase tracking-wide text-amber-800/90">
                        {panelHint}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 rounded-lg text-red-600 focus:bg-red-50 focus:text-red-700"
                  onSelect={(e) => {
                    e.preventDefault()
                    handleLogout()
                  }}
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Çıkış yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </header>
  )
}
