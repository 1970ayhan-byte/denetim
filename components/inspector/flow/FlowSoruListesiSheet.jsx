'use client'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ClipboardList } from 'lucide-react'

export function FlowSoruListesiSheet({
  open,
  onOpenChange,
  soruListesiTab,
  onTabChange,
  allQuestionsRows,
  skippedRowsAll,
  currentQuestionId,
  onSelectQuestion,
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Soru listesi
          </SheetTitle>
          <SheetDescription>
            Tüm soruların durumunu görün; Geçilenler sekmesinde geçtiğiniz sorular (cevaplı olsa da)
            listelenir.
          </SheetDescription>
        </SheetHeader>
        <Tabs
          value={soruListesiTab}
          onValueChange={onTabChange}
          className="mt-4 flex flex-col flex-1 min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2 shrink-0">
            <TabsTrigger value="all">Tüm sorular ({allQuestionsRows.length})</TabsTrigger>
            <TabsTrigger value="skipped">Geçilenler ({skippedRowsAll.length})</TabsTrigger>
          </TabsList>
          <TabsContent
            value="all"
            className="mt-4 flex-1 min-h-0 max-h-[70vh] overflow-y-auto pr-1 space-y-2"
          >
            {allQuestionsRows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => onSelectQuestion(row.id)}
                className={`w-full text-left rounded-lg border p-3 hover:bg-muted/60 transition-colors ${
                  row.id === currentQuestionId ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex flex-wrap gap-1.5 mb-1">
                  <Badge
                    variant={
                      row.hasAnswer && !row.isSkipped
                        ? 'default'
                        : row.isSkipped
                          ? 'secondary'
                          : 'outline'
                    }
                    className={
                      row.isSkipped && !row.hasAnswer
                        ? 'bg-amber-100 text-amber-950 border-amber-300'
                        : row.hasAnswer && row.isSkipped
                          ? 'bg-green-700'
                          : ''
                    }
                  >
                    {row.status}
                  </Badge>
                  {row.answerLabel ? (
                    <Badge variant="outline" className="text-xs font-normal">
                      {row.answerLabel}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">{row.categoryName}</p>
                <p className="text-sm font-medium line-clamp-3">{row.text}</p>
              </button>
            ))}
          </TabsContent>
          <TabsContent
            value="skipped"
            className="mt-4 flex-1 min-h-0 max-h-[70vh] overflow-y-auto pr-1 space-y-2"
          >
            {skippedRowsAll.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz geçilmiş soru yok.</p>
            ) : (
              skippedRowsAll.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => onSelectQuestion(row.id)}
                  className={`w-full text-left rounded-lg border p-3 hover:bg-muted/60 transition-colors ${
                    row.id === currentQuestionId ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    <Badge variant="outline" className="border-amber-400 text-amber-950 bg-amber-50">
                      Geçildi
                    </Badge>
                    {row.hasAnswer ? (
                      <Badge className="bg-green-600 hover:bg-green-600">Cevap kayıtlı</Badge>
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
                      Listeden kalkması için bu soruda Sonraki soru ile ilerleyin.
                    </p>
                  ) : null}
                </button>
              ))
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
