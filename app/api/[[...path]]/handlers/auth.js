import { NextResponse } from 'next/server'
import { findUserByPhone } from '@/lib/dbReads'
import { hashPassword, comparePassword, generateToken } from '@/lib/auth'
import { createUser } from '@/lib/dbWrites'
export async function handleAuthRoutes(ctx) {
  const { request, route, method, path, handleCORS, NextResponse } = ctx

  // Login
  if (route === '/auth/login' && method === 'POST') {
    const { phone, password } = await request.json()
    
    const user = await findUserByPhone(phone)
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
    const user = await createUser({
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
    const user = await findUserByPhone(phone)
    
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

  return null
}
