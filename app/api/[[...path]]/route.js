import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { mongoCreateQuestion, mongoUpdateQuestion, mongoDeleteQuestion } from '@/lib/questionsMongo'
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
      
      const user = await prisma.user.findUnique({ where: { phone } })
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
      
      const exists = await prisma.user.findUnique({ where: { phone } })
      if (exists) {
        return handleCORS(NextResponse.json({ error: 'Bu telefon numarası zaten kayıtlı' }, { status: 400 }))
      }
      
      const hashedPassword = await hashPassword(password)
      const user = await prisma.user.create({
        data: { phone, password: hashedPassword, name, role: role || 'inspector' }
      })
      
      return handleCORS(NextResponse.json({ 
        message: 'Kullanıcı oluşturuldu',
        user: { id: user.id, phone: user.phone, name: user.name, role: user.role }
      }))
    }
    
    // Password Reset Request (Mock SMS)
    if (route === '/auth/reset-password' && method === 'POST') {
      const { phone } = await request.json()
      const user = await prisma.user.findUnique({ where: { phone } })
      
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
      const categories = await prisma.category.findMany({
        orderBy: { order: 'asc' },
        include: { questions: { orderBy: { order: 'asc' } } }
      })
      return handleCORS(NextResponse.json(categories))
    }
    
    if (route === '/admin/categories' && method === 'POST') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const { name, order } = await request.json()
      const category = await prisma.category.create({
        data: { name, order: order || 0 }
      })
      return handleCORS(NextResponse.json(category))
    }
    
    if (route.startsWith('/admin/categories/') && method === 'PUT') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      const { name, order } = await request.json()
      const category = await prisma.category.update({
        where: { id },
        data: { name, order }
      })
      return handleCORS(NextResponse.json(category))
    }
    
    if (route.startsWith('/admin/categories/') && method === 'DELETE') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      await prisma.category.delete({ where: { id } })
      return handleCORS(NextResponse.json({ message: 'Kategori silindi' }))
    }
    
    // ============ ADMIN - QUESTIONS ============
    
    if (route === '/admin/questions' && method === 'GET') {
      const { categoryId } = Object.fromEntries(new URL(request.url).searchParams)
      const where = categoryId ? { categoryId } : {}
      
      const questions = await prisma.question.findMany({
        where,
        orderBy: { order: 'asc' },
        include: { category: true }
      })
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
      // Native Mongo insert: Prisma writes require a replica set; standalone MongoDB rejects them.
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
      
      const staff = await prisma.user.findMany({
        where: { role: 'inspector' },
        select: { id: true, phone: true, name: true, role: true, createdAt: true }
      })
      return handleCORS(NextResponse.json(staff))
    }
    
    if (route === '/admin/staff' && method === 'POST') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const { phone, password, name } = await request.json()
      const hashedPassword = await hashPassword(password)
      const user = await prisma.user.create({
        data: { phone, password: hashedPassword, name, role: 'inspector' }
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
      
      const user = await prisma.user.update({
        where: { id },
        data
      })
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
      await prisma.user.delete({ where: { id } })
      return handleCORS(NextResponse.json({ message: 'Personel silindi' }))
    }
    
    // ============ ADMIN - PACKAGES ============
    
    if (route === '/admin/packages' && method === 'GET') {
      const packages = await prisma.package.findMany({
        orderBy: { createdAt: 'desc' }
      })
      return handleCORS(NextResponse.json(packages))
    }
    
    if (route === '/admin/packages' && method === 'POST') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const data = await request.json()
      if (typeof data.features === 'object') {
        data.features = JSON.stringify(data.features)
      }
      
      const pkg = await prisma.package.create({ data })
      return handleCORS(NextResponse.json(pkg))
    }
    
    if (route.startsWith('/admin/packages/') && method === 'PUT') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      const data = await request.json()
      if (typeof data.features === 'object') {
        data.features = JSON.stringify(data.features)
      }
      
      const pkg = await prisma.package.update({
        where: { id },
        data
      })
      return handleCORS(NextResponse.json(pkg))
    }
    
    if (route.startsWith('/admin/packages/') && method === 'DELETE') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      await prisma.package.delete({ where: { id } })
      return handleCORS(NextResponse.json({ message: 'Paket silindi' }))
    }
    
    // ============ ADMIN - CITIES ============
    
    if (route === '/admin/cities' && method === 'GET') {
      const cities = await prisma.city.findMany({
        orderBy: { name: 'asc' }
      })
      return handleCORS(NextResponse.json(cities))
    }
    
    if (route === '/admin/cities' && method === 'POST') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const data = await request.json()
      const city = await prisma.city.create({ data })
      return handleCORS(NextResponse.json(city))
    }
    
    if (route.startsWith('/admin/cities/') && method === 'PUT') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      const data = await request.json()
      const city = await prisma.city.update({
        where: { id },
        data
      })
      return handleCORS(NextResponse.json(city))
    }
    
    if (route.startsWith('/admin/cities/') && method === 'DELETE') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      await prisma.city.delete({ where: { id } })
      return handleCORS(NextResponse.json({ message: 'İl silindi' }))
    }
    
    // ============ ADMIN - MESSAGES ============
    
    if (route === '/admin/messages' && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const { status } = Object.fromEntries(new URL(request.url).searchParams)
      const where = status ? { status } : {}
      
      const messages = await prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 30
      })
      return handleCORS(NextResponse.json(messages))
    }
    
    if (route.startsWith('/admin/messages/') && method === 'PUT') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      const { status, note } = await request.json()
      const message = await prisma.message.update({
        where: { id },
        data: { status, note }
      })
      return handleCORS(NextResponse.json(message))
    }
    
    // ============ ADMIN - PAYMENTS ============
    
    if (route === '/admin/payments' && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const payments = await prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        include: { package: true, city: true },
        take: 500 // Limit for performance
      })
      return handleCORS(NextResponse.json(payments))
    }
    
    // ============ ADMIN - INSPECTIONS ============
    
    if (route === '/admin/inspections' && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const inspections = await prisma.inspection.findMany({
        orderBy: { createdAt: 'desc' },
        include: { 
          city: true, 
          package: true, 
          inspector: { select: { name: true, phone: true } },
          payment: true
        },
        take: 500 // Limit for performance
      })
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
      const inspection = await prisma.inspection.update({
        where: { id },
        data: { inspectorId }
      })
      return handleCORS(NextResponse.json(inspection))
    }
    
    // ============ ADMIN - NEWS ============
    
    if (route === '/admin/news' && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const news = await prisma.news.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200 // Limit for performance
      })
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
      
      const news = await prisma.news.create({ data })
      return handleCORS(NextResponse.json(news))
    }
    
    if (route.startsWith('/admin/news/') && method === 'PUT') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      const data = await request.json()
      const news = await prisma.news.update({
        where: { id },
        data
      })
      return handleCORS(NextResponse.json(news))
    }
    
    if (route.startsWith('/admin/news/') && method === 'DELETE') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      await prisma.news.delete({ where: { id } })
      return handleCORS(NextResponse.json({ message: 'Haber silindi' }))
    }
    
    // ============ PUBLIC - PACKAGES ============
    
    if (route === '/packages' && method === 'GET') {
      const packages = await prisma.package.findMany({
        where: { active: true },
        orderBy: { price: 'asc' }
      })
      
      // Parse features JSON
      const packagesWithFeatures = packages.map(pkg => ({
        ...pkg,
        features: typeof pkg.features === 'string' ? JSON.parse(pkg.features || '[]') : pkg.features
      }))
      
      return handleCORS(NextResponse.json(packagesWithFeatures))
    }
    
    // ============ PUBLIC - CITIES ============
    
    if (route === '/cities' && method === 'GET') {
      const cities = await prisma.city.findMany({
        orderBy: { name: 'asc' }
      })
      return handleCORS(NextResponse.json(cities))
    }
    
    // ============ PUBLIC - NEWS ============
    
    if (route === '/news' && method === 'GET') {
      const news = await prisma.news.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: 12
      })
      return handleCORS(NextResponse.json(news))
    }
    
    if (route.startsWith('/news/') && method === 'GET') {
      const slug = path[path.length - 1]
      const news = await prisma.news.findUnique({
        where: { slug }
      })
      if (!news) {
        return handleCORS(NextResponse.json({ error: 'Haber bulunamadı' }, { status: 404 }))
      }
      return handleCORS(NextResponse.json(news))
    }
    
    // ============ PUBLIC - CONTACT FORM ============
    
    if (route === '/contact' && method === 'POST') {
      const data = await request.json()
      const message = await prisma.message.create({ data })
      
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
      const payment = await prisma.payment.create({
        data: {
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
          status: 'pending'
        }
      })
      
      // Mock: ParamPOS entegrasyonu
      console.log('[MOCK PAYMENT] ParamPOS ödeme isteği:', payment.id)
      
      // Auto-complete for demo (gerçekte ParamPOS callback gelecek)
      const completedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'completed',
          paidAt: new Date(),
          transactionId: `MOCK-${uuidv4().substring(0, 8)}`
        }
      })
      
      // Create inspection
      const inspection = await prisma.inspection.create({
        data: {
          schoolName: data.schoolName,
          cityId: data.cityId,
          district: data.district || '',
          packageId: data.packageId,
          paymentId: completedPayment.id,
          schoolContact: data.contactName,
          schoolPhone: data.contactPhone,
          schoolEmail: data.contactEmail || '',
          status: 'pending'
        }
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
      
      const inspections = await prisma.inspection.findMany({
        where: { inspectorId: authUser.id },
        orderBy: { createdAt: 'desc' },
        include: { city: true, package: true, payment: true }
      })
      return handleCORS(NextResponse.json(inspections))
    }
    
    // ============ INSPECTOR - INSPECTION DETAIL ============
    
    if (route.startsWith('/inspector/inspection/') && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'inspector') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[path.length - 1]
      const inspection = await prisma.inspection.findUnique({
        where: { id },
        include: { 
          city: true, 
          package: true,
          answers: {
            include: { question: { include: { category: true } } }
          }
        }
      })
      
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
      let inspection = await prisma.inspection.findUnique({
        where: { id: inspectionId },
        include: { answers: true }
      })
      
      // Only update status if it's pending
      if (inspection.status === 'pending') {
        inspection = await prisma.inspection.update({
          where: { id: inspectionId },
          data: { status: 'in_progress' },
          include: { answers: true }
        })
      }
      
      // Get all questions for inspection
      const categories = await prisma.category.findMany({
        orderBy: { order: 'asc' },
        include: { questions: { orderBy: { order: 'asc' } } }
      })
      
      // Build answers map
      const answersMap = {}
      inspection.answers.forEach(a => {
        answersMap[a.questionId] = {
          answer: a.answer,
          note: a.note || '',
          photos: a.photos ? JSON.parse(a.photos) : []
        }
      })
      
      // Find first unanswered question (for resume functionality)
      let resumeCategoryIndex = inspection.currentCategoryIndex || 0
      let resumeQuestionIndex = inspection.currentQuestionIndex || 0
      
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
              await prisma.inspection.update({
                where: { id: inspectionId },
                data: { 
                  currentCategoryIndex: catIdx,
                  currentQuestionIndex: qIdx
                }
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
          totalAnswered: Object.keys(answersMap).length,
          totalQuestions: categories.reduce((sum, cat) => sum + (cat.questions?.length || 0), 0)
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
      const inspection = await prisma.inspection.findUnique({
        where: { id: inspectionId }
      })
      
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
      const existing = await prisma.inspectionAnswer.findFirst({
        where: { inspectionId, questionId }
      })
      
      let answerRecord
      if (existing) {
        answerRecord = await prisma.inspectionAnswer.update({
          where: { id: existing.id },
          data: { 
            answer, 
            note: note || '',
            photos: photos ? JSON.stringify(photos) : ''
          }
        })
      } else {
        answerRecord = await prisma.inspectionAnswer.create({
          data: {
            inspectionId,
            questionId,
            answer,
            note: note || '',
            photos: photos ? JSON.stringify(photos) : ''
          }
        })
      }
      
      // Update inspection progress (currentQuestionIndex, currentCategoryIndex)
      if (currentCategoryIndex !== undefined && currentQuestionIndex !== undefined) {
        await prisma.inspection.update({
          where: { id: inspectionId },
          data: { 
            currentCategoryIndex,
            currentQuestionIndex
          }
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
      const inspection = await prisma.inspection.update({
        where: { id: inspectionId },
        data: { 
          status: 'completed',
          completedAt: new Date()
        }
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
      
      const inspection = await prisma.inspection.update({
        where: { id: inspectionId },
        data: { 
          currentCategoryIndex,
          currentQuestionIndex
        }
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
      const answers = await prisma.inspectionAnswer.findMany({
        where: { inspectionId },
        include: { question: true },
        orderBy: { createdAt: 'asc' }
      })
      
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
      const messages = await prisma.message.findMany({
        where: { createdAt: { gte: startDate } }
      })
      
      // Get inspections
      const inspections = await prisma.inspection.findMany({
        where: { createdAt: { gte: startDate } },
        include: { package: true }
      })
      
      // Get payments
      const payments = await prisma.payment.findMany({
        where: { 
          createdAt: { gte: startDate },
          status: 'completed'
        }
      })
      
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
      
      const where = {}
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
      
      const inspections = await prisma.inspection.findMany({
        where,
        include: {
          city: true,
          package: true,
          inspector: { select: { name: true, phone: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
      
      return handleCORS(NextResponse.json(inspections))
    }
    
    // ============ ADMIN - GET INSPECTION REPORT (FULL) ============
    
    if (route.startsWith('/admin/inspection/') && route.endsWith('/report') && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[2]
      const inspection = await prisma.inspection.findUnique({
        where: { id },
        include: {
          city: true,
          package: true,
          inspector: { select: { name: true, phone: true } },
          answers: {
            include: { question: { include: { category: true } } },
            orderBy: { question: { order: 'asc' } }
          }
        }
      })
      
      if (!inspection) {
        return handleCORS(NextResponse.json({ error: 'Denetim bulunamadı' }, { status: 404 }))
      }
      
      // Get all categories with questions for summary
      const categories = await prisma.category.findMany({
        orderBy: { order: 'asc' },
        include: { questions: { orderBy: { order: 'asc' } } }
      })
      
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
      
      const answer = await prisma.inspectionAnswer.update({
        where: { id: answerId },
        data: { note }
      })
      
      return handleCORS(NextResponse.json(answer))
    }
    
    // ============ ADMIN - GENERATE PDF REPORT ============
    
    if (route.startsWith('/admin/inspection/') && route.endsWith('/pdf') && method === 'GET') {
      const authUser = getAuthUser(request)
      if (!authUser || authUser.role !== 'admin') {
        return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
      }
      
      const id = path[2]
      const inspection = await prisma.inspection.findUnique({
        where: { id },
        include: {
          city: true,
          package: true,
          inspector: { select: { name: true, phone: true } },
          answers: {
            where: {
              OR: [
                { answer: 'uygun_degil' },
                { answer: 'goreceli' }
              ]
            },
            include: { question: { include: { category: true } } }
          }
        }
      })
      
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
