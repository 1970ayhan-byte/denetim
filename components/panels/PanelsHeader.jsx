'use client'

import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { cn } from '@/lib/utils'

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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user && (
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-xs text-zinc-500">Oturum</p>
              <p className="truncate text-sm font-semibold text-zinc-900 max-w-[10rem] md:max-w-[14rem]">
                {user.name}
              </p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-10 min-h-[44px] shrink-0 touch-manipulation rounded-xl border-zinc-200 bg-white px-3 font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 sm:px-4"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 sm:mr-1.5" aria-hidden />
            <span className="hidden sm:inline">Çıkış</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
