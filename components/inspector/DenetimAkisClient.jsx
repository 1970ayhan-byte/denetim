'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { toast as sonnerToast } from 'sonner'
import { InspectionFlow } from './InspectionFlow'
import { postInspectorInspectionStart } from './inspectorApi'

export function DenetimAkisClient({ token }) {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const inspectionId = params?.inspectionId
  const resume = searchParams.get('devam') === '1'

  const [loading, setLoading] = useState(true)
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [categories, setCategories] = useState([])
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [resumePosition, setResumePosition] = useState(null)
  const [allAnsweredOnResume, setAllAnsweredOnResume] = useState(false)

  const goList = useCallback(() => {
    router.push('/denetci')
  }, [router])

  const bootstrap = useCallback(async () => {
    if (!inspectionId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { ok, data } = await postInspectorInspectionStart(token, {
      inspectionId,
      findFirstUnanswered: resume,
    })
    if (!ok) {
      sonnerToast.error(data.error || 'Denetim başlatılamadı')
      goList()
      return
    }

    const inspection = data.inspection
    const cats = Array.isArray(data.categories) ? data.categories : []
    setSelectedInspection(inspection)
    setCategories(cats)
    setAnswers(data.answersMap || {})

    if (resume && inspection?.status === 'in_progress') {
      const resumeCatIndex = data.inspection.currentCategoryIndex || 0
      const resumeQIndex = data.inspection.currentQuestionIndex || 0
      setCurrentCategoryIndex(resumeCatIndex)
      setResumePosition({
        categoryIndex: resumeCatIndex,
        questionIndex: resumeQIndex,
      })
      const resumeInfo = data.resumeInfo
      if (resumeInfo) {
        if (resumeInfo.totalAnswered >= resumeInfo.totalQuestions) {
          sonnerToast.info(
            `Tüm sorular zaten cevaplandı (${resumeInfo.totalAnswered}/${resumeInfo.totalQuestions}). Denetimi tamamlayabilirsiniz.`,
            { duration: 5000 }
          )
          setAllAnsweredOnResume(true)
        } else {
          sonnerToast.success(
            `Kaldığınız yerden devam ediliyor\n${resumeInfo.totalAnswered}/${resumeInfo.totalQuestions} soru cevaplandı`,
            { duration: 4000 }
          )
          setAllAnsweredOnResume(false)
        }
      } else {
        sonnerToast.success(
          `Kategori ${resumeCatIndex + 1}, Soru ${resumeQIndex + 1}'den devam ediliyor`
        )
        setAllAnsweredOnResume(false)
      }
    } else {
      setCurrentCategoryIndex(0)
      setResumePosition(null)
      setAllAnsweredOnResume(false)
      sonnerToast.success('Denetim başlatıldı')
    }
    setLoading(false)
  }, [inspectionId, resume, token, goList])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  const saveAnswer = async (
    questionId,
    answer,
    note = '',
    photos = [],
    catIndex = null,
    qIndex = null,
    removeSkipped = false
  ) => {
    try {
      const response = await fetch('/api/inspector/inspection/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inspectionId: selectedInspection.id,
          questionId,
          answer,
          note,
          photos,
          currentCategoryIndex: catIndex,
          currentQuestionIndex: qIndex,
          removeSkipped,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        sonnerToast.error(data.error || 'Kaydetme hatası')
        return
      }

      setAnswers((prev) => ({
        ...prev,
        [questionId]: { answer, note, photos },
      }))

      if (removeSkipped) {
        setSelectedInspection((prev) => {
          if (!prev) return prev
          const sk = Array.isArray(prev.skippedQuestionIds) ? prev.skippedQuestionIds : []
          if (!sk.includes(questionId)) return prev
          return { ...prev, skippedQuestionIds: sk.filter((id) => id !== questionId) }
        })
      }
    } catch (error) {
      console.error('Save error:', error)
      sonnerToast.error('Kaydetme hatası')
    }
  }

  const onSkippedIdsChange = (ids) => {
    setSelectedInspection((prev) =>
      prev ? { ...prev, skippedQuestionIds: Array.isArray(ids) ? ids : [] } : null
    )
  }

  const saveProgress = async (catIndex, qIndex) => {
    try {
      await fetch('/api/inspector/inspection/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          inspectionId: selectedInspection.id,
          currentCategoryIndex: catIndex,
          currentQuestionIndex: qIndex,
        }),
      })
    } catch (error) {
      console.error('Progress save error:', error)
    }
  }

  const completeInspection = async () => {
    if (!confirm('Denetimi tamamlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return

    try {
      await fetch('/api/inspector/inspection/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inspectionId: selectedInspection.id }),
      })

      sonnerToast.success('Denetim tamamlandı!')
      router.push('/denetci')
    } catch (error) {
      sonnerToast.error('Hata oluştu')
    }
  }

  if (loading || !selectedInspection || categories.length === 0) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
        Yükleniyor...
      </div>
    )
  }

  return (
    <InspectionFlow
      inspection={selectedInspection}
      categories={categories}
      initialCategoryIndex={currentCategoryIndex}
      initialQuestionIndex={resumePosition?.questionIndex || 0}
      answers={answers}
      saveAnswer={saveAnswer}
      saveProgress={saveProgress}
      completeInspection={completeInspection}
      onCancel={goList}
      token={token}
      showFinishOnLoad={allAnsweredOnResume}
      onSkippedIdsChange={onSkippedIdsChange}
    />
  )
}
