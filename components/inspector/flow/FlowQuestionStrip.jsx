'use client'

import { useEffect, useState } from 'react'
import { Check, CircleDot, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

/**
 * Aktif kategorideki sorular — yatay kaydırma (Embla); cevaplı / geçildi / şu an.
 */
export function FlowQuestionStrip({
  questions,
  answers,
  skippedSet,
  currentQuestionIndex,
  onSelectQuestion,
  categoryName,
}) {
  const [api, setApi] = useState(null)

  useEffect(() => {
    if (!api || !questions?.length) return
    api.scrollTo(Math.min(currentQuestionIndex, questions.length - 1), true)
  }, [api, currentQuestionIndex, questions?.length])

  if (!questions?.length) return null

  return (
    <div className="border-b border-zinc-200 bg-white px-2 py-3 sm:px-4">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <p className="truncate text-xs font-semibold text-zinc-700">
          Bu kategorideki sorular
          {categoryName ? (
            <span className="font-normal text-zinc-500"> — {categoryName}</span>
          ) : null}
        </p>
        <p className="shrink-0 text-[10px] text-zinc-500">Kaydır veya oklar</p>
      </div>
      <Carousel
        key={categoryName || 'cat'}
        setApi={setApi}
        opts={{
          align: 'center',
          loop: false,
          dragFree: true,
          containScroll: 'trimSnaps',
        }}
        className="w-full"
      >
        <div className="flex items-center gap-1 sm:gap-2">
          <CarouselPrevious
            type="button"
            variant="outline"
            size="icon"
            className="static h-9 w-9 shrink-0 translate-y-0 rounded-xl border-zinc-200"
          />
          <div className="min-w-0 flex-1">
            <CarouselContent className="-ml-1.5 sm:-ml-2">
              {questions.map((q, qi) => {
                const hasAnswer = Boolean(answers[q.id]?.answer)
                const isSkipped = skippedSet.has(q.id)
                const isCurrent = qi === currentQuestionIndex
                let state = 'open'
                if (hasAnswer) state = 'answered'
                else if (isSkipped) state = 'skipped'

                return (
                  <CarouselItem key={q.id} className="basis-auto pl-1.5 sm:pl-2">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isCurrent}
                      aria-label={`Soru ${qi + 1}${hasAnswer ? ', cevaplandı' : isSkipped ? ', geçildi' : ', bekliyor'}`}
                      onClick={() => onSelectQuestion(qi)}
                      className={cn(
                        'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 px-3 text-sm font-bold transition-all touch-manipulation',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
                        isCurrent &&
                          'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400/40',
                        !isCurrent && state === 'answered' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
                        !isCurrent && state === 'skipped' && 'border-amber-200 bg-amber-50/80 text-amber-900',
                        !isCurrent &&
                          state === 'open' &&
                          'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100',
                      )}
                    >
                      {state === 'answered' && !isCurrent && (
                        <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                      )}
                      {state === 'skipped' && !hasAnswer && !isCurrent && (
                        <SkipForward className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden />
                      )}
                      {isCurrent && <CircleDot className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />}
                      <span>{qi + 1}</span>
                    </button>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
          </div>
          <CarouselNext
            type="button"
            variant="outline"
            size="icon"
            className="static h-9 w-9 shrink-0 translate-y-0 rounded-xl border-zinc-200"
          />
        </div>
      </Carousel>
    </div>
  )
}
