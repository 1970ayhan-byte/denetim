import { NextResponse } from 'next/server'
import sharp from 'sharp'
import {
  updateInspection,
  addSkippedQuestion,
  removeSkippedQuestion,
  createInspectionAnswer,
  updateInspectionAnswer,
  findInspectionAnswerByInspectionAndQuestion,
  deleteInspectionAnswerForQuestion,
} from '@/lib/dbWrites'
import {
  listInspectionsForInspector,
  getInspectionDetailForInspector,
  getInspectionWithAnswersForStart,
  inspectionAnswersChronological,
  inspectionScalarsById,
  inspectionEveryQuestionAnsweredOrSkipped,
  listCategoriesWithQuestions,
  getPackageById,
  filterCategoriesByPackageFeatures,
} from '@/lib/dbReads'
import { getAuthUser } from '@/lib/auth'
export async function handleInspectorRoutes(ctx) {
  const { request, route, method, path, handleCORS, NextResponse } = ctx

  // ============ INSPECTOR - MY INSPECTIONS ============
  
  if (route === '/inspector/inspections' && method === 'GET') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'inspector') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const inspections = await listInspectionsForInspector(authUser.id)
    return handleCORS(NextResponse.json(inspections))
  }
  
  // ============ INSPECTOR - INSPECTION DETAIL ============
  
  if (route.startsWith('/inspector/inspection/') && method === 'GET') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'inspector') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const id = path[path.length - 1]
    const inspection = await getInspectionDetailForInspector(id)
    
    if (!inspection || inspection.inspectorId !== authUser.id) {
      return handleCORS(NextResponse.json({ error: 'Denetim bulunamadı' }, { status: 404 }))
    }
    
    return handleCORS(NextResponse.json(inspection))
  }
  
  // ============ INSPECTOR - START INSPECTION ============
  
  if (route === '/inspector/inspection/start' && method === 'POST') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'inspector') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const { inspectionId, findFirstUnanswered = false } = await request.json()
    
    // Get current inspection with position info
    let inspection = await getInspectionWithAnswersForStart(inspectionId)
    if (!inspection) {
      return handleCORS(NextResponse.json({ error: 'Denetim bulunamadı' }, { status: 404 }))
    }
    
    // Only update status if it's pending
    if (inspection.status === 'pending') {
      await updateInspection(inspectionId, { status: 'in_progress' })
      inspection = await getInspectionWithAnswersForStart(inspectionId)
      if (!inspection) {
        return handleCORS(NextResponse.json({ error: 'Denetim bulunamadı' }, { status: 404 }))
      }
    }
    
    // Tüm kategoriler, sonra paket özellikleriyle (kategori adı eşleşmesi) filtrele
    const allCategories = await listCategoriesWithQuestions()
    const packageDoc = inspection.packageId
      ? await getPackageById(inspection.packageId)
      : null
    const categories = filterCategoriesByPackageFeatures(allCategories, packageDoc)
  
    const clampIndices = (catIdx, qIdx) => {
      const nCat = categories.length
      if (nCat === 0) return { catIdx: 0, qIdx: 0 }
      let c = Math.min(Math.max(0, catIdx), nCat - 1)
      const nQ = categories[c]?.questions?.length ?? 0
      const maxQ = Math.max(0, nQ - 1)
      const q = Math.min(Math.max(0, qIdx), maxQ)
      return { catIdx: c, qIdx: q }
    }
    
    // Build answers map
    const answersMap = {}
    ;(inspection.answers || []).forEach(a => {
      answersMap[a.questionId] = {
        answer: a.answer,
        note: a.note || '',
        photos: a.photos ? JSON.parse(a.photos) : []
      }
    })
    
    let { catIdx: resumeCategoryIndex, qIdx: resumeQuestionIndex } = clampIndices(
      inspection.currentCategoryIndex ?? 0,
      inspection.currentQuestionIndex ?? 0
    )
    
    if (findFirstUnanswered && inspection.status === 'in_progress') {
      let foundUnanswered = false
      
      for (let catIdx = 0; catIdx < categories.length && !foundUnanswered; catIdx++) {
        const questions = categories[catIdx].questions || []
        for (let qIdx = 0; qIdx < questions.length && !foundUnanswered; qIdx++) {
          const questionId = questions[qIdx].id
          if (!answersMap[questionId]) {
            // Found first unanswered question
            resumeCategoryIndex = catIdx
            resumeQuestionIndex = qIdx
            foundUnanswered = true
            
            // Update inspection position
            await updateInspection(inspectionId, { 
              currentCategoryIndex: catIdx,
              currentQuestionIndex: qIdx
            })
          }
        }
      }
      
      // If all questions answered, stay at last position
      if (!foundUnanswered) {
        // Go to last question
        const lastCatIdx = categories.length - 1
        const lastQIdx = (categories[lastCatIdx]?.questions?.length || 1) - 1
        resumeCategoryIndex = lastCatIdx
        resumeQuestionIndex = lastQIdx
      }
    }
    
    ;({
      catIdx: resumeCategoryIndex,
      qIdx: resumeQuestionIndex,
    } = clampIndices(resumeCategoryIndex, resumeQuestionIndex))
  
    const scopedQuestionIds = new Set()
    for (const cat of categories) {
      for (const q of cat.questions || []) scopedQuestionIds.add(q.id)
    }
    const totalQuestionsScoped = scopedQuestionIds.size
    const totalAnsweredScoped = [...scopedQuestionIds].filter((id) => answersMap[id]).length
    
    return handleCORS(NextResponse.json({ 
      inspection: {
        ...inspection,
        currentCategoryIndex: resumeCategoryIndex,
        currentQuestionIndex: resumeQuestionIndex
      },
      categories,
      answersMap,
      resumeInfo: {
        categoryIndex: resumeCategoryIndex,
        questionIndex: resumeQuestionIndex,
        totalAnswered: totalAnsweredScoped,
        totalQuestions: totalQuestionsScoped
      }
    }))
  }
  
  // ============ INSPECTOR - SAVE ANSWER ============
  
  if (route === '/inspector/inspection/answer' && method === 'POST') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'inspector') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const {
      inspectionId,
      questionId,
      answer,
      note,
      photos,
      currentCategoryIndex,
      currentQuestionIndex,
      removeSkipped,
    } = await request.json()
    
    // Get inspection to check status and edit window
    const inspection = await inspectionScalarsById(inspectionId)
    
    if (!inspection) {
      return handleCORS(NextResponse.json({ error: 'Denetim bulunamadı' }, { status: 404 }))
    }
    
    // Check if inspection is completed - enforce 6-hour edit window
    if (inspection.status === 'completed' && inspection.completedAt) {
      const now = new Date()
      const completedTime = new Date(inspection.completedAt)
      const diffHours = (now - completedTime) / (1000 * 60 * 60)
      
      if (diffHours > 6) {
        return handleCORS(NextResponse.json({ 
          error: 'Düzenleme süresi doldu. Tamamlanmış denetimlerde 6 saat içinde düzenleme yapılabilir.',
          expiredAt: new Date(completedTime.getTime() + 6 * 60 * 60 * 1000).toISOString()
        }, { status: 403 }))
      }
    }
    
    // Check if answer exists
    const existing = await findInspectionAnswerByInspectionAndQuestion(inspectionId, questionId)
    
    let answerRecord
    if (existing) {
      answerRecord = await updateInspectionAnswer(existing.id, { 
        answer, 
        note: note || '',
        photos: photos ? JSON.stringify(photos) : ''
      })
    } else {
      answerRecord = await createInspectionAnswer({
        inspectionId,
        questionId,
        answer,
        note: note || '',
        photos: photos ? JSON.stringify(photos) : ''
      })
    }
    
    // Update inspection progress (currentQuestionIndex, currentCategoryIndex)
    if (currentCategoryIndex !== undefined && currentQuestionIndex !== undefined) {
      await updateInspection(inspectionId, { 
        currentCategoryIndex,
        currentQuestionIndex
      })
    }
  
    if (removeSkipped === true) {
      await removeSkippedQuestion(inspectionId, questionId).catch(() => {})
    }
    
    return handleCORS(NextResponse.json(answerRecord))
  }
  
  // ============ INSPECTOR - SKIP QUESTION (GEÇ) ============
  
  if (route === '/inspector/inspection/skip-question' && method === 'POST') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'inspector') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
  
    const { inspectionId, questionId, currentCategoryIndex, currentQuestionIndex } =
      await request.json()
  
    if (!inspectionId || !questionId) {
      return handleCORS(NextResponse.json({ error: 'Eksik parametre' }, { status: 400 }))
    }
  
    const insp = await inspectionScalarsById(inspectionId)
    if (!insp || insp.inspectorId !== authUser.id) {
      return handleCORS(NextResponse.json({ error: 'Denetim bulunamadı' }, { status: 404 }))
    }
  
    if (insp.status === 'completed') {
      return handleCORS(NextResponse.json({ error: 'Tamamlanmış denetimde soru geçilemez' }, { status: 403 }))
    }

    await deleteInspectionAnswerForQuestion(inspectionId, questionId)
    let updated = await addSkippedQuestion(inspectionId, questionId)
    if (currentCategoryIndex !== undefined && currentQuestionIndex !== undefined) {
      updated = await updateInspection(inspectionId, {
        currentCategoryIndex,
        currentQuestionIndex,
      })
    }
  
    return handleCORS(NextResponse.json({ inspection: updated }))
  }
  
  // ============ INSPECTOR - UPLOAD PHOTO ============
  
  if (route === '/inspector/inspection/upload-photo' && method === 'POST') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'inspector') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const formData = await request.formData()
    const file = formData.get('photo')
    
    if (!file) {
      return handleCORS(NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 }))
    }
    
    // Convert to buffer and optimize
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const optimized = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer()
    
    // In production, upload to cloud storage (S3, Supabase Storage, etc.)
    // For now, save as base64
    const base64 = optimized.toString('base64')
    const dataUrl = `data:image/jpeg;base64,${base64}`
    
    return handleCORS(NextResponse.json({ url: dataUrl }))
  }
  
  // ============ INSPECTOR - COMPLETE INSPECTION ============
  
  if (route === '/inspector/inspection/complete' && method === 'POST') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'inspector') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
  
    const { inspectionId } = await request.json()
    if (!inspectionId) {
      return handleCORS(NextResponse.json({ error: 'Eksik parametre' }, { status: 400 }))
    }
  
    const insp = await inspectionScalarsById(inspectionId)
    if (!insp || insp.inspectorId !== authUser.id) {
      return handleCORS(NextResponse.json({ error: 'Denetim bulunamadı' }, { status: 404 }))
    }
    if (insp.status === 'completed') {
      return handleCORS(NextResponse.json({ error: 'Denetim zaten tamamlanmış' }, { status: 400 }))
    }
  
    const skipped = Array.isArray(insp.skippedQuestionIds) ? insp.skippedQuestionIds : []
    if (skipped.length > 0) {
      const coverage = await inspectionEveryQuestionAnsweredOrSkipped(inspectionId)
      if (!coverage.ok) {
        return handleCORS(
          NextResponse.json(
            {
              error:
                'Bazı sorular ne cevaplandı ne de geçildi. Eksik soruları tamamlayın veya Geç ile işaretleyin.',
              skippedCount: skipped.length,
            },
            { status: 400 },
          ),
        )
      }
    }
  
    const inspection = await updateInspection(inspectionId, {
      status: 'completed',
      completedAt: new Date(),
    })
  
    return handleCORS(
      NextResponse.json({
        message: 'Denetim tamamlandı',
        inspection,
      }),
    )
  }
  
  // ============ INSPECTOR - SAVE PROGRESS (Ara Ver) ============
  
  if (route === '/inspector/inspection/progress' && method === 'POST') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'inspector') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const { inspectionId, currentCategoryIndex, currentQuestionIndex } = await request.json()
    
    const inspection = await updateInspection(inspectionId, { 
      currentCategoryIndex,
      currentQuestionIndex
    })
    
    return handleCORS(NextResponse.json({ 
      message: 'İlerleme kaydedildi',
      inspection
    }))
  }
  
  // ============ INSPECTOR - GET EXISTING ANSWERS (for resume) ============
  
  if (path[0] === 'inspector' && path[1] === 'inspection' && path[3] === 'answers' && method === 'GET') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'inspector') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const inspectionId = path[2]
    const answers = await inspectionAnswersChronological(inspectionId)
    
    // Convert to map format
    const answersMap = {}
    answers.forEach(a => {
      answersMap[a.questionId] = {
        answer: a.answer,
        note: a.note || '',
        photos: a.photos ? JSON.parse(a.photos) : []
      }
    })
    
    return handleCORS(NextResponse.json({ 
      answers: answersMap,
      lastAnsweredQuestionId: answers.length > 0 ? answers[answers.length - 1].questionId : null
    }))
  }

  return null
}
