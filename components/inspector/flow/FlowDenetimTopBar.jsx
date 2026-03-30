'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ListOrdered, Pause, LayoutList, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FlowDenetimTopBar({
  schoolName,
  categoryLabel,
  questionPositionLabel,
  autoSaving,
  overallAnswered,
  overallTotal,
  onOpenListSkipped,
  skippedNeedingAnswerCount,
  onPause,
  onCancel,
}) {
  const pct = overallTotal > 0 ? Math.round((overallAnswered / overallTotal) * 100) : 0

  return (
    <div
      className={cn(
        'shrink-0 w-full border-b border-zinc-200/90 bg-white',
        'shadow-sm shadow-zinc-900/[0.03]',
      )}
    >
      <div className="min-w-0 w-full px-3 py-2 sm:px-4 sm:py-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800/90">Denetim</p>
              {autoSaving ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
                  <Loader2 className="h-3 w-3 shrink-0 animate-spin" aria-hidden />
                  Kaydediliyor…
                </span>
              ) : null}
            </div>
            <h1 className="truncate text-sm font-bold leading-tight text-zinc-900 sm:text-base">
              {schoolName}
            </h1>
            <p className="truncate text-[11px] text-zinc-600 sm:text-xs">
              <span className="font-medium text-zinc-800">{categoryLabel}</span>
              <span className="text-zinc-400"> · </span>
              {questionPositionLabel}
            </p>
          </div>

          <div
            role="toolbar"
            aria-label="Denetim araçları"
            className="flex w-full min-w-0 flex-wrap items-center gap-1.5 sm:w-auto sm:justify-end sm:gap-2"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                'h-9 min-h-9 shrink-0 gap-1.5 rounded-lg border-amber-200/80 bg-amber-50/50 px-2.5 text-xs font-medium text-zinc-900 sm:px-3 sm:text-sm',
                'hover:bg-amber-50 hover:border-amber-300 touch-manipulation',
              )}
              onClick={onOpenListSkipped}
            >
              <ListOrdered className="h-3.5 w-3.5 shrink-0 text-amber-700 sm:h-4 sm:w-4" aria-hidden />
              Geçilen
              {skippedNeedingAnswerCount > 0 ? (
                <Badge className="h-4 min-w-[1rem] border-0 bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {skippedNeedingAnswerCount > 9 ? '9+' : skippedNeedingAnswerCount}
                </Badge>
              ) : null}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 min-h-9 shrink-0 gap-1.5 rounded-lg border-orange-200 bg-orange-50/60 px-2.5 text-xs font-medium text-zinc-900 hover:bg-orange-50 touch-manipulation sm:px-3 sm:text-sm"
              onClick={onPause}
            >
              <Pause className="h-3.5 w-3.5 shrink-0 text-orange-700 sm:h-4 sm:w-4" aria-hidden />
              Kaydet ve çık
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 min-h-9 shrink-0 gap-1.5 rounded-lg px-2.5 text-xs font-medium text-zinc-900 touch-manipulation sm:px-3 sm:text-sm"
              onClick={onCancel}
            >
              <LayoutList className="h-3.5 w-3.5 shrink-0 text-zinc-600 sm:h-4 sm:w-4" aria-hidden />
              Listeye dön
            </Button>
          </div>
        </div>

        <div className="mt-2 min-w-0 sm:mt-2">
          <div className="mb-0.5 flex min-w-0 justify-between gap-2 text-[10px] text-zinc-600 sm:text-[11px]">
            <span className="shrink-0 font-medium text-zinc-700">İlerleme</span>
            <span className="truncate text-right font-medium tabular-nums text-zinc-800">
              {overallAnswered}/{overallTotal} · %{pct}
            </span>
          </div>
          <div className="h-1 w-full max-w-full overflow-hidden rounded-full bg-zinc-200 sm:h-1.5">
            <div
              className="h-full max-w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
