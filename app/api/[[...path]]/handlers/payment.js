import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createPayment, updatePayment, createInspection } from '@/lib/dbWrites'
export async function handlePaymentRoutes(ctx) {
  const { request, route, method, path, handleCORS, NextResponse } = ctx

  // ============ PAYMENT ============
  
  if (route === '/payment/initiate' && method === 'POST') {
    const data = await request.json()
    
    // Create payment record
    const payment = await createPayment({
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
    const completedPayment = await updatePayment(payment.id, { 
      status: 'completed',
      paidAt: new Date(),
      transactionId: `MOCK-${uuidv4().substring(0, 8)}`
    })
    
    // Create inspection
    const inspection = await createInspection({
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

  return null
}
