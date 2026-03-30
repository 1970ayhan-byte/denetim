import { NextResponse } from 'next/server'
import { corsOptionsResponse, handleCORS } from './handlers/cors'
import { dispatchApi } from './handlers/dispatch'

export async function OPTIONS() {
  return corsOptionsResponse()
}

async function handleRoute(request, context) {
  try {
    return await dispatchApi(request, context.params)
  } catch (error) {
    console.error('API Error:', error)
    const status = typeof error.statusCode === 'number' ? error.statusCode : 500
    return handleCORS(
      NextResponse.json({ error: error.message || 'Internal server error' }, { status }),
    )
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
