'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { FlowFinishSkippedHints } from './FlowFinishSkippedHints'

export function FlowFinishDialog({
  open,
  onOpenChange,
  schoolName,
  answeredCount,
  totalAllQuestions,
  skippedNeedingAnswerCount,
  skippedWithAnswerCount,
  onConfirmComplete,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            Denetimi Tamamla
          </DialogTitle>
          <DialogDescription>
            Bu işlem geri alınamaz. Denetimi tamamladıktan sonra cevaplar düzenlenemez.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Özet</h4>
            <div className="text-sm space-y-1">
              <p>
                Kurum: <strong>{schoolName}</strong>
              </p>
              <p>
                Cevaplanan Soru:{' '}
                <strong>
                  {answeredCount} / {totalAllQuestions}
                </strong>
              </p>
            </div>
          </div>

          {answeredCount < totalAllQuestions && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Dikkat: Bazı sorular henüz cevaplanmamış.
              </p>
            </div>
          )}

          <FlowFinishSkippedHints
            skippedNeedingAnswerCount={skippedNeedingAnswerCount}
            skippedWithAnswerCount={skippedWithAnswerCount}
          />

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Geri Dön
            </Button>
            <Button onClick={onConfirmComplete} className="flex-1 bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Denetimi Tamamla
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
