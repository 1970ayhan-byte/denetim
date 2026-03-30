'use client'

import { cn } from '@/lib/utils'

/**
 * Sayfa geçişleri ve Suspense için ortak yükleme görünümü.
 */
export function RouteLoading({ className, fullScreen = false }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-5 px-6',
        fullScreen ? 'min-h-screen' : 'min-h-[min(70vh,560px)] w-full',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label="Yükleniyor"
    >
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-2 border-amber-500/20"
          aria-hidden
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 border-r-amber-500/40 animate-spin"
          style={{ animationDuration: '0.85s' }}
          aria-hidden
        />
        <div
          className="h-6 w-6 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 opacity-90 shadow-md shadow-amber-900/20"
          aria-hidden
        />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold tracking-tight text-zinc-800">Sarımeşe Danışmanlık</p>
        <p className="text-xs text-zinc-500">Yükleniyor…</p>
      </div>
    </div>
  )
}
