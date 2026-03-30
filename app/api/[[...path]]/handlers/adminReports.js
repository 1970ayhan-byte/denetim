import { NextResponse } from 'next/server'
import { updateInspectionAnswer } from '@/lib/dbWrites'
import {
  messagesSince,
  inspectionsSinceForStats,
  listInspectionsExport,
  getAdminInspectionReport,
  getAdminInspectionPdf,
  listCategoriesWithQuestions,
  getPackageById,
  filterCategoriesByPackageFeatures,
  paymentsCompletedSince,
} from '@/lib/dbReads'
import { getAuthUser } from '@/lib/auth'
export async function handleAdminReportRoutes(ctx) {
  const { request, route, method, path, handleCORS, NextResponse } = ctx

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
    const messages = await messagesSince(startDate)
    
    // Get inspections (no relation include — avoids Prisma errors on orphan packageId)
    const inspections = await inspectionsSinceForStats(startDate)
    
    // Get payments
    const payments = await paymentsCompletedSince(startDate)
    
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
    
    const inspections = await listInspectionsExport(startDate, endDate)
    
    return handleCORS(NextResponse.json(inspections))
  }
  
  // ============ ADMIN - GET INSPECTION REPORT (FULL) ============
  
  if (route.startsWith('/admin/inspection/') && route.endsWith('/report') && method === 'GET') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const id = path[2]
    const inspection = await getAdminInspectionReport(id)
    
    if (!inspection) {
      return handleCORS(NextResponse.json({ error: 'Denetim bulunamadı' }, { status: 404 }))
    }
    
    const allCats = await listCategoriesWithQuestions()
    const pkgForReport = inspection.packageId
      ? await getPackageById(inspection.packageId)
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
    
    const answer = await updateInspectionAnswer(answerId, { note })
    
    return handleCORS(NextResponse.json(answer))
  }
  
  // ============ ADMIN - GENERATE PDF REPORT ============
  
  if (route.startsWith('/admin/inspection/') && route.endsWith('/pdf') && method === 'GET') {
    const authUser = getAuthUser(request)
    if (!authUser || authUser.role !== 'admin') {
      return handleCORS(NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 }))
    }
    
    const id = path[2]
    const inspection = await getAdminInspectionPdf(id)
    
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

  return null
}
