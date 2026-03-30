'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle2 } from 'lucide-react'
import { FlowFinishSkippedHints } from './FlowFinishSkippedHints'

export function FlowBlockingFinish({
  schoolName,
  answeredCount,
  totalAllQuestions,
  skippedNeedingAnswerCount,
  skippedWithAnswerCount,
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
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onBack}>
              Geri Dön
            </Button>
            <Button onClick={onConfirmComplete} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Denetimi Tamamla
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
