import { NextResponse } from 'next/server'
import {
  mongoCreateUser,
  mongoUpdateUser,
  mongoDeleteUser,
  mongoCreateCategory,
  mongoUpdateCategory,
  mongoDeleteCategory,
  mongoCreateQuestion,
  mongoUpdateQuestion,
  mongoDeleteQuestion,
  mongoCreatePackage,
  mongoUpdatePackage,
  mongoDeletePackage,
  mongoCreateCity,
  mongoUpdateCity,
  mongoDeleteCity,
  mongoCreateMessage,
  mongoUpdateMessage,
  mongoCreateNews,
  mongoUpdateNews,
  mongoDeleteNews,
  mongoCreatePayment,
  mongoUpdatePayment,
  mongoCreateInspection,
  mongoUpdateInspection,
  mongoCreateInspectionAnswer,
  mongoUpdateInspectionAnswer,
  mongoFindInspectionAnswerByInspectionAndQuestion,
} from '@/lib/mongoWrites'
import {
  mongoListPaymentsAdmin,
  mongoListInspectionsAdmin,
  mongoListInspectionsForInspector,
  mongoListInspectionsExport,
  mongoGetInspectionDetailForInspector,
  mongoGetInspectionWithAnswersForStart,
  mongoInspectionAnswersChronological,
  mongoGetAdminInspectionReport,
  mongoGetAdminInspectionPdf,
  mongoInspectionsSinceForStats,
  mongoListQuestionsWithCategory,
  mongoGetPackageById,
  filterCategoriesByPackageFeatures,
  mongoFindUserByPhone,
  mongoListStaffInspectors,
  mongoListCategoriesWithQuestions,
  mongoListPackagesAdmin,
  mongoListPackagesPublicWithFeatures,
  mongoListCitiesByNameAsc,
  mongoListMessagesAdmin,
  mongoListNewsAdmin,
  mongoListNewsPublished,
  mongoNewsBySlug,
  mongoInspectionScalarsById,
  mongoMessagesSince,
  mongoPaymentsCompletedSince,
} from '@/lib/mongoReads'
import { hashPassword, comparePassword, generateToken, getAuthUser } from '@/lib/auth'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

