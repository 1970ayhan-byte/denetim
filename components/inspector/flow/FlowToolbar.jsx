'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, ListOrdered, Pause, X } from 'lucide-react'

export function FlowToolbar({
  schoolName,
  categoryName,
  autoSaving,
  onOpenListAll,
  onOpenListSkipped,
  skippedNeedingAnswerCount,
  onPause,
  onCancel,
}) {
  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">{schoolName}</h2>
            <p className="text-sm text-muted-foreground">{categoryName}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {autoSaving && (
              <span className="text-xs text-green-600 animate-pulse">💾 Kaydediliyor...</span>
            )}
            <Button variant="outline" size="sm" onClick={onOpenListAll}>
              <ClipboardList className="h-4 w-4 mr-1" />
              Soru listesi
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenListSkipped}
              className="text-amber-800 border-amber-300 hover:bg-amber-50"
            >
              <ListOrdered className="h-4 w-4 mr-1" />
              Geçilenler
              {skippedNeedingAnswerCount > 0 && (
                <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 h-5 min-w-5 text-xs">
                  {skippedNeedingAnswerCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onPause}
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <Pause className="h-4 w-4 mr-1" />
              Ara Ver
            </Button>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
