'use client'

import { Check, CircleDot, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Aktif kategorideki sorular — numara ile; cevaplı / geçildi / şu an.
 */
export function FlowQuestionStrip({
  questions,
  answers,
  skippedSet,
  currentQuestionIndex,
  onSelectQuestion,
  categoryName,
}) {
  if (!questions?.length) return null

  return (
    <div className="border-b border-zinc-200 bg-white px-3 py-3 sm:px-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-xs font-semibold text-zinc-700 truncate">
          Bu kategorideki sorular
          {categoryName ? (
            <span className="font-normal text-zinc-500"> — {categoryName}</span>
          ) : null}
        </p>
      </div>
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label={`${categoryName || 'Kategori'} soruları`}
      >
        {questions.map((q, qi) => {
          const hasAnswer = Boolean(answers[q.id]?.answer)
          const isSkipped = skippedSet.has(q.id)
          const isCurrent = qi === currentQuestionIndex
          let state = 'open'
          if (hasAnswer) state = 'answered'
          else if (isSkipped) state = 'skipped'

          return (
            <button
              key={q.id}
              type="button"
              role="tab"
              aria-selected={isCurrent}
              aria-label={`Soru ${qi + 1}${hasAnswer ? ', cevaplandı' : isSkipped ? ', geçildi' : ', bekliyor'}`}
              onClick={() => onSelectQuestion(qi)}
              className={cn(
                'inline-flex items-center justify-center gap-1 min-w-[44px] h-11 px-3 rounded-xl border-2 text-sm font-bold transition-all touch-manipulation',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
                isCurrent && 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400/40',
                !isCurrent && state === 'answered' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
                !isCurrent && state === 'skipped' && 'border-amber-200 bg-amber-50/80 text-amber-900',
                !isCurrent && state === 'open' && 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100',
              )}
            >
              {state === 'answered' && !isCurrent && <Check className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden />}
              {state === 'skipped' && !hasAnswer && !isCurrent && (
                <SkipForward className="h-3.5 w-3.5 text-amber-700 shrink-0" aria-hidden />
              )}
              {isCurrent && <CircleDot className="h-4 w-4 text-amber-600 shrink-0" aria-hidden />}
              <span>{qi + 1}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
