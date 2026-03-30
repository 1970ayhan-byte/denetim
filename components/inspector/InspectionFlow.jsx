'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Camera,
  Pause,
  SkipForward,
  ListOrdered,
  ClipboardList,
} from 'lucide-react'
import { toast as sonnerToast } from 'sonner'
import {
  normalizeSkippedQuestionIds,
  flattenInspectionQuestions,
  findNextUnansweredAfter,
  findNextUnansweredFromInclusive,
} from './inspectionHelpers'


export function InspectionFlow({ 
  inspection, 
  categories, 
  initialCategoryIndex = 0,
  initialQuestionIndex = 0,
  answers,
  saveAnswer,
  saveProgress,
  completeInspection,
  onCancel,
  token,
  showFinishOnLoad = false,
  onSkippedIdsChange,
}) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(initialCategoryIndex)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialQuestionIndex)
  const [localAnswer, setLocalAnswer] = useState('')
  const [localNote, setLocalNote] = useState('')
  const [localPhotos, setLocalPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [showFinishDialog, setShowFinishDialog] = useState(showFinishOnLoad)
  const [skippedIds, setSkippedIds] = useState(() =>
    normalizeSkippedQuestionIds(inspection.skippedQuestionIds)
  )
  const [skipSubmitting, setSkipSubmitting] = useState(false)
  const [soruListesiOpen, setSoruListesiOpen] = useState(false)
  const [soruListesiTab, setSoruListesiTab] = useState('all')

  const currentCategory = categories[currentCategoryIndex] || categories[categories.length - 1]
  const categoryQuestions = currentCategory?.questions || []
  const safeQuestionIndex = Math.min(currentQuestionIndex, categoryQuestions.length - 1)
  const currentQuestion = categoryQuestions[safeQuestionIndex >= 0 ? safeQuestionIndex : 0]
  const totalQuestions = categoryQuestions.length
  const isLastQuestion = safeQuestionIndex === totalQuestions - 1
  const isLastCategory = currentCategoryIndex >= categories.length - 1

  // Calculate if all questions are answered
  const allQuestionsAnswered = useMemo(() => {
    if (!categories || categories.length === 0) return false
    let totalQ = 0
    let answeredQ = 0
    categories.forEach(cat => {
      (cat.questions || []).forEach(q => {
        totalQ++
        if (answers[q.id]) answeredQ++
      })
    })
    return totalQ > 0 && answeredQ >= totalQ
  }, [categories, answers])

  useEffect(() => {
    setSkippedIds(normalizeSkippedQuestionIds(inspection.skippedQuestionIds))
  }, [inspection.id, inspection.skippedQuestionIds])

  const skippedRowsAll = useMemo(() => {
    return skippedIds.map((id) => {
      let row = { id, text: 'Soru', category: '—' }
      for (const cat of categories) {
        const q = (cat.questions || []).find((qq) => qq.id === id)
        if (q) {
          row = { id, text: q.question, category: cat.name }
          break
        }
      }
      const ans = answers[id]
      const hasAnswer = Boolean(ans?.answer)
      let answerLabel = ''
      if (ans?.answer === 'uygun') answerLabel = 'Uygun'
      else if (ans?.answer === 'uygun_degil') answerLabel = 'Uygun değil'
      return { ...row, hasAnswer, answerLabel }
    })
  }, [skippedIds, answers, categories])

  const skippedNeedingAnswerCount = useMemo(
    () => skippedRowsAll.filter((r) => !r.hasAnswer).length,
    [skippedRowsAll]
  )

  const skippedWithAnswerCount = useMemo(
    () => skippedRowsAll.filter((r) => r.hasAnswer).length,
    [skippedRowsAll]
  )

  const allQuestionsRows = useMemo(() => {
    const skippedSet = new Set(skippedIds)
    return flattenInspectionQuestions(categories).map((row) => {
      const ans = answers[row.id]
      const hasAnswer = Boolean(ans?.answer)
      let answerLabel = ''
      if (ans?.answer === 'uygun') answerLabel = 'Uygun'
      else if (ans?.answer === 'uygun_degil') answerLabel = 'Uygun değil'
      const isSkipped = skippedSet.has(row.id)
      let status = 'Bekliyor'
      if (hasAnswer && isSkipped) status = 'Cevaplı + Geçilenler'
      else if (hasAnswer) status = 'Cevaplandı'
      else if (isSkipped) status = 'Geçildi'
      return { ...row, hasAnswer, answerLabel, isSkipped, status }
    })
  }, [categories, answers, skippedIds])

  // If all questions answered and we're at the end, show finish dialog
  useEffect(() => {
    if (allQuestionsAnswered && !currentQuestion && !showFinishDialog) {
      setShowFinishDialog(true)
    }
  }, [allQuestionsAnswered, currentQuestion, showFinishDialog])

  // Skip categories with no questions
  useEffect(() => {
    if (currentCategory && currentCategory.questions?.length === 0) {
      // Find next category with questions
      let nextCatIndex = currentCategoryIndex + 1
      while (nextCatIndex < categories.length && (categories[nextCatIndex]?.questions?.length || 0) === 0) {
        nextCatIndex++
      }
      
      if (nextCatIndex < categories.length) {
        setCurrentCategoryIndex(nextCatIndex)
        setCurrentQuestionIndex(0)
      } else {
        // No more categories with questions - show finish dialog
        setShowFinishDialog(true)
      }
    }
  }, [currentCategoryIndex, categories])

  useEffect(() => {
    if (currentQuestion) {
      const savedAnswer = answers[currentQuestion.id]
      setLocalAnswer(savedAnswer?.answer || '')
      setLocalNote(savedAnswer?.note || '')
      setLocalPhotos(savedAnswer?.photos || [])
    }
  }, [currentQuestion, answers])

  // Autosave when answer changes (debounced) - also saves position
  useEffect(() => {
    if (currentQuestion && localAnswer) {
      const timer = setTimeout(async () => {
        setAutoSaving(true)
        try {
          // Save answer with current position
          await saveAnswer(
            currentQuestion.id, 
            localAnswer, 
            localNote, 
            localPhotos,
            currentCategoryIndex,
            currentQuestionIndex
          )
        } catch (e) {
          console.error('Autosave failed:', e)
        }
        setAutoSaving(false)
      }, 2000) // 2 second debounce
      return () => clearTimeout(timer)
    }
  }, [localAnswer, localNote, currentCategoryIndex, currentQuestionIndex])

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
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
      setLocalPhotos([...localPhotos, data.url])
      sonnerToast.success('Fotoğraf yüklendi')
    } catch (error) {
      sonnerToast.error('Yükleme hatası')
    } finally {
      setUploading(false)
    }
  }

  const handleNext = async () => {
    if (!localAnswer) {
      sonnerToast.error('Lütfen bir cevap seçin')
      return
    }

    const mergedAnswers = {
      ...answers,
      [currentQuestion.id]: { answer: localAnswer, note: localNote, photos: localPhotos },
    }

    const nextPos = findNextUnansweredAfter(
      categories,
      mergedAnswers,
      currentCategoryIndex,
      currentQuestionIndex
    )

    if (!nextPos) {
      await saveAnswer(
        currentQuestion.id,
        localAnswer,
        localNote,
        localPhotos,
        currentCategoryIndex,
        currentQuestionIndex,
        true
      )
      setShowFinishDialog(true)
      setLocalAnswer('')
      setLocalNote('')
      setLocalPhotos([])
      sonnerToast.success('Cevap kaydedildi', { duration: 1500 })
      return
    }

    await saveAnswer(
      currentQuestion.id,
      localAnswer,
      localNote,
      localPhotos,
      nextPos.catIdx,
      nextPos.qIdx,
      true
    )
    setCurrentCategoryIndex(nextPos.catIdx)
    setCurrentQuestionIndex(nextPos.qIdx)
    setLocalAnswer('')
    setLocalNote('')
    setLocalPhotos([])
    sonnerToast.success('Cevap kaydedildi', { duration: 1500 })
  }

  const handleSkip = async () => {
    if (!currentQuestion || skipSubmitting) return
    const qid = currentQuestion.id

    let nextCatIndex = currentCategoryIndex
    let nextQIndex = currentQuestionIndex + 1
    const atEnd = isLastQuestion && isLastCategory

    if (isLastQuestion) {
      if (isLastCategory) {
        nextCatIndex = currentCategoryIndex
        nextQIndex = currentQuestionIndex
      } else {
        nextCatIndex = currentCategoryIndex + 1
        while (nextCatIndex < categories.length && (categories[nextCatIndex]?.questions?.length || 0) === 0) {
          nextCatIndex++
        }
        if (nextCatIndex >= categories.length) {
          nextCatIndex = currentCategoryIndex
          nextQIndex = currentQuestionIndex
        } else {
          nextQIndex = 0
        }
      }
    }

    setSkipSubmitting(true)
    try {
      const response = await fetch('/api/inspector/inspection/skip-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inspectionId: inspection.id,
          questionId: qid,
          currentCategoryIndex: atEnd ? currentCategoryIndex : nextCatIndex,
          currentQuestionIndex: atEnd ? currentQuestionIndex : nextQIndex,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        sonnerToast.error(data.error || 'Soru geçilemedi')
        return
      }
      const nextSkipped = normalizeSkippedQuestionIds(data.inspection?.skippedQuestionIds)
      setSkippedIds(nextSkipped)
      onSkippedIdsChange?.(nextSkipped)

      const mergedAnswers = { ...answers }
      if (localAnswer) {
        mergedAnswers[qid] = { answer: localAnswer, note: localNote, photos: localPhotos }
      }

      if (atEnd) {
        setShowFinishDialog(true)
      } else {
        let landCat = currentCategoryIndex
        let landQ = nextQIndex
        if (isLastQuestion && nextCatIndex !== currentCategoryIndex) {
          landCat = nextCatIndex
          landQ = 0
        }
        const pos = findNextUnansweredFromInclusive(categories, mergedAnswers, landCat, landQ)
        if (pos) {
          setCurrentCategoryIndex(pos.catIdx)
          setCurrentQuestionIndex(pos.qIdx)
        } else {
          setShowFinishDialog(true)
        }
      }

      setLocalAnswer('')
      setLocalNote('')
      setLocalPhotos([])
      sonnerToast.success('Soru geçildi. Geçilenler bölümünden istediğiniz zaman dönebilirsiniz.', {
        duration: 2800,
      })
    } catch (e) {
      sonnerToast.error('Soru geçilemedi')
    } finally {
      setSkipSubmitting(false)
    }
  }

  const goToQuestionById = async (questionId) => {
    for (let ci = 0; ci < categories.length; ci++) {
      const qs = categories[ci].questions || []
      for (let qi = 0; qi < qs.length; qi++) {
        if (qs[qi].id === questionId) {
          await saveProgress(ci, qi)
          setCurrentCategoryIndex(ci)
          setCurrentQuestionIndex(qi)
          setSoruListesiOpen(false)
          return
        }
      }
    }
  }

  const handlePrevious = async () => {
    let newCatIndex = currentCategoryIndex
    let newQIndex = currentQuestionIndex
    
    if (currentQuestionIndex > 0) {
      newQIndex = currentQuestionIndex - 1
    } else if (currentCategoryIndex > 0) {
      // Find previous category with questions
      let prevCatIndex = currentCategoryIndex - 1
      while (prevCatIndex >= 0 && (categories[prevCatIndex]?.questions?.length || 0) === 0) {
        prevCatIndex--
      }
      
      if (prevCatIndex >= 0) {
        newCatIndex = prevCatIndex
        newQIndex = categories[prevCatIndex].questions.length - 1
      }
    }
    
    // Save current answer with new position before navigating
    if (localAnswer && currentQuestion) {
      await saveAnswer(currentQuestion.id, localAnswer, localNote, localPhotos, newCatIndex, newQIndex)
    } else {
      // Just save progress position
      await saveProgress(newCatIndex, newQIndex)
    }
    
    // Navigate
    setCurrentCategoryIndex(newCatIndex)
    setCurrentQuestionIndex(newQIndex)
  }

  const handleFinishInspection = async () => {
    await completeInspection()
    setShowFinishDialog(false)
  }

  // ARA VER - Kaydet ve ana sayfaya dön
  const handlePause = async () => {
    try {
      // Save current answer with position if exists
      if (localAnswer && currentQuestion) {
        await saveAnswer(currentQuestion.id, localAnswer, localNote, localPhotos, currentCategoryIndex, currentQuestionIndex)
      } else {
        // Just save progress position
        await saveProgress(currentCategoryIndex, currentQuestionIndex)
      }
      
      sonnerToast.success('Denetim kaydedildi. Kaldığınız yerden devam edebilirsiniz.')
      onCancel()
    } catch (error) {
      sonnerToast.error('Kaydetme hatası')
    }
  }

  const totalAllQuestions = categories.reduce((sum, cat) => sum + (cat.questions?.length || 0), 0)
  const answeredCount = Object.keys(answers).length

  // If all questions are answered and no current question, show only the finish dialog
  if (allQuestionsAnswered && !currentQuestion) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Dialog open={true}>
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
              <p className="text-sm">Kurum: <span className="font-medium">{inspection.schoolName}</span></p>
              <p className="text-sm">Cevaplanan Soru: <span className="font-medium">{answeredCount} / {totalAllQuestions}</span></p>
            </div>
            {skippedNeedingAnswerCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-900">
                <strong>{skippedNeedingAnswerCount}</strong> geçilmiş sorunun cevabı yok. Üst menüden Soru listesi /
                Geçilenler üzerinden tamamlayabilirsiniz.
              </div>
            )}
            {skippedWithAnswerCount > 0 && (
              <div className="bg-sky-50 border border-sky-200 p-3 rounded-lg text-sm text-sky-900">
                <strong>{skippedWithAnswerCount}</strong> geçilmiş soruda cevap kaydı var; listeden düşmesi için o
                soruda <strong>Sonraki soru</strong> ile ilerlemeniz gerekir.
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onCancel}>
                Geri Dön
              </Button>
              <Button onClick={handleFinishInspection} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Denetimi Tamamla
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Safety check - if no current question but not all answered, go to first unanswered
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const progress = ((currentCategoryIndex * 100) + ((currentQuestionIndex + 1) / totalQuestions * 100)) / categories.length

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">{inspection.schoolName}</h2>
              <p className="text-sm text-muted-foreground">{currentCategory.name}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {autoSaving && (
                <span className="text-xs text-green-600 animate-pulse">💾 Kaydediliyor...</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSoruListesiTab('all')
                  setSoruListesiOpen(true)
                }}
              >
                <ClipboardList className="h-4 w-4 mr-1" />
                Soru listesi
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSoruListesiTab('skipped')
                  setSoruListesiOpen(true)
                }}
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
              <Button variant="outline" size="sm" onClick={handlePause} className="text-orange-600 border-orange-300 hover:bg-orange-50">
                <Pause className="h-4 w-4 mr-1" />
                Ara Ver
              </Button>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Soru {currentQuestionIndex + 1} / {totalQuestions}</span>
              <span>Kategori {currentCategoryIndex + 1} / {categories.length}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-center text-muted-foreground">
              Toplam ilerleme: {answeredCount} / {totalAllQuestions} soru cevaplandı
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Question */}
            <div>
              <h3 className="text-xl font-bold mb-2">{currentQuestion.question}</h3>
              {currentQuestion.regulationText && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Yönetmelik:</p>
                  <p className="text-sm text-blue-800">{currentQuestion.regulationText}</p>
                </div>
              )}
            </div>

            {/* Image */}
            {currentQuestion.imageUrl && (
              <img 
                src={currentQuestion.imageUrl} 
                alt="Soru görseli"
                className="w-full rounded-lg"
              />
            )}

            {/* Answer Options */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Cevabınız:</Label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'uygun', label: 'UYGUN', color: 'bg-green-50 border-green-500 text-green-900', icon: CheckCircle2 },
                  { value: 'uygun_degil', label: 'UYGUN DEĞİL', color: 'bg-red-50 border-red-500 text-red-900', icon: XCircle },
                ].map(option => (
                  <button
                    key={option.value}
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

            {/* Note */}
            <div>
              <Label>Not (Opsiyonel)</Label>
              <Textarea 
                value={localNote}
                onChange={(e) => setLocalNote(e.target.value)}
                placeholder="Varsa ek açıklama yazın..."
                rows={3}
              />
            </div>

            {/* Photo Upload */}
            <div>
              <Label>Fotoğraf Ekle</Label>
              <div className="mt-2 space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    disabled={uploading}
                    onClick={() => document.getElementById('photo-upload').click()}
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

            {/* Penalty Info */}
            {currentQuestion.penaltyType && localAnswer === 'uygun_degil' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-900 mb-1">⚠️ Ceza Gerekliliği:</p>
                <p className="text-sm text-red-800">{currentQuestion.penaltyType}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mt-6">
          {(currentQuestionIndex > 0 || currentCategoryIndex > 0) && (
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              className="flex-1 min-w-[140px]"
            >
              ← Önceki Soru
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            disabled={skipSubmitting}
            className="flex-1 min-w-[100px] border-amber-300 text-amber-900 hover:bg-amber-50"
          >
            <SkipForward className="h-4 w-4 mr-2 inline" />
            {skipSubmitting ? '…' : 'GEÇ'}
          </Button>
          {isLastQuestion && isLastCategory ? (
            <Button 
              onClick={async () => {
                if (localAnswer) {
                  await saveAnswer(
                    currentQuestion.id,
                    localAnswer,
                    localNote,
                    localPhotos,
                    currentCategoryIndex,
                    currentQuestionIndex,
                    true
                  )
                }
                setShowFinishDialog(true)
              }}
              className="flex-1 min-w-[160px] bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              DENETİMİ BİTİR
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!localAnswer}
              className="flex-1 min-w-[140px]"
            >
              Sonraki Soru →
            </Button>
          )}
        </div>
      </div>

      <Sheet open={soruListesiOpen} onOpenChange={setSoruListesiOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Soru listesi
            </SheetTitle>
            <SheetDescription>
              Tüm soruların durumunu görün; Geçilenler sekmesinde geçtiğiniz sorular (cevaplı olsa da) listelenir.
            </SheetDescription>
          </SheetHeader>
          <Tabs value={soruListesiTab} onValueChange={setSoruListesiTab} className="mt-4 flex flex-col flex-1 min-h-0">
            <TabsList className="grid w-full grid-cols-2 shrink-0">
              <TabsTrigger value="all">Tüm sorular ({allQuestionsRows.length})</TabsTrigger>
              <TabsTrigger value="skipped">Geçilenler ({skippedRowsAll.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4 flex-1 min-h-0 max-h-[70vh] overflow-y-auto pr-1 space-y-2">
              {allQuestionsRows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => goToQuestionById(row.id)}
                  className={`w-full text-left rounded-lg border p-3 hover:bg-muted/60 transition-colors ${
                    row.id === currentQuestion?.id ? 'ring-2 ring-primary' : ''
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
            <TabsContent value="skipped" className="mt-4 flex-1 min-h-0 max-h-[70vh] overflow-y-auto pr-1 space-y-2">
              {skippedRowsAll.length === 0 ? (
                <p className="text-sm text-muted-foreground">Henüz geçilmiş soru yok.</p>
              ) : (
                skippedRowsAll.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => goToQuestionById(row.id)}
                    className={`w-full text-left rounded-lg border p-3 hover:bg-muted/60 transition-colors ${
                      row.id === currentQuestion?.id ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      <Badge
                        variant="outline"
                        className="border-amber-400 text-amber-950 bg-amber-50"
                      >
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

      {/* Finish Inspection Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
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
                <p>Kurum: <strong>{inspection.schoolName}</strong></p>
                <p>Cevaplanan Soru: <strong>{answeredCount} / {totalAllQuestions}</strong></p>
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

            {skippedNeedingAnswerCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <p className="text-sm text-amber-900 flex items-center gap-2">
                  <ListOrdered className="h-4 w-4 shrink-0" />
                  <span>
                    <strong>{skippedNeedingAnswerCount}</strong> geçilmiş sorunun cevabı yok. Soru listesi / Geçilenler
                    sekmesinden tamamlayabilirsiniz.
                  </span>
                </p>
              </div>
            )}
            {skippedWithAnswerCount > 0 && (
              <div className="bg-sky-50 border border-sky-200 p-3 rounded-lg">
                <p className="text-sm text-sky-900">
                  <strong>{skippedWithAnswerCount}</strong> geçilmiş soruda cevap kaydı var; Geçilenler listesinden
                  kalkmaları için ilgili soruda <strong>Sonraki soru</strong> ile ilerleyin.
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowFinishDialog(false)} className="flex-1">
                Geri Dön
              </Button>
              <Button onClick={handleFinishInspection} className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Denetimi Tamamla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


// Inspection Edit Mode - Tamamlanmış denetimi düzenleme
