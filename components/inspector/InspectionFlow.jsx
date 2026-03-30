'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, SkipForward } from 'lucide-react'
import { toast as sonnerToast } from 'sonner'
import {
  normalizeSkippedQuestionIds,
  findNextUnansweredAfter,
  findNextUnansweredFromInclusive,
  firstUnansweredQuestionIndexInCategory,
  getCategoryStats,
} from './inspectionHelpers'
import { FlowDenetimTopBar } from './flow/FlowDenetimTopBar'
import { FlowCategoryChips } from './flow/FlowCategoryChips'
import { FlowQuestionStrip } from './flow/FlowQuestionStrip'
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
  onAnswerCleared,
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

  const skippedSet = useMemo(() => new Set(skippedIds), [skippedIds])

  const statsList = useMemo(
    () => categories.map((cat) => getCategoryStats(cat, answers, skippedSet)),
    [categories, answers, skippedSet]
  )

  const skippedNeedingAnswerCount = useMemo(
    () => skippedRowsAll.filter((r) => !r.hasAnswer).length,
    [skippedRowsAll]
  )

  const skippedWithAnswerCount = useMemo(
    () => skippedRowsAll.filter((r) => r.hasAnswer).length,
    [skippedRowsAll]
  )

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

    const prevCatIdx = currentCategoryIndex

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
    if (nextPos.catIdx > prevCatIdx) {
      const doneName = categories[prevCatIdx]?.name || `Kategori ${prevCatIdx + 1}`
      const nextName = categories[nextPos.catIdx]?.name || `Kategori ${nextPos.catIdx + 1}`
      sonnerToast.success(`${doneName} bitti`, {
        description: `Sırada: ${nextName}`,
        duration: 4000,
      })
    } else {
      sonnerToast.success('Cevap kaydedildi', { duration: 1500 })
    }
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
      onAnswerCleared?.(qid)

      const mergedAnswers = { ...answers }
      delete mergedAnswers[qid]

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
      sonnerToast.success(
        'Soru geçildi. Bu soruya ait kayıtlı cevap silindi; Geçilenler listesinden tekrar dönebilirsiniz.',
        { duration: 3200 },
      )
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

  const selectCategory = async (catIdx) => {
    if (catIdx < 0 || catIdx >= categories.length || catIdx === currentCategoryIndex) return
    const merged = { ...answers }
    if (localAnswer && currentQuestion) {
      merged[currentQuestion.id] = { answer: localAnswer, note: localNote, photos: localPhotos }
    }
    const qIdx = firstUnansweredQuestionIndexInCategory(categories, merged, catIdx)
    if (localAnswer && currentQuestion) {
      await saveAnswer(currentQuestion.id, localAnswer, localNote, localPhotos, catIdx, qIdx)
    } else {
      await saveProgress(currentCategoryIndex, currentQuestionIndex)
    }
    await saveProgress(catIdx, qIdx)
    setCurrentCategoryIndex(catIdx)
    setCurrentQuestionIndex(qIdx)
  }

  const selectQuestionInCategory = async (qi) => {
    if (qi === currentQuestionIndex) return
    const catIdx = currentCategoryIndex
    if (localAnswer && currentQuestion) {
      await saveAnswer(currentQuestion.id, localAnswer, localNote, localPhotos, catIdx, qi)
    } else {
      await saveProgress(catIdx, qi)
    }
    setCurrentQuestionIndex(qi)
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

  const everyQuestionAnsweredOrSkipped = useMemo(() => {
    if (!categories?.length) return false
    let total = 0
    for (const cat of categories) {
      for (const q of cat.questions || []) {
        total++
        const ans = answers[q.id]
        const hasAnswer = Boolean(ans?.answer)
        const isSkipped = skippedSet.has(q.id)
        if (!hasAnswer && !isSkipped) return false
      }
    }
    return total >= 0
  }, [categories, answers, skippedSet])

  const canCompleteInspection = everyQuestionAnsweredOrSkipped

  /** Son soru hariç hepsi cevaplı veya geçilmiş mi (son soruda bitir tuşunu açmak için). */
  const otherQuestionsAllResolved = useMemo(() => {
    if (!categories?.length || !currentQuestion?.id) return false
    for (const cat of categories) {
      for (const q of cat.questions || []) {
        if (q.id === currentQuestion.id) continue
        const ans = answers[q.id]
        const hasAnswer = Boolean(ans?.answer)
        const isSkipped = skippedSet.has(q.id)
        if (!hasAnswer && !isSkipped) return false
      }
    }
    return true
  }, [categories, answers, skippedSet, currentQuestion?.id])

  const denetimiBitirEnabled =
    isLastQuestion && isLastCategory ? otherQuestionsAllResolved : canCompleteInspection

  const handleFinishInspection = async () => {
    if (!canCompleteInspection) {
      sonnerToast.error(
        'Bazı sorular ne cevaplandı ne de geçildi. Eksikleri tamamlayın veya Geç ile işaretleyin.',
      )
      return
    }
    const ok = await completeInspection()
    if (ok) setShowFinishDialog(false)
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
        canCompleteInspection={canCompleteInspection}
        showUnansweredWarning={!everyQuestionAnsweredOrSkipped}
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

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-zinc-100">
      {/* Doğal sayfa kaydırması — içte sticky/scroll tuzakları yok; kategoriler her zaman akışta */}
      <div className="mx-auto w-full max-w-7xl overflow-x-hidden px-3 pb-4 pt-1 sm:px-5 md:px-6">
        <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-md shadow-zinc-900/[0.06]">
          <FlowDenetimTopBar
            schoolName={inspection.schoolName}
            categoryLabel={`${currentCategoryIndex + 1}. ${currentCategory.name}`}
            questionPositionLabel={`Bu kategoride soru ${safeQuestionIndex + 1} / ${totalQuestions}`}
            autoSaving={autoSaving}
            overallAnswered={answeredCount}
            overallTotal={totalAllQuestions}
            onOpenListSkipped={() => setSoruListesiOpen(true)}
            skippedNeedingAnswerCount={skippedNeedingAnswerCount}
            onPause={handlePause}
            onCancel={onCancel}
          />

          <div className="bg-zinc-50/50">
            <FlowCategoryChips
              categories={categories}
              statsList={statsList}
              currentCategoryIndex={currentCategoryIndex}
              onSelectCategory={selectCategory}
            />

            <FlowQuestionStrip
              questions={categoryQuestions}
              answers={answers}
              skippedSet={skippedSet}
              currentQuestionIndex={safeQuestionIndex}
              onSelectQuestion={selectQuestionInCategory}
              categoryName={currentCategory.name}
            />

            <div className="px-3 py-5 sm:px-4 md:py-8">
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

            <div className="mt-5 flex flex-col flex-wrap gap-2 sm:flex-row sm:gap-3 md:mt-6">
              {(currentQuestionIndex > 0 || currentCategoryIndex > 0) && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="min-h-[48px] flex-1 sm:flex-initial sm:min-w-[160px] rounded-xl touch-manipulation"
                >
                  ← Önceki
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={skipSubmitting}
                className="min-h-[48px] flex-1 sm:flex-initial sm:min-w-[120px] rounded-xl border-amber-300 text-amber-900 hover:bg-amber-50 touch-manipulation"
              >
                <SkipForward className="h-4 w-4 mr-2 inline" />
                {skipSubmitting ? '…' : 'Geç'}
              </Button>
              {isLastQuestion && isLastCategory ? (
                <Button
                  type="button"
                  disabled={!denetimiBitirEnabled}
                  title={
                    !denetimiBitirEnabled
                      ? 'Önceki sorularda veya kategorilerde eksik var'
                      : !canCompleteInspection
                        ? 'Son soruyu Uygun / Uygun değil ile seçin veya Geç kullanın; ardından tamamlayın'
                        : undefined
                  }
                  onClick={async () => {
                    if (!otherQuestionsAllResolved) {
                      sonnerToast.error(
                        'Önceki sorularda veya kategorilerde eksik var. Eksikleri tamamlayın veya Geç ile işaretleyin.',
                      )
                      return
                    }
                    if (skippedSet.has(currentQuestion.id)) {
                      setShowFinishDialog(true)
                      return
                    }
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
                      setShowFinishDialog(true)
                      return
                    }
                    if (canCompleteInspection) {
                      setShowFinishDialog(true)
                      return
                    }
                    sonnerToast.info(
                      'Önce bu soruya Uygun veya Uygun değil seçin; atlamak için Geç kullanın. Seçim otomatik kaydedilir.',
                      { duration: 4000 },
                    )
                  }}
                  className="min-h-[48px] flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold touch-manipulation disabled:opacity-50"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Denetimi bitir
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!localAnswer}
                  className="min-h-[48px] flex-1 rounded-xl font-semibold touch-manipulation sm:min-w-[180px]"
                >
                  {isLastQuestion ? 'Sonraki kategori →' : 'Sonraki soru →'}
                </Button>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      <FlowSoruListesiSheet
        open={soruListesiOpen}
        onOpenChange={setSoruListesiOpen}
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
        canCompleteInspection={canCompleteInspection}
        showUnansweredWarning={!everyQuestionAnsweredOrSkipped}
        onConfirmComplete={handleFinishInspection}
      />
    </div>
  )
}
