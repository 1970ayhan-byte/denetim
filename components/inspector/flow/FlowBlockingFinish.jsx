'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { FlowFinishSkippedHints } from './FlowFinishSkippedHints'

export function FlowBlockingFinish({
  schoolName,
  answeredCount,
  totalAllQuestions,
  skippedNeedingAnswerCount,
  skippedWithAnswerCount,
  canCompleteInspection = true,
  showUnansweredWarning = false,
  onBack,
  onConfirmComplete,
}) {
  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center">
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Denetimi Tamamla
            </DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. Denetimi tamamladıktan sonra cevaplar düzenlenemez.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">Özet</h4>
            <p className="text-sm">
              Kurum: <span className="font-medium">{schoolName}</span>
            </p>
            <p className="text-sm">
              Cevaplanan Soru:{' '}
              <span className="font-medium">
                {answeredCount} / {totalAllQuestions}
              </span>
            </p>
          </div>
          <FlowFinishSkippedHints
            skippedNeedingAnswerCount={skippedNeedingAnswerCount}
            skippedWithAnswerCount={skippedWithAnswerCount}
          />
          {showUnansweredWarning && (
            <div className="flex gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>
                Bazı sorular ne cevaplandı ne de geçildi; tamamlamak için eksikleri kapatın.
              </p>
            </div>
          )}
          {!canCompleteInspection && (
            <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>
                Tüm sorular ya cevaplanmalı ya da <strong>Geç</strong> ile işaretlenmelidir.
              </p>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onBack}>
              Geri Dön
            </Button>
            <Button
              disabled={!canCompleteInspection}
              onClick={onConfirmComplete}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Denetimi Tamamla
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
