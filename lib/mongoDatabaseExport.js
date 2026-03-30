import { getMongoDb } from '@/lib/mongoDb'
import { toApiShape } from '@/lib/mongoWrites'

/** Mongo koleksiyon adı → import/JSON anahtarı (PostgreSQL import ile uyumlu) */
const COLLECTION_MAP = [
  ['User', 'users'],
  ['City', 'cities'],
  ['Package', 'packages'],
  ['Category', 'categories'],
  ['Question', 'questions'],
  ['Payment', 'payments'],
  ['Inspection', 'inspections'],
  ['InspectionAnswer', 'inspectionAnswers'],
  ['Message', 'messages'],
  ['News', 'news'],
]

/**
 * Tüm uygulama koleksiyonlarını tek JSON yapısında döner (_id → id).
 * @returns {Promise<{ version: number, exportedAt: string } & Record<string, unknown[]>>}
 */
export async function mongoExportFullDatabase() {
  const db = await getMongoDb()
  const exportedAt = new Date().toISOString()
  const out = {
    version: 1,
    exportedAt,
    users: [],
    cities: [],
    packages: [],
    categories: [],
    questions: [],
    payments: [],
    inspections: [],
    inspectionAnswers: [],
    messages: [],
    news: [],
  }

  for (const [collName, key] of COLLECTION_MAP) {
    const docs = await db.collection(collName).find({}).toArray()
    out[key] = docs.map((d) => toApiShape(d))
  }

  return out
}