// CORS Helper
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Main route handler
async function handleRoute(request, { params }) {
  const { path = [] } = params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    // ============ AUTH ENDPOINTS ============
    
    // Login
    if (route === '/auth/login' && method === 'POST') {
      const { phone, password } = await request.json()
      
      const user = await mongoFindUserByPhone(phone)
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 401 }))
      }
      
      const valid = await comparePassword(password, user.password)
      if (!valid) {
        return handleCORS(NextResponse.json({ error: 'Şifre hatalı' }, { status: 401 }))
      }
      
      const token = generateToken(user)
      return handleCORS(NextResponse.json({ 
        token, 
        user: { id: user.id, phone: user.phone, name: user.name, role: user.role }
      }))
    }
    
    // Register (Admin only - will create first admin manually)
    if (route === '/auth/register' && method === 'POST') {
      const { phone, password, name, role } = await request.json()
      
      const hashedPassword = await hashPassword(password)
      const user = await mongoCreateUser({
        phone,
        password: hashedPassword,
        name,
        role: role || 'inspector',
      })
      
      return handleCORS(NextResponse.json({ 
        message: 'Kullanıcı oluşturuldu',
        user: { id: user.id, phone: user.phone, name: user.name, role: user.role }
      }))
    }
    
    // Password Reset Request (Mock SMS)
    if (route === '/auth/reset-password' && method === 'POST') {
      const { phone } = await request.json()
      const user = await mongoFindUserByPhone(phone)
      
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 }))
      }
      
      // Mock: Gerçekte SMS gönderilecek
      console.log(`[MOCK SMS] Şifre sıfırlama kodu ${phone} numarasına gönderildi: 123456`)
      
      return handleCORS(NextResponse.json({ 
        message: 'Şifre sıfırlama kodu telefon numaranıza gönderildi',
        mock: { code: '123456', userId: user.id }
      }))
    }
    
    // ============ ADMIN - CATEGORIES ============
    
    if (route === '/admin/categories' && method === 'GET') {
      const categories = await mongoListCategoriesWithQuestions()
      return handleCORS(NextResponse.json(categories))
    }
    
    if (route === '/admin/categories' && method === 'POST') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const { name, order } = await request.json()
      const category = await mongoCreateCategory({ name, order: order || 0 })
      return handleCORS(NextResponse.json(category))
    }
    
    if (route.startsWith('/admin/categories/') && method === 'PUT') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      const { name, order } = await request.json()
      const category = await mongoUpdateCategory(id, { name, order })
      return handleCORS(NextResponse.json(category))
    }
    
    if (route.startsWith('/admin/categories/') && method === 'DELETE') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      await mongoDeleteCategory(id)
      return handleCORS(NextResponse.json({ message: 'Kategori silindi' }))
    }
    
    // ============ ADMIN - QUESTIONS ============
    
    if (route === '/admin/questions' && method === 'GET') {
      const { categoryId } = Object.fromEntries(new URL(request.url).searchParams)
      const questions = await mongoListQuestionsWithCategory(categoryId || null)
      return handleCORS(NextResponse.json(questions))
    }
    
    if (route === '/admin/questions' && method === 'POST') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const data = await request.json()
      // Convert 'none' to empty string for penaltyType
      if (data.penaltyType === 'none') {
        data.penaltyType = ''
      }
      const question = await mongoCreateQuestion(data)
      return handleCORS(NextResponse.json(question))
    }
    
    if (route.startsWith('/admin/questions/') && method === 'PUT') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      const data = await request.json()
      // Convert 'none' to empty string for penaltyType
      if (data.penaltyType === 'none') {
        data.penaltyType = ''
      }
      const question = await mongoUpdateQuestion(id, data)
      return handleCORS(NextResponse.json(question))
    }
    
    if (route.startsWith('/admin/questions/') && method === 'DELETE') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      await mongoDeleteQuestion(id)
      return handleCORS(NextResponse.json({ message: 'Soru silindi' }))
    }
    
    // ============ ADMIN - STAFF (Personel) ============
    
    if (route === '/admin/staff' && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const staff = await mongoListStaffInspectors()
      return handleCORS(NextResponse.json(staff))
    }
    
    if (route === '/admin/staff' && method === 'POST') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const { phone, password, name } = await request.json()
      const hashedPassword = await hashPassword(password)
      const user = await mongoCreateUser({
        phone,
        password: hashedPassword,
        name,
        role: 'inspector',
      })
      return handleCORS(NextResponse.json({ 
        id: user.id, phone: user.phone, name: user.name, role: user.role 
      }))
    }
    
    if (route.startsWith('/admin/staff/') && method === 'PUT') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      const { phone, password, name } = await request.json()
      const data = { phone, name }
      if (password) {
        data.password = await hashPassword(password)
      }
      
      const user = await mongoUpdateUser(id, data)
      return handleCORS(NextResponse.json({ 
        id: user.id, phone: user.phone, name: user.name, role: user.role 
      }))
    }
    
    if (route.startsWith('/admin/staff/') && method === 'DELETE') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      await mongoDeleteUser(id)
      return handleCORS(NextResponse.json({ message: 'Personel silindi' }))
    }
    
    // ============ ADMIN - PACKAGES ============
    
    if (route === '/admin/packages' && method === 'GET') {
      const packages = await mongoListPackagesAdmin()
      return handleCORS(NextResponse.json(packages))
    }
    
    if (route === '/admin/packages' && method === 'POST') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const data = await request.json()
      const pkg = await mongoCreatePackage(data)
      return handleCORS(NextResponse.json(pkg))
    }
    
    if (route.startsWith('/admin/packages/') && method === 'PUT') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      const data = await request.json()
      const pkg = await mongoUpdatePackage(id, data)
      return handleCORS(NextResponse.json(pkg))
    }
    
    if (route.startsWith('/admin/packages/') && method === 'DELETE') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      await mongoDeletePackage(id)
      return handleCORS(NextResponse.json({ message: 'Paket silindi' }))
    }
    
    // ============ ADMIN - CITIES ============
    
    if (route === '/admin/cities' && method === 'GET') {
      const cities = await mongoListCitiesByNameAsc()
      return handleCORS(NextResponse.json(cities))
    }
    
    if (route === '/admin/cities' && method === 'POST') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const data = await request.json()
      const city = await mongoCreateCity(data)
      return handleCORS(NextResponse.json(city))
    }
    
    if (route.startsWith('/admin/cities/') && method === 'PUT') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      const data = await request.json()
      const city = await mongoUpdateCity(id, data)
      return handleCORS(NextResponse.json(city))
    }
    
    if (route.startsWith('/admin/cities/') && method === 'DELETE') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      await mongoDeleteCity(id)
      return handleCORS(NextResponse.json({ message: 'İl silindi' }))
    }
    
    // ============ ADMIN - MESSAGES ============
    
    if (route === '/admin/messages' && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const { status } = Object.fromEntries(new URL(request.url).searchParams)
      const messages = await mongoListMessagesAdmin(status || null, 30)
      return handleCORS(NextResponse.json(messages))
    }
    
    if (route.startsWith('/admin/messages/') && method === 'PUT') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      const { status, note } = await request.json()
      const message = await mongoUpdateMessage(id, { status, note })
      return handleCORS(NextResponse.json(message))
    }
    
    // ============ ADMIN - PAYMENTS ============
    
    if (route === '/admin/payments' && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const payments = await mongoListPaymentsAdmin(500)
      return handleCORS(NextResponse.json(payments))
    }
    
    // ============ ADMIN - INSPECTIONS ============
    
    if (route === '/admin/inspections' && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const inspections = await mongoListInspectionsAdmin(500)
      return handleCORS(NextResponse.json(inspections))
    }
    
    // Assign inspector to inspection
    if (route.startsWith('/admin/inspections/') && route.endsWith('/assign') && method === 'PUT') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[2]
      const { inspectorId } = await request.json()
      const inspection = await mongoUpdateInspection(id, { inspectorId })
      return handleCORS(NextResponse.json(inspection))
    }
    
    // ============ ADMIN - NEWS ============
    
    if (route === '/admin/news' && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const news = await mongoListNewsAdmin(200)
      return handleCORS(NextResponse.json(news))
    }
    
    if (route === '/admin/news' && method === 'POST') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const data = await request.json()
      // Create slug from title
      data.slug = data.title.toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      
      const news = await mongoCreateNews(data)
      return handleCORS(NextResponse.json(news))
    }
    
    if (route.startsWith('/admin/news/') && method === 'PUT') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      const data = await request.json()
      const news = await mongoUpdateNews(id, data)
      return handleCORS(NextResponse.json(news))
    }
    
    if (route.startsWith('/admin/news/') && method === 'DELETE') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      await mongoDeleteNews(id)
      return handleCORS(NextResponse.json({ message: 'Haber silindi' }))
    }
    
    // ============ PUBLIC - PACKAGES ============
    
    if (route === '/packages' && method === 'GET') {
      const packagesWithFeatures = await mongoListPackagesPublicWithFeatures()
      return handleCORS(NextResponse.json(packagesWithFeatures))
    }
    
    // ============ PUBLIC - CITIES ============
    
    if (route === '/cities' && method === 'GET') {
      const cities = await mongoListCitiesByNameAsc()
      return handleCORS(NextResponse.json(cities))
    }
    
    // ============ PUBLIC - NEWS ============
    
    if (route === '/news' && method === 'GET') {
      const news = await mongoListNewsPublished(12)
      return handleCORS(NextResponse.json(news))
    }
    
    if (route.startsWith('/news/') && method === 'GET') {
      const slug = path[path.length - 1]
      const news = await mongoNewsBySlug(slug)
      if (!news) {
        return handleCORS(NextResponse.json({ error: 'Haber bulunamadı' }, { status: 404 }))
      }
      return handleCORS(NextResponse.json(news))
    }
    
    // ============ PUBLIC - CONTACT FORM ============
    
    if (route === '/contact' && method === 'POST') {
      const data = await request.json()
      const message = await mongoCreateMessage(data)
      
      // Mock: SMS bildirimi
      console.log('[MOCK SMS] Admin: Yeni form mesajı geldi')
      
      return handleCORS(NextResponse.json({ 
        message: 'Mesajınız alındı, en kısa sürede dönüş yapacağız',
        id: message.id
      }))
    }
    
    // ============ PAYMENT ============
    
    if (route === '/payment/initiate' && method === 'POST') {
      const data = await request.json()
      
      // Create payment record
      const payment = await mongoCreatePayment({
        amount: data.amount,
        packageId: data.packageId,
        schoolName: data.schoolName,
        cityId: data.cityId,
        district: data.district || '',
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail || '',
        taxOffice: data.taxOffice || '',
        taxNumber: data.taxNumber || '',
        address: data.address || '',
        status: 'pending',
      })
      
      // Mock: ParamPOS entegrasyonu
      console.log('[MOCK PAYMENT] ParamPOS ödeme isteği:', payment.id)
      
      // Auto-complete for demo (gerçekte ParamPOS callback gelecek)
      const completedPayment = await mongoUpdatePayment(payment.id, { 
        status: 'completed',
        paidAt: new Date(),
        transactionId: `MOCK-${uuidv4().substring(0, 8)}`
      })
      
      // Create inspection
      const inspection = await mongoCreateInspection({
        schoolName: data.schoolName,
        cityId: data.cityId,
        district: data.district || '',
        packageId: data.packageId,
        paymentId: completedPayment.id,
        schoolContact: data.contactName,
        schoolPhone: data.contactPhone,
        schoolEmail: data.contactEmail || '',
        status: 'pending',
      })
      
      // Mock: SMS bildirimi
      console.log(`[MOCK SMS] ${data.contactPhone}: Ödemeniz alındı. Denetim kodu: ${inspection.id}`)
      
      return handleCORS(NextResponse.json({ 
        success: true,
        payment: completedPayment,
        inspection,
        message: 'Ödeme başarılı! (DEMO MODE)'
      }))
    }
    
    // ============ INSPECTOR - MY INSPECTIONS ============
    
    if (route === '/inspector/inspections' && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'inspector') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const inspections = await mongoListInspectionsForInspector(authUser.id)
      return handleCORS(NextResponse.json(inspections))
    }
    
    // ============ INSPECTOR - INSPECTION DETAIL ============
    
    if (route.startsWith('/inspector/inspection/') && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'inspector') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      const inspection = await mongoGetInspectionDetailForInspector(id)
      
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
      let inspection = await mongoGetInspectionWithAnswersForStart(inspectionId)
      if (!inspection) {
        return handleCORS(NextResponse.json({ error: 'Denetim bulunamadı' }, { status: 404 }))
      }
      
      // Only update status if it's pending
      if (inspection.status === 'pending') {
        await mongoUpdateInspection(inspectionId, { status: 'in_progress' })
        inspection = await mongoGetInspectionWithAnswersForStart(inspectionId)
        if (!inspection) {
          return handleCORS(NextResponse.json({ error: 'Denetim bulunamadı' }, { status: 404 }))
        }
      }
      
      // Tüm kategoriler, sonra paket özellikleriyle (kategori adı eşleşmesi) filtrele
      const allCategories = await mongoListCategoriesWithQuestions()
      const packageDoc = inspection.packageId
        ? await mongoGetPackageById(inspection.packageId)
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
              await mongoUpdateInspection(inspectionId, { 
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
      
      const { inspectionId, questionId, answer, note, photos, currentCategoryIndex, currentQuestionIndex } = await request.json()
      
      // Get inspection to check status and edit window
      const inspection = await mongoInspectionScalarsById(inspectionId)
      
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
      const existing = await mongoFindInspectionAnswerByInspectionAndQuestion(inspectionId, questionId)
      
      let answerRecord
      if (existing) {
        answerRecord = await mongoUpdateInspectionAnswer(existing.id, { 
          answer, 
          note: note || '',
          photos: photos ? JSON.stringify(photos) : ''
        })
      } else {
        answerRecord = await mongoCreateInspectionAnswer({
          inspectionId,
          questionId,
          answer,
          note: note || '',
          photos: photos ? JSON.stringify(photos) : ''
        })
      }
      
      // Update inspection progress (currentQuestionIndex, currentCategoryIndex)
      if (currentCategoryIndex !== undefined && currentQuestionIndex !== undefined) {
        await mongoUpdateInspection(inspectionId, { 
          currentCategoryIndex,
          currentQuestionIndex
        })
      }
      
      return handleCORS(NextResponse.json(answerRecord))
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
      const inspection = await mongoUpdateInspection(inspectionId, { 
        status: 'completed',
        completedAt: new Date()
      })
      
      return handleCORS(NextResponse.json({ 
        message: 'Denetim tamamlandı',
        inspection
      }))
    }
    
    // ============ INSPECTOR - SAVE PROGRESS (Ara Ver) ============
    
    if (route === '/inspector/inspection/progress' && method === 'POST') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'inspector') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const { inspectionId, currentCategoryIndex, currentQuestionIndex } = await request.json()
      
      const inspection = await mongoUpdateInspection(inspectionId, { 
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
      const answers = await mongoInspectionAnswersChronological(inspectionId)
      
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
    
    // ============ ADMIN - DASHBOARD STATS ============
    
    if (route === '/admin/stats' && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const url = new URL(request.url)
      const period = url.searchParams.get('period') || '1m' // 1m, 3m, 6m, 1y, 2y
      
      // Calculate date range
      const now = new Date()
      let startDate = new Date()
      
      switch(period) {
        case '1m': startDate.setMonth(now.getMonth() - 1); break
        case '3m': startDate.setMonth(now.getMonth() - 3); break
        case '6m': startDate.setMonth(now.getMonth() - 6); break
        case '1y': startDate.setFullYear(now.getFullYear() - 1); break
        case '2y': startDate.setFullYear(now.getFullYear() - 2); break
        default: startDate.setMonth(now.getMonth() - 1)
      }
      
      // Get messages count
      const messages = await mongoMessagesSince(startDate)
      
      // Get inspections (no relation include — avoids Prisma errors on orphan packageId)
      const inspections = await mongoInspectionsSinceForStats(startDate)
      
      // Get payments
      const payments = await mongoPaymentsCompletedSince(startDate)
      
      // Calculate totals
      const totalMessages = messages.length
      const totalInspections = inspections.filter(i => i.status === 'completed').length
      const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
      
      // Group by month for chart data
      const chartData = []
      const tempDate = new Date(startDate)
      
      while (tempDate <= now) {
        const monthStart = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1)
        const monthEnd = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0)
        
        const monthMessages = messages.filter(m => {
          const d = new Date(m.createdAt)
          return d >= monthStart && d <= monthEnd
        }).length
        
        const monthInspections = inspections.filter(i => {
          const d = new Date(i.createdAt)
          return d >= monthStart && d <= monthEnd && i.status === 'completed'
        }).length
        
        const monthRevenue = payments.filter(p => {
          const d = new Date(p.createdAt)
          return d >= monthStart && d <= monthEnd
        }).reduce((sum, p) => sum + (p.amount || 0), 0)
        
        chartData.push({
          month: tempDate.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
          mesajlar: monthMessages,
          denetimler: monthInspections,
          ciro: monthRevenue
        })
        
        tempDate.setMonth(tempDate.getMonth() + 1)
      }
      
      return handleCORS(NextResponse.json({
        totals: {
          messages: totalMessages,
          inspections: totalInspections,
          revenue: totalRevenue
        },
        chartData
      }))
    }
    
    // ============ ADMIN - EXPORT INSPECTIONS LIST ============
    
    if (route === '/admin/inspections/export' && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const url = new URL(request.url)
      const startDate = url.searchParams.get('startDate')
      const endDate = url.searchParams.get('endDate')
      
      const inspections = await mongoListInspectionsExport(startDate, endDate)
      
      return handleCORS(NextResponse.json(inspections))
    }
    
    // ============ ADMIN - GET INSPECTION REPORT (FULL) ============
    
    if (route.startsWith('/admin/inspection/') && route.endsWith('/report') && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[2]
      const inspection = await mongoGetAdminInspectionReport(id)
      
      if (!inspection) {
        return handleCORS(NextResponse.json({ error: 'Denetim bulunamadı' }, { status: 404 }))
      }
      
      const allCats = await mongoListCategoriesWithQuestions()
      const pkgForReport = inspection.packageId
        ? await mongoGetPackageById(inspection.packageId)
        : null
      const categories = filterCategoriesByPackageFeatures(allCats, pkgForReport)
      
      return handleCORS(NextResponse.json({
        inspection,
        categories,
        generatedAt: new Date().toLocaleDateString('tr-TR'),
        company: 'SARIMEŞE DANIŞMANLIK'
      }))
    }
    
    // ============ ADMIN - UPDATE INSPECTION ANSWER NOTE ============
    
    if (route.startsWith('/admin/inspection/') && route.includes('/answer/') && method === 'PUT') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const answerId = path[path.length - 1]
      const { note } = await request.json()
      
      const answer = await mongoUpdateInspectionAnswer(answerId, { note })
      
      return handleCORS(NextResponse.json(answer))
    }
    
    // ============ ADMIN - GENERATE PDF REPORT ============
    
    if (route.startsWith('/admin/inspection/') && route.endsWith('/pdf') && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[2]
      const inspection = await mongoGetAdminInspectionPdf(id)
      
      if (!inspection) {
        return handleCORS(NextResponse.json({ error: 'Denetim bulunamadı' }, { status: 404 }))
      }
      
      // Generate PDF content
      const pdfContent = {
        inspection,
        generatedAt: new Date().toLocaleDateString('tr-TR'),
        company: 'SARIMEŞE DANIŞMANLIK'
      }
      
      return handleCORS(NextResponse.json(pdfContent))
    }
    
    // Root
    if (route === '/' && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        message: 'Okul Denetim API',
        version: '1.0.0'
      }))
    }
    
    // 404
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` },
      { status: 404 }
    ))
    
  } catch (error) {
    console.error('API Error:', error)
    const status = typeof error.statusCode === 'number' ? error.statusCode : 500
    return handleCORS(NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status }
    ))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
