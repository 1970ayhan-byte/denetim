'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Mobil / tablet: yatay kategori şeridi */
export function FlowCategoryChips({
  categories,
  statsList,
  currentCategoryIndex,
  onSelectCategory,
}) {
  return (
    <div className="border-b border-zinc-200 bg-zinc-50/80 px-2 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 px-2 mb-1.5">
        Kategori seçin
      </p>
      <div
        className="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-1 snap-x snap-mandatory [scrollbar-width:thin]"
        role="tablist"
        aria-label="Kategoriler"
      >
        {categories.map((cat, i) => {
          const stats = statsList[i]
          const active = i === currentCategoryIndex
          return (
            <button
              key={cat.id || `chip-${i}`}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelectCategory(i)}
              className={cn(
                'snap-start shrink-0 rounded-xl border-2 px-3 py-2 min-h-[44px] max-w-[200px] text-left transition-colors touch-manipulation sm:max-w-[220px]',
                active
                  ? 'border-amber-500 bg-amber-50 border-opacity-100'
                  : 'border-zinc-200 bg-white',
                stats.isComplete && !active && 'border-emerald-200 bg-emerald-50/40',
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold',
                    active ? 'bg-amber-600 text-white' : 'bg-zinc-200 text-zinc-700',
                  )}
                >
                  {i + 1}
                  {stats.isComplete && (
                    <Check
                      className="absolute -bottom-0.5 -right-1 h-3 w-3 text-emerald-600 bg-white rounded-full border border-emerald-200"
                      aria-hidden
                    />
                  )}
                </span>
                <span className="text-xs font-semibold text-zinc-900 line-clamp-2 leading-tight">
                  {cat.name}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1 tabular-nums pl-8">
                {stats.resolved}/{stats.total}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
