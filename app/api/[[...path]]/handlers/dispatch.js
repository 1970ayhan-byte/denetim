import { NextResponse } from 'next/server'
import { handleCORS } from './cors'
import { handleAuthRoutes } from './auth'
import { handleAdminRoutes } from './admin'
import { handlePublicRoutes } from './public'
import { handlePaymentRoutes } from './payment'
import { handleInspectorRoutes } from './inspector'
import { handleAdminReportRoutes } from './adminReports'
import { handleRootRoutes } from './root'

const chain = [
  handleAuthRoutes,
  handleAdminRoutes,
  handlePublicRoutes,
  handlePaymentRoutes,
  handleInspectorRoutes,
  handleAdminReportRoutes,
  handleRootRoutes,
]

/**
 * Catch-all API: sıra önemli (eski route.js ile aynı eşleşme sırası).
 */
export async function dispatchApi(request, params) {
  const path = params?.path || []
  const route = `/${path.join('/')}`
  const method = request.method
  const ctx = { request, route, method, path, handleCORS, NextResponse }

  for (const fn of chain) {
    const res = await fn(ctx)
    if (res) return res
  }

  return handleCORS(
    NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }),
  )
}
