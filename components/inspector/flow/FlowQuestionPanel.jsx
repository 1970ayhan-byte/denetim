'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, XCircle, X, Camera } from 'lucide-react'

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
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-2">{currentQuestion.question}</h3>
          {currentQuestion.regulationText && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
              <p className="text-sm font-semibold text-blue-900 mb-1">Yönetmelik:</p>
              <p className="text-sm text-blue-800">{currentQuestion.regulationText}</p>
            </div>
          )}
        </div>

        {currentQuestion.imageUrl && (
          <img src={currentQuestion.imageUrl} alt="Soru görseli" className="w-full rounded-lg" />
        )}

        <div className="space-y-3">
          <Label className="text-base font-semibold">Cevabınız:</Label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { value: 'uygun', label: 'UYGUN', color: 'bg-green-50 border-green-500 text-green-900', icon: CheckCircle2 },
              { value: 'uygun_degil', label: 'UYGUN DEĞİL', color: 'bg-red-50 border-red-500 text-red-900', icon: XCircle },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLocalAnswer(option.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                  localAnswer === option.value
                    ? `${option.color} border-opacity-100`
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <option.icon className="h-6 w-6" />
                <span className="font-semibold text-lg">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Not (Opsiyonel)</Label>
          <Textarea
            value={localNote}
            onChange={(e) => setLocalNote(e.target.value)}
            placeholder="Varsa ek açıklama yazın..."
            rows={3}
          />
        </div>

        <div>
          <Label>Fotoğraf Ekle</Label>
          <div className="mt-2 space-y-3">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onPhotoUpload}
              disabled={uploading}
              className="hidden"
              id="flow-photo-upload"
            />
            <label htmlFor="flow-photo-upload">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploading}
                onClick={() => document.getElementById('flow-photo-upload')?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                {uploading ? 'Yükleniyor...' : 'Fotoğraf Çek'}
              </Button>
            </label>

            {localPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {localPhotos.map((photo, i) => (
                  <div key={i} className="relative aspect-square">
                    <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => setLocalPhotos(localPhotos.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {currentQuestion.penaltyType && localAnswer === 'uygun_degil' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-red-900 mb-1">⚠️ Ceza Gerekliliği:</p>
            <p className="text-sm text-red-800">{currentQuestion.penaltyType}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
