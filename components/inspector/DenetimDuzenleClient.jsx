'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast as sonnerToast } from 'sonner'
import { InspectionEditMode } from './InspectionEditMode'
import { postInspectorInspectionStart } from './inspectorApi'

export function DenetimDuzenleClient({ token }) {
  const router = useRouter()
  const params = useParams()
  const inspectionId = params?.inspectionId

  const [loading, setLoading] = useState(true)
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [categories, setCategories] = useState([])
  const [answers, setAnswers] = useState({})

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
      findFirstUnanswered: false,
    })
    if (!ok) {
      sonnerToast.error(data.error || 'Düzenleme başlatılamadı')
      goList()
      return
    }
    setSelectedInspection(data.inspection)
    setCategories(Array.isArray(data.categories) ? data.categories : [])
    setAnswers(data.answersMap || {})
    sonnerToast.success('Düzenleme modu açıldı')
    setLoading(false)
  }, [inspectionId, token, goList])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  if (loading || !selectedInspection || categories.length === 0) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">
        Yükleniyor...
      </div>
    )
  }

  return (
    <InspectionEditMode
      inspection={selectedInspection}
      categories={categories}
      answers={answers}
      setAnswers={setAnswers}
      onCancel={goList}
      token={token}
    />
  )
}
