'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, SkipForward } from 'lucide-react'
import { toast as sonnerToast } from 'sonner'
import {
  normalizeSkippedQuestionIds,
  flattenInspectionQuestions,
  findNextUnansweredAfter,
  findNextUnansweredFromInclusive,
} from './inspectionHelpers'
import { FlowToolbar } from './flow/FlowToolbar'
import { FlowProgressBar } from './flow/FlowProgressBar'
import { FlowQuestionPanel } from './flow/FlowQuestionPanel'
import { FlowSoruListesiSheet } from './flow/FlowSoruListesiSheet'
import { FlowBlockingFinish } from './flow/FlowBlockingFinish'
import { FlowFinishDialog } from './flow/FlowFinishDialog'

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

  const allQuestionsAnswered = useMemo(() => {
    if (!categories || categories.length === 0) return false
    let totalQ = 0
    let answeredQ = 0
    categories.forEach((cat) => {
      ;(cat.questions || []).forEach((q) => {
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

  useEffect(() => {
    if (allQuestionsAnswered && !currentQuestion && !showFinishDialog) {
      setShowFinishDialog(true)
    }
  }, [allQuestionsAnswered, currentQuestion, showFinishDialog])

  useEffect(() => {
    if (currentCategory && currentCategory.questions?.length === 0) {
      let nextCatIndex = currentCategoryIndex + 1
      while (
        nextCatIndex < categories.length &&
        (categories[nextCatIndex]?.questions?.length || 0) === 0
      ) {
        nextCatIndex++
      }

      if (nextCatIndex < categories.length) {
        setCurrentCategoryIndex(nextCatIndex)
        setCurrentQuestionIndex(0)
      } else {
        setShowFinishDialog(true)
      }
    }
  }, [currentCategoryIndex, categories, currentCategory])

  useEffect(() => {
    if (currentQuestion) {
      const savedAnswer = answers[currentQuestion.id]
      setLocalAnswer(savedAnswer?.answer || '')
      setLocalNote(savedAnswer?.note || '')
      setLocalPhotos(savedAnswer?.photos || [])
    }
  }, [currentQuestion, answers])

  useEffect(() => {
    if (currentQuestion && localAnswer) {
      const timer = setTimeout(async () => {
        setAutoSaving(true)
        try {
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
      }, 2000)
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
        body: formData,
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
        while (
          nextCatIndex < categories.length &&
          (categories[nextCatIndex]?.questions?.length || 0) === 0
        ) {
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
      let prevCatIndex = currentCategoryIndex - 1
      while (prevCatIndex >= 0 && (categories[prevCatIndex]?.questions?.length || 0) === 0) {
        prevCatIndex--
      }

      if (prevCatIndex >= 0) {
        newCatIndex = prevCatIndex
        newQIndex = categories[prevCatIndex].questions.length - 1
      }
    }

    if (localAnswer && currentQuestion) {
      await saveAnswer(currentQuestion.id, localAnswer, localNote, localPhotos, newCatIndex, newQIndex)
    } else {
      await saveProgress(newCatIndex, newQIndex)
    }

    setCurrentCategoryIndex(newCatIndex)
    setCurrentQuestionIndex(newQIndex)
  }

  const handleFinishInspection = async () => {
    await completeInspection()
    setShowFinishDialog(false)
  }

  const handlePause = async () => {
    try {
      if (localAnswer && currentQuestion) {
        await saveAnswer(
          currentQuestion.id,
          localAnswer,
          localNote,
          localPhotos,
          currentCategoryIndex,
          currentQuestionIndex
        )
      } else {
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

  if (allQuestionsAnswered && !currentQuestion) {
    return (
      <FlowBlockingFinish
        schoolName={inspection.schoolName}
        answeredCount={answeredCount}
        totalAllQuestions={totalAllQuestions}
        skippedNeedingAnswerCount={skippedNeedingAnswerCount}
        skippedWithAnswerCount={skippedWithAnswerCount}
        onBack={onCancel}
        onConfirmComplete={handleFinishInspection}
      />
    )
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const progressPercent =
    totalQuestions > 0
      ? ((currentCategoryIndex * 100 + ((currentQuestionIndex + 1) / totalQuestions) * 100) /
          categories.length)
      : 0

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="bg-white border-b sticky top-0 z-10">
        <FlowToolbar
          schoolName={inspection.schoolName}
          categoryName={currentCategory.name}
          autoSaving={autoSaving}
          onOpenListAll={() => {
            setSoruListesiTab('all')
            setSoruListesiOpen(true)
          }}
          onOpenListSkipped={() => {
            setSoruListesiTab('skipped')
            setSoruListesiOpen(true)
          }}
          skippedNeedingAnswerCount={skippedNeedingAnswerCount}
          onPause={handlePause}
          onCancel={onCancel}
        />
        <FlowProgressBar
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          currentCategoryIndex={currentCategoryIndex}
          categoriesLength={categories.length}
          progressPercent={progressPercent}
          answeredCount={answeredCount}
          totalAllQuestions={totalAllQuestions}
        />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <FlowQuestionPanel
          currentQuestion={currentQuestion}
          localAnswer={localAnswer}
          setLocalAnswer={setLocalAnswer}
          localNote={localNote}
          setLocalNote={setLocalNote}
          localPhotos={localPhotos}
          setLocalPhotos={setLocalPhotos}
          uploading={uploading}
          onPhotoUpload={handlePhotoUpload}
        />

        <div className="flex flex-wrap gap-2 mt-6">
          {(currentQuestionIndex > 0 || currentCategoryIndex > 0) && (
            <Button variant="outline" onClick={handlePrevious} className="flex-1 min-w-[140px]">
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
            <Button onClick={handleNext} disabled={!localAnswer} className="flex-1 min-w-[140px]">
              Sonraki Soru →
            </Button>
          )}
        </div>
      </div>

      <FlowSoruListesiSheet
        open={soruListesiOpen}
        onOpenChange={setSoruListesiOpen}
        soruListesiTab={soruListesiTab}
        onTabChange={setSoruListesiTab}
        allQuestionsRows={allQuestionsRows}
        skippedRowsAll={skippedRowsAll}
        currentQuestionId={currentQuestion?.id}
        onSelectQuestion={goToQuestionById}
      />

      <FlowFinishDialog
        open={showFinishDialog}
        onOpenChange={setShowFinishDialog}
        schoolName={inspection.schoolName}
        answeredCount={answeredCount}
        totalAllQuestions={totalAllQuestions}
        skippedNeedingAnswerCount={skippedNeedingAnswerCount}
        skippedWithAnswerCount={skippedWithAnswerCount}
        onConfirmComplete={handleFinishInspection}
      />
    </div>
  )
}
