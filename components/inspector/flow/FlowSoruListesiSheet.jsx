'use client'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { ListOrdered } from 'lucide-react'

export function FlowSoruListesiSheet({
  open,
  onOpenChange,
  skippedRowsAll,
  currentQuestionId,
  onSelectQuestion,
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-left">
            <ListOrdered className="h-5 w-5 shrink-0" aria-hidden />
            Geçilenler
          </SheetTitle>
          <SheetDescription className="text-left">
            Geçtiğiniz sorular burada listelenir; soruya dokunarak geri dönebilirsiniz.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
          {skippedRowsAll.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz geçilmiş soru yok.</p>
          ) : (
            skippedRowsAll.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => onSelectQuestion(row.id)}
                className={`w-full text-left rounded-lg border p-3 hover:bg-muted/60 transition-colors touch-manipulation ${
                  row.id === currentQuestionId ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex flex-wrap gap-1.5 mb-1">
                  <Badge variant="outline" className="border-amber-400 text-amber-950 bg-amber-50">
                    Geçildi
                  </Badge>
                  {row.hasAnswer ? (
                    <Badge className="border-transparent bg-green-600 text-white">Cevap kayıtlı</Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-600 text-amber-900 font-normal">
                      Cevap yok
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{row.category}</p>
                <p className="text-sm font-medium line-clamp-3">{row.text}</p>
                {row.answerLabel ? (
                  <p className="text-xs text-green-700 mt-1">Son seçim: {row.answerLabel}</p>
                ) : null}
                {row.hasAnswer ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Listeden kalkması için bu soruda ilerleyin.
                  </p>
                ) : null}
              </button>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
