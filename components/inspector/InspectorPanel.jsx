'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Package,
  Zap,
  ChevronRight,
  Edit2,
  AlertCircle,
} from 'lucide-react'
import { toast as sonnerToast } from 'sonner'
import { InspectionFlow } from './InspectionFlow'
import { InspectionEditMode } from './InspectionEditMode'


export function InspectorPanel({ token, user }) {
  const [view, setView] = useState('list') // list, detail, inspection, edit
  const [inspections, setInspections] = useState([])
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [categories, setCategories] = useState([])
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [resumePosition, setResumePosition] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [allAnsweredOnResume, setAllAnsweredOnResume] = useState(false)

  useEffect(() => {
    loadInspections()
  }, [])

  const loadInspections = async () => {
    const response = await fetch('/api/inspector/inspections', { 
      headers: { Authorization: `Bearer ${token}` } 
    })
    const data = await response.json()
    if (!response.ok) {
      sonnerToast.error(data.error || 'Denetimler yüklenemedi')
      setInspections([])
      return
    }
    setInspections(Array.isArray(data) ? data : [])
  }

  // 6 saat düzenleme kontrolü
  const isEditable = (completedAt) => {
    if (!completedAt) return false
    const now = new Date()
    const completedTime = new Date(completedAt)
    const diffHours = (now - completedTime) / (1000 * 60 * 60)
    return diffHours <= 6
  }

  // Kalan süreyi hesapla
  const getRemainingTime = (completedAt) => {
    if (!completedAt) return null
    const completedTime = new Date(completedAt)
    const deadline = new Date(completedTime.getTime() + 6 * 60 * 60 * 1000)
    const now = new Date()
    const diffMs = deadline - now
    if (diffMs <= 0) return null
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}s ${minutes}dk kaldı`
  }

  // Düzenleme moduna geç
  const startEditMode = async (inspection) => {
    try {
      const response = await fetch('/api/inspector/inspection/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ inspectionId: inspection.id })
      })
      
      const data = await response.json()
      if (!response.ok) {
        sonnerToast.error(data.error || 'Düzenleme başlatılamadı')
        return
      }
      setSelectedInspection(data.inspection)
      setCategories(Array.isArray(data.categories) ? data.categories : [])
      setAnswers(data.answersMap || {})
      setEditMode(true)
      setView('edit')
      sonnerToast.success('Düzenleme modu açıldı')
    } catch (error) {
      sonnerToast.error('Düzenleme başlatılamadı')
    }
  }

  const startInspection = async (inspection, isResume = false) => {
    try {
      const response = await fetch('/api/inspector/inspection/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          inspectionId: inspection.id,
          findFirstUnanswered: isResume  // Backend'de ilk cevaplanmamış soruyu bulsun
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        sonnerToast.error(data.error || 'Denetim başlatılamadı')
        return
      }
      setSelectedInspection(data.inspection)
      setCategories(Array.isArray(data.categories) ? data.categories : [])
      
      // Set answers from response
      setAnswers(data.answersMap || {})
      
      // Resume from saved/calculated position
      if (isResume && (inspection.status === 'in_progress' || data.inspection?.status === 'in_progress')) {
        const resumeCatIndex = data.inspection.currentCategoryIndex || 0
        const resumeQIndex = data.inspection.currentQuestionIndex || 0
        setCurrentCategoryIndex(resumeCatIndex)
        setResumePosition({
          categoryIndex: resumeCatIndex,
          questionIndex: resumeQIndex
        })
        
        // Show detailed resume info
        const resumeInfo = data.resumeInfo
        if (resumeInfo) {
          // Check if all questions are answered
          if (resumeInfo.totalAnswered >= resumeInfo.totalQuestions) {
            // All questions answered - show finish confirmation
            sonnerToast.info(
              `Tüm sorular zaten cevaplandı (${resumeInfo.totalAnswered}/${resumeInfo.totalQuestions}). Denetimi tamamlayabilirsiniz.`,
              { duration: 5000 }
            )
            // Set flag to show finish dialog
            setAllAnsweredOnResume(true)
          } else {
            sonnerToast.success(
              `Kaldığınız yerden devam ediliyor\n${resumeInfo.totalAnswered}/${resumeInfo.totalQuestions} soru cevaplandı`,
              { duration: 4000 }
            )
            setAllAnsweredOnResume(false)
          }
        } else {
          sonnerToast.success(`Kategori ${resumeCatIndex + 1}, Soru ${resumeQIndex + 1}'den devam ediliyor`)
          setAllAnsweredOnResume(false)
        }
      } else {
        setCurrentCategoryIndex(0)
        setResumePosition(null)
        setAllAnsweredOnResume(false)
        sonnerToast.success('Denetim başlatıldı')
      }
      
      setView('inspection')
    } catch (error) {
      console.error('Start inspection error:', error)
      sonnerToast.error('Hata oluştu')
    }
  }

  // Find question position in categories
  const findQuestionPosition = (cats, questionId) => {
    for (let catIdx = 0; catIdx < cats.length; catIdx++) {
      const questions = cats[catIdx].questions || []
      for (let qIdx = 0; qIdx < questions.length; qIdx++) {
        if (questions[qIdx].id === questionId) {
          return { categoryIndex: catIdx, questionIndex: qIdx }
        }
      }
    }
    return null
  }

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
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          inspectionId: selectedInspection.id,
          questionId,
          answer,
          note,
          photos,
          // Include position for autosave
          currentCategoryIndex: catIndex,
          currentQuestionIndex: qIndex,
          removeSkipped,
        })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        sonnerToast.error(data.error || 'Kaydetme hatası')
        return
      }

      setAnswers({
        ...answers,
        [questionId]: { answer, note, photos }
      })

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
  
  // Save progress helper
  const saveProgress = async (catIndex, qIndex) => {
    try {
      await fetch('/api/inspector/inspection/progress', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          inspectionId: selectedInspection.id,
          currentCategoryIndex: catIndex,
          currentQuestionIndex: qIndex
        })
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
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ inspectionId: selectedInspection.id })
      })
      
      sonnerToast.success('Denetim tamamlandı!')
      setView('list')
      loadInspections()
    } catch (error) {
      sonnerToast.error('Hata oluştu')
    }
  }

  if (view === 'inspection' && selectedInspection && categories.length > 0) {
    return <InspectionFlow 
      inspection={selectedInspection}
      categories={categories}
      initialCategoryIndex={currentCategoryIndex}
      initialQuestionIndex={resumePosition?.questionIndex || 0}
      answers={answers}
      saveAnswer={saveAnswer}
      saveProgress={saveProgress}
      completeInspection={completeInspection}
      onCancel={() => setView('list')}
      token={token}
      showFinishOnLoad={allAnsweredOnResume}
      onSkippedIdsChange={onSkippedIdsChange}
    />
  }

  // Edit mode - Kategori bazlı düzenleme
  if (view === 'edit' && selectedInspection && categories.length > 0) {
    return <InspectionEditMode 
      inspection={selectedInspection}
      categories={categories}
      answers={answers}
      setAnswers={setAnswers}
      onCancel={() => {
        setView('list')
        setEditMode(false)
        loadInspections()
      }}
      token={token}
    />
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Denetim Paneli</h1>
          <p className="text-muted-foreground">Hoş geldiniz, {user.name}</p>
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Denetimlerim ({inspections.length})</h2>
        
        {inspections.length === 0 ? (
          <Card className="p-12 text-center">
            <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Henüz atanmış denetim yok</h3>
            <p className="text-muted-foreground">Yönetici size denetim atadığında buradan görebileceksiniz</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inspections.map(insp => (
              <Card key={insp.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{insp.schoolName}</CardTitle>
                      <CardDescription>{insp.city?.name} / {insp.district}</CardDescription>
                    </div>
                    {insp.status === 'completed' && (
                      <Badge variant="success" className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Tamamlandı
                      </Badge>
                    )}
                    {insp.status === 'in_progress' && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3 mr-1" /> Devam Ediyor
                      </Badge>
                    )}
                    {insp.status === 'pending' && (
                      <Badge variant="secondary">Bekliyor</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{insp.package?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(insp.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      })}</span>
                    </div>
                    
                    {insp.payment?.status === 'completed' ? (
                      <div className="pt-4 border-t">
                        {insp.status === 'pending' && (
                          <Button className="w-full" onClick={() => startInspection(insp, false)}>
                            <Zap className="h-4 w-4 mr-2" />
                            Denetimi Başlat
                          </Button>
                        )}
                        {insp.status === 'in_progress' && (
                          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => startInspection(insp, true)}>
                            <ChevronRight className="h-4 w-4 mr-2" />
                            Denetime Devam Et
                          </Button>
                        )}
                        {insp.status === 'completed' && (
                          <div className="space-y-2">
                            <Button className="w-full" variant="outline" disabled>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Tamamlandı
                            </Button>
                            {isEditable(insp.completedAt) && (
                              <div>
                                <Button 
                                  className="w-full bg-amber-500 hover:bg-amber-600 text-white" 
                                  onClick={() => startEditMode(insp)}
                                >
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Düzenle
                                </Button>
                                <p className="text-xs text-center text-amber-600 mt-1">
                                  ⏱️ {getRemainingTime(insp.completedAt)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="pt-4 border-t">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-800 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Ödeme bekleniyor
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
