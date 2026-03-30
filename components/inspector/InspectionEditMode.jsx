'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, X, AlertCircle, ChevronRight, Camera } from 'lucide-react'
import { toast as sonnerToast } from 'sonner'


export function InspectionEditMode({ inspection, categories, answers, setAnswers, onCancel, token }) {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [localAnswer, setLocalAnswer] = useState('')
  const [localNote, setLocalNote] = useState('')
  const [localPhotos, setLocalPhotos] = useState([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Kategorileri soru sayısına göre filtrele
  const categoriesWithQuestions = categories.filter(cat => cat.questions?.length > 0)

  // Soru seçildiğinde mevcut cevabı yükle
  useEffect(() => {
    if (selectedQuestion) {
      const savedAnswer = answers[selectedQuestion.id]
      setLocalAnswer(savedAnswer?.answer || '')
      setLocalNote(savedAnswer?.note || '')
      setLocalPhotos(savedAnswer?.photos || [])
    }
  }, [selectedQuestion, answers])

  // Fotoğraf yükleme
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('photo', file)
    
    try {
      const response = await fetch('/api/inspector/inspection/upload-photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const data = await response.json()
      if (data.url) {
        setLocalPhotos([...localPhotos, data.url])
        sonnerToast.success('Fotoğraf yüklendi')
      } else {
        throw new Error('URL alınamadı')
      }
    } catch (error) {
      console.error('Upload error:', error)
      sonnerToast.error('Fotoğraf yüklenemedi')
    } finally {
      setUploading(false)
      e.target.value = '' // Reset input
    }
  }

  // Fotoğraf silme
  const handlePhotoDelete = (index) => {
    setLocalPhotos(localPhotos.filter((_, i) => i !== index))
    sonnerToast.success('Fotoğraf kaldırıldı')
  }

  // Cevabı kaydet
  const saveAnswer = async () => {
    if (!selectedQuestion || !localAnswer) {
      sonnerToast.error('Lütfen bir cevap seçin')
      return
    }
    
    setSaving(true)
    try {
      const response = await fetch('/api/inspector/inspection/answer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          inspectionId: inspection.id,
          questionId: selectedQuestion.id,
          answer: localAnswer,
          note: localNote,
          photos: localPhotos
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Kaydetme hatası')
      }
      
      // Update local state
      setAnswers({
        ...answers,
        [selectedQuestion.id]: { answer: localAnswer, note: localNote, photos: localPhotos }
      })
      
      sonnerToast.success('Cevap güncellendi')
      setSelectedQuestion(null)
    } catch (error) {
      sonnerToast.error(error.message || 'Kaydetme hatası')
    } finally {
      setSaving(false)
    }
  }

  // Kategori listesi
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Denetim Düzenleme</h1>
              <p className="text-muted-foreground">{inspection.schoolName}</p>
            </div>
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Kapat
            </Button>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
            <p className="text-sm text-amber-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <strong>Düzenleme Modu:</strong> Sadece cevap, not ve fotoğraf değiştirilebilir. Değişiklikler rapora yansır.
            </p>
          </div>
          
          <h2 className="text-lg font-semibold mb-4">Kategori Seçin</h2>
          <div className="grid gap-3">
            {categoriesWithQuestions.map((cat, index) => {
              const answeredInCategory = cat.questions.filter(q => answers[q.id]).length
              const totalInCategory = cat.questions.length
              
              return (
                <Card 
                  key={cat.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCategory(cat)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium">{cat.name}</h3>
                        <p className="text-sm text-muted-foreground">{totalInCategory} soru</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {answeredInCategory} / {totalInCategory} cevaplandı
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Soru listesi
  if (selectedCategory && !selectedQuestion) {
    return (
      <div className="min-h-screen bg-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Button variant="ghost" onClick={() => setSelectedCategory(null)} className="mb-2">
                ← Kategorilere Dön
              </Button>
              <h1 className="text-2xl font-bold">{selectedCategory.name}</h1>
              <p className="text-muted-foreground">{inspection.schoolName}</p>
            </div>
          </div>
          
          <h2 className="text-lg font-semibold mb-4">Soru Seçin</h2>
          <div className="grid gap-3">
            {selectedCategory.questions.map((question, index) => {
              const savedAnswer = answers[question.id]
              const photoCount = savedAnswer?.photos?.length || 0
              
              return (
                <Card 
                  key={question.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedQuestion(question)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-muted rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium line-clamp-2">{question.question}</p>
                          {savedAnswer && (
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                              <Badge className={
                                savedAnswer.answer === 'uygun' ? 'bg-green-100 text-green-800' :
                                savedAnswer.answer === 'uygun_degil' ? 'bg-red-100 text-red-800' :
                                'bg-muted text-muted-foreground'
                              }>
                                {savedAnswer.answer === 'uygun' ? 'UYGUN' :
                                 savedAnswer.answer === 'uygun_degil' ? 'UYGUN DEĞİL' : '—'}
                              </Badge>
                              {savedAnswer.note && (
                                <span className="text-xs text-muted-foreground">📝 Not var</span>
                              )}
                              {photoCount > 0 && (
                                <span className="text-xs text-muted-foreground">📷 {photoCount} fotoğraf</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Soru düzenleme
  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setSelectedQuestion(null)} className="mb-2">
            ← Sorulara Dön
          </Button>
          <h1 className="text-xl font-bold">{selectedCategory.name}</h1>
          <p className="text-muted-foreground">{inspection.schoolName}</p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            {/* Soru */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">{selectedQuestion.question}</h2>
              {selectedQuestion.regulationText && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm">
                  <strong className="text-blue-900">Yönetmelik:</strong>
                  <p className="text-blue-800 mt-1">{selectedQuestion.regulationText}</p>
                </div>
              )}
            </div>
            
            {/* Cevap Seçenekleri */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button
                variant={localAnswer === 'uygun' ? 'default' : 'outline'}
                className={`h-14 ${localAnswer === 'uygun' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => setLocalAnswer('uygun')}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                UYGUN
              </Button>
              <Button
                variant={localAnswer === 'uygun_degil' ? 'default' : 'outline'}
                className={`h-14 ${localAnswer === 'uygun_degil' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                onClick={() => setLocalAnswer('uygun_degil')}
              >
                <XCircle className="h-5 w-5 mr-2" />
                UYGUN DEĞİL
              </Button>
            </div>
            
            {/* Not */}
            <div className="mb-6">
              <Label>Not (Opsiyonel)</Label>
              <Textarea
                value={localNote}
                onChange={(e) => setLocalNote(e.target.value)}
                placeholder="Eksiklik veya öneri notu ekleyin..."
                rows={3}
                className="mt-2"
              />
            </div>
            
            {/* Fotoğraf Yükleme */}
            <div className="mb-6">
              <Label className="mb-2 block">Fotoğraflar</Label>
              
              {/* Mevcut Fotoğraflar */}
              {localPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {localPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo} 
                        alt={`Fotoğraf ${index + 1}`} 
                        className="w-full aspect-square object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handlePhotoDelete(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Yükleme Butonu */}
              <div className="flex gap-3">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="edit-photo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => document.getElementById('edit-photo-upload').click()}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {uploading ? 'Yükleniyor...' : localPhotos.length > 0 ? 'Yeni Fotoğraf Ekle' : 'Fotoğraf Yükle'}
                </Button>
                {localPhotos.length > 0 && (
                  <span className="text-sm text-muted-foreground self-center">
                    {localPhotos.length} fotoğraf
                  </span>
                )}
              </div>
            </div>
            
            {/* Kaydet Butonu */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedQuestion(null)} className="flex-1">
                İptal
              </Button>
              <Button onClick={saveAnswer} disabled={saving || !localAnswer} className="flex-1">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

