'use client'

import { ListOrdered } from 'lucide-react'

export function FlowFinishSkippedHints({ skippedNeedingAnswerCount, skippedWithAnswerCount }) {
  return (
    <>
      {skippedNeedingAnswerCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-900">
          <strong>{skippedNeedingAnswerCount}</strong> geçilmiş sorunun cevabı yok. Soru listesi / Geçilenler
          üzerinden tamamlayabilirsiniz.
        </div>
      )}
      {skippedWithAnswerCount > 0 && (
        <div className="bg-sky-50 border border-sky-200 p-3 rounded-lg text-sm text-sky-900">
          <strong>{skippedWithAnswerCount}</strong> geçilmiş soruda cevap kaydı var; listeden düşmesi için o
          soruda <strong>Sonraki soru</strong> ile ilerlemeniz gerekir.
        </div>
      )}
    </>
  )
}
