'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, XCircle, X, Camera } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FlowQuestionPanel({
  currentQuestion,
  localAnswer,
  setLocalAnswer,
  localNote,
  setLocalNote,
  localPhotos,
  setLocalPhotos,
  uploading,
  onPhotoUpload,
}) {
  return (
    <Card className="rounded-2xl border-zinc-200/90 shadow-lg shadow-zinc-900/[0.06] overflow-hidden">
      <CardContent className="p-4 sm:p-6 md:p-8 space-y-5 md:space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/90 mb-2">
            Soru metni
          </p>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 leading-snug">
            {currentQuestion.question}
          </h3>
          {currentQuestion.regulationText && (
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 mt-4">
              <p className="text-xs font-bold text-sky-900 uppercase tracking-wide mb-1.5">Yönetmelik</p>
              <p className="text-sm sm:text-[15px] text-sky-950 leading-relaxed">{currentQuestion.regulationText}</p>
            </div>
          )}
        </div>

        {currentQuestion.imageUrl && (
          <img
            src={currentQuestion.imageUrl}
            alt="Soru görseli"
            className="w-full max-h-[min(50vh,420px)] object-contain rounded-xl border border-zinc-200 bg-zinc-50"
          />
        )}

        <div className="space-y-3">
          <Label className="text-base font-bold text-zinc-900">Cevap</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { value: 'uygun', label: 'Uygun', color: 'border-emerald-500 bg-emerald-50 text-emerald-950', icon: CheckCircle2 },
              { value: 'uygun_degil', label: 'Uygun değil', color: 'border-red-500 bg-red-50 text-red-950', icon: XCircle },
            ].map((option) => {
              const selected = localAnswer === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLocalAnswer(option.value)}
                  className={cn(
                    'min-h-[52px] sm:min-h-[56px] rounded-xl border-2 p-4 text-left flex items-center gap-3 transition-all touch-manipulation',
                    selected
                      ? `${option.color} shadow-sm ring-2 ring-offset-2 ring-amber-400/50`
                      : 'bg-white border-zinc-200 hover:border-zinc-300 active:bg-zinc-50',
                  )}
                >
                  <option.icon className={cn('h-7 w-7 shrink-0', selected ? '' : 'text-zinc-400')} />
                  <span className="font-bold text-base sm:text-lg">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-800">Not (isteğe bağlı)</Label>
          <Textarea
            value={localNote}
            onChange={(e) => setLocalNote(e.target.value)}
            placeholder="Varsa ek açıklama yazın…"
            rows={3}
            className="min-h-[88px] text-base sm:text-[15px] rounded-xl border-zinc-200"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-800">Fotoğraf</Label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPhotoUpload}
            disabled={uploading}
            className="hidden"
            id="flow-photo-upload"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full min-h-[48px] rounded-xl border-zinc-200 touch-manipulation"
            disabled={uploading}
            onClick={() => document.getElementById('flow-photo-upload')?.click()}
          >
            <Camera className="h-5 w-5 mr-2" />
            {uploading ? 'Yükleniyor…' : 'Fotoğraf ekle veya çek'}
          </Button>

          {localPhotos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
              {localPhotos.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200">
                  <img src={photo} alt={`Fotoğraf ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setLocalPhotos(localPhotos.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 touch-manipulation shadow"
                    aria-label="Fotoğrafı kaldır"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {currentQuestion.penaltyType && localAnswer === 'uygun_degil' && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-bold text-red-900 mb-1">Ceza / yaptırım bilgisi</p>
            <p className="text-sm text-red-900 leading-relaxed">{currentQuestion.penaltyType}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
