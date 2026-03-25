import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { runSeed } from '@/lib/seedDb'

const LOCK_ID = 'api_seed_once'

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-access-token',
  }
}

function json(body, status = 200) {
  const res = NextResponse.json(body, { status })
  Object.entries(corsHeaders()).forEach(([k, v]) => res.headers.set(k, v))
  return res
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

export async function POST(request) {
  const token = process.env.SEED_ACCESS_TOKEN ?? '123123'
  const header = request.headers.get('x-access-token')
  if (!header || header !== token) {
    return json({ error: 'Yetkisiz' }, 401)
  }

  const mongoUrl = process.env.MONGO_URL
  if (!mongoUrl) {
    return json({ error: 'MONGO_URL tanımlı değil' }, 500)
  }

  const client = new MongoClient(mongoUrl)
  try {
    await client.connect()
    const db = client.db()

    try {
      await db.collection('_seed_lock').insertOne({
        _id: LOCK_ID,
        createdAt: new Date(),
        source: 'api',
      })
    } catch (e) {
      if (e?.code === 11000) {
        return json(
          { error: 'Seed bu API ile daha önce çalıştırıldı', code: 'ALREADY_SEEDED' },
          409,
        )
      }
      throw e
    }

    try {
      const summary = await runSeed(db)
      return json({ ok: true, message: 'Seed tamamlandı', summary })
    } catch (seedErr) {
      await db.collection('_seed_lock').deleteOne({ _id: LOCK_ID })
      console.error('[api/seed]', seedErr)
      return json({ error: 'Seed başarısız', detail: String(seedErr?.message || seedErr) }, 500)
    }
  } finally {
    await client.close()
  }
}
