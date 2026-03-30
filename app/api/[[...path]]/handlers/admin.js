import { NextResponse } from 'next/server'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestionsInCategory,
  createPackage,
  updatePackage,
  deletePackage,
  createCity,
  updateCity,
  deleteCity,
  createMessage,
  updateMessage,
  createNews,
  updateNews,
  deleteNews,
  createUser,
  updateUser,
  deleteUser,
  updateInspection,
  deleteInspection,
} from '@/lib/dbWrites'
import {
  listCategoriesWithQuestions,
  listQuestionsWithCategory,
  listStaffInspectors,
  listPackagesAdmin,
  listCitiesByNameAsc,
  listMessagesAdmin,
  listPaymentsAdmin,
  listInspectionsAdmin,
  listNewsAdmin,
} from '@/lib/dbReads'
import { hashPassword, getAuthUser } from '@/lib/auth'
export async function handleAdminRoutes(ctx) {
  const { request, route, method, path, handleCORS, NextResponse } = ctx

  // ============ ADMIN - CATEGORIES ============
  
  if (route === '/admin/categories' && method === 'GET') {
    const categories = await listCategoriesWithQuestions()
    return handleCORS(NextResponse.json(categories))
  }
  
  if (route === '/admin/categories' && method === 'POST') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const { name, order } = await request.json()
    const category = await createCategory({ name, order: order || 0 })
    return handleCORS(NextResponse.json(category))
  }
  
  if (route.startsWith('/admin/categories/') && method === 'PUT') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const id = path[path.length - 1]
    const { name, order } = await request.json()
    const category = await updateCategory(id, { name, order })
    return handleCORS(NextResponse.json(category))
  }
  
  if (route.startsWith('/admin/categories/') && method === 'DELETE') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const id = path[path.length - 1]
    await deleteCategory(id)
    return handleCORS(NextResponse.json({ message: 'Kategori silindi' }))
  }
  
  // ============ ADMIN - QUESTIONS ============
  
  if (route === '/admin/questions' && method === 'GET') {
    const { categoryId } = Object.fromEntries(new URL(request.url).searchParams)
    const questions = await listQuestionsWithCategory(categoryId || null)
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
    const question = await createQuestion(data)
    return handleCORS(NextResponse.json(question))
  }

  if (route === '/admin/questions/reorder' && method === 'POST') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    const { categoryId, orderedIds } = await request.json()
    await reorderQuestionsInCategory(categoryId, orderedIds)
    return handleCORS(NextResponse.json({ ok: true }))
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
    const question = await updateQuestion(id, data)
    return handleCORS(NextResponse.json(question))
  }
  
  if (route.startsWith('/admin/questions/') && method === 'DELETE') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const id = path[path.length - 1]
    await deleteQuestion(id)
    return handleCORS(NextResponse.json({ message: 'Soru silindi' }))
  }
  
  // ============ ADMIN - STAFF (Personel) ============
  
  if (route === '/admin/staff' && method === 'GET') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const staff = await listStaffInspectors()
    return handleCORS(NextResponse.json(staff))
  }
  
  if (route === '/admin/staff' && method === 'POST') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const { phone, password, name } = await request.json()
    const hashedPassword = await hashPassword(password)
    const user = await createUser({
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
    
    const user = await updateUser(id, data)
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
    await deleteUser(id)
    return handleCORS(NextResponse.json({ message: 'Personel silindi' }))
  }
  
  // ============ ADMIN - PACKAGES ============
  
  if (route === '/admin/packages' && method === 'GET') {
    const packages = await listPackagesAdmin()
    return handleCORS(NextResponse.json(packages))
  }
  
  if (route === '/admin/packages' && method === 'POST') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const data = await request.json()
    const pkg = await createPackage(data)
    return handleCORS(NextResponse.json(pkg))
  }
  
  if (route.startsWith('/admin/packages/') && method === 'PUT') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const id = path[path.length - 1]
    const data = await request.json()
    const pkg = await updatePackage(id, data)
    return handleCORS(NextResponse.json(pkg))
  }
  
  if (route.startsWith('/admin/packages/') && method === 'DELETE') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const id = path[path.length - 1]
    await deletePackage(id)
    return handleCORS(NextResponse.json({ message: 'Paket silindi' }))
  }
  
  // ============ ADMIN - CITIES ============
  
  if (route === '/admin/cities' && method === 'GET') {
    const cities = await listCitiesByNameAsc()
    return handleCORS(NextResponse.json(cities))
  }
  
  if (route === '/admin/cities' && method === 'POST') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const data = await request.json()
    const city = await createCity(data)
    return handleCORS(NextResponse.json(city))
  }
  
  if (route.startsWith('/admin/cities/') && method === 'PUT') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const id = path[path.length - 1]
    const data = await request.json()
    const city = await updateCity(id, data)
    return handleCORS(NextResponse.json(city))
  }
  
  if (route.startsWith('/admin/cities/') && method === 'DELETE') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const id = path[path.length - 1]
    await deleteCity(id)
    return handleCORS(NextResponse.json({ message: 'İl silindi' }))
  }
  
  // ============ ADMIN - MESSAGES ============
  
  if (route === '/admin/messages' && method === 'GET') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const { status } = Object.fromEntries(new URL(request.url).searchParams)
    const messages = await listMessagesAdmin(status || null, 30)
    return handleCORS(NextResponse.json(messages))
  }
  
  if (route.startsWith('/admin/messages/') && method === 'PUT') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const id = path[path.length - 1]
    const { status, note } = await request.json()
    const message = await updateMessage(id, { status, note })
    return handleCORS(NextResponse.json(message))
  }
  
  // ============ ADMIN - PAYMENTS ============
  
  if (route === '/admin/payments' && method === 'GET') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const payments = await listPaymentsAdmin(500)
    return handleCORS(NextResponse.json(payments))
  }
  
  // ============ ADMIN - INSPECTIONS ============
  
  if (route === '/admin/inspections' && method === 'GET') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const inspections = await listInspectionsAdmin(500)
    return handleCORS(NextResponse.json(inspections))
  }
  
  if (
    method === 'DELETE' &&
    path.length === 3 &&
    path[0] === 'admin' &&
    path[1] === 'inspections' &&
    path[2] !== 'export'
  ) {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    const id = path[2]
    if (!id) {
      return handleCORS(NextResponse.json({ error: 'Eksik parametre' }, { status: 400 }))
    }
    try {
      await deleteInspection(id)
      return handleCORS(NextResponse.json({ ok: true }))
    } catch (e) {
      const status = e?.statusCode || 500
      return handleCORS(
        NextResponse.json({ error: e?.message || 'Silinemedi' }, { status }),
      )
    }
  }
  
  // Assign inspector to inspection
  if (route.startsWith('/admin/inspections/') && route.endsWith('/assign') && method === 'PUT') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const id = path[2]
    const { inspectorId } = await request.json()
    const inspection = await updateInspection(id, { inspectorId })
    return handleCORS(NextResponse.json(inspection))
  }
  
  // ============ ADMIN - NEWS ============
  
  if (route === '/admin/news' && method === 'GET') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const news = await listNewsAdmin(200)
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
    
    const news = await createNews(data)
    return handleCORS(NextResponse.json(news))
  }
  
  if (route.startsWith('/admin/news/') && method === 'PUT') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const id = path[path.length - 1]
    const data = await request.json()
    const news = await updateNews(id, data)
    return handleCORS(NextResponse.json(news))
  }
  
  if (route.startsWith('/admin/news/') && method === 'DELETE') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const id = path[path.length - 1]
    await deleteNews(id)
    return handleCORS(NextResponse.json({ message: 'Haber silindi' }))
  }

  return null
}
