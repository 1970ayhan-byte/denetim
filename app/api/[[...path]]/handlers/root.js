import { NextResponse } from 'next/server'

export async function handleRootRoutes(ctx) {
  const { route, method, handleCORS, NextResponse } = ctx

  if (route === '/' && method === 'GET') {
    return handleCORS(
      NextResponse.json({
        message: 'Okul Denetim API',
        version: '1.0.0',
      }),
    )
  }

  return null
}
