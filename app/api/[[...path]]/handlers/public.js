import { NextResponse } from 'next/server'
import { createMessage } from '@/lib/dbWrites'
import {
  listPackagesPublicWithFeatures,
  listCitiesByNameAsc,
  listNewsPublished,
  newsBySlug,
} from '@/lib/dbReads'
export async function handlePublicRoutes(ctx) {
  const { request, route, method, path, handleCORS, NextResponse } = ctx

  // ============ PUBLIC - PACKAGES ============
  
  if (route === '/packages' && method === 'GET') {
    const packagesWithFeatures = await listPackagesPublicWithFeatures()
    return handleCORS(NextResponse.json(packagesWithFeatures))
  }
  
  // ============ PUBLIC - CITIES ============
  
  if (route === '/cities' && method === 'GET') {
    const cities = await listCitiesByNameAsc()
    return handleCORS(NextResponse.json(cities))
  }
  
  // ============ PUBLIC - NEWS ============
  
  if (route === '/news' && method === 'GET') {
    const news = await listNewsPublished(12)
    return handleCORS(NextResponse.json(news))
  }
  
  if (route.startsWith('/news/') && method === 'GET') {
    const slug = path[path.length - 1]
    const news = await newsBySlug(slug)
    if (!news) {
      return handleCORS(NextResponse.json({ error: 'Haber bulunamadı' }, { status: 404 }))
    }
    return handleCORS(NextResponse.json(news))
  }
  
  // ============ PUBLIC - CONTACT FORM ============
  
  if (route === '/contact' && method === 'POST') {
    const data = await request.json()
    const message = await createMessage(data)
    
    // Mock: SMS bildirimi
    console.log('[MOCK SMS] Admin: Yeni form mesajı geldi')
    
    return handleCORS(NextResponse.json({ 
      message: 'Mesajınız alındı, en kısa sürede dönüş yapacağız',
      id: message.id
    }))
  }

  return null
}
