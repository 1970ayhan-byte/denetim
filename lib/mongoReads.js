import { getMongoDb } from '@/lib/mongoDb'
import { toApiShape } from '@/lib/mongoWrites'

/**
 * Prisma MongoDB, include ile zorunlu ilişkide hedef kayıt yoksa
 * ("Inconsistent query result: Field package is required...") hata verir.
 * Bu modül eksik paket/şehir/ödeme/soru için null döndürür.
 */

export async function enrichInspectionRelations(db, inspRaw) {
  const base = toApiShape(inspRaw)
  const [cityDoc, pkgDoc, payDoc] = await Promise.all([
    inspRaw.cityId ? db.collection('City').findOne({ _id: inspRaw.cityId }) : null,
    inspRaw.packageId ? db.collection('Package').findOne({ _id: inspRaw.packageId }) : null,
    inspRaw.paymentId ? db.collection('Payment').findOne({ _id: inspRaw.paymentId }) : null,
  ])
  return {
    ...base,
    city: cityDoc ? toApiShape(cityDoc) : null,
    package: pkgDoc ? toApiShape(pkgDoc) : null,
    payment: payDoc ? toApiShape(payDoc) : null,
  }
}

export async function withInspectorSelect(db, inspRaw, enriched) {
  if (!inspRaw.inspectorId) {
    return { ...enriched, inspector: null }
  }
  const u = await db.collection('User').findOne({ _id: inspRaw.inspectorId })
  return {
    ...enriched,
    inspector: u ? { name: u.name, phone: u.phone } : null,
  }
}

export async function mongoListInspectionsForInspector(inspectorId) {
  const db = await getMongoDb()
  const rows = await db
    .collection('Inspection')
    .find({ inspectorId })
    .sort({ createdAt: -1 })
    .toArray()
  return Promise.all(rows.map((r) => enrichInspectionRelations(db, r)))
}

export async function mongoListInspectionsAdmin(limit = 500) {
  const db = await getMongoDb()
  const rows = await db
    .collection('Inspection')
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
  const out = []
  for (const r of rows) {
    const e = await enrichInspectionRelations(db, r)
    out.push(await withInspectorSelect(db, r, e))
  }
  return out
}

export async function mongoListInspectionsExport(startDate, endDate) {
  const db = await getMongoDb()
  const q =
    startDate && endDate
      ? {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        }
      : {}
  const rows = await db.collection('Inspection').find(q).sort({ createdAt: -1 }).toArray()
  const out = []
  for (const r of rows) {
    const e = await enrichInspectionRelations(db, r)
    out.push(await withInspectorSelect(db, r, e))
  }
  return out
}

export async function mongoListPaymentsAdmin(limit = 500) {
  const db = await getMongoDb()
  const rows = await db
    .collection('Payment')
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
  return Promise.all(
    rows.map(async (p) => {
      const base = toApiShape(p)
      const [pkgDoc, cityDoc] = await Promise.all([
        p.packageId ? db.collection('Package').findOne({ _id: p.packageId }) : null,
        p.cityId ? db.collection('City').findOne({ _id: p.cityId }) : null,
      ])
      return {
        ...base,
        package: pkgDoc ? toApiShape(pkgDoc) : null,
        city: cityDoc ? toApiShape(cityDoc) : null,
      }
    }),
  )
}

async function answerWithQuestionCategory(db, ansRaw) {
  const base = toApiShape(ansRaw)
  if (!ansRaw.questionId) {
    return { ...base, question: null }
  }
  const q = await db.collection('Question').findOne({ _id: ansRaw.questionId })
  if (!q) {
    return { ...base, question: null }
  }
  const cat = q.categoryId
    ? await db.collection('Category').findOne({ _id: q.categoryId })
    : null
  return {
    ...base,
    question: {
      ...toApiShape(q),
      category: cat ? toApiShape(cat) : null,
    },
  }
}

function sortAnswersByQuestionOrder(answers) {
  return [...answers].sort((a, b) => {
    const oa = a.question?.order ?? 999999
    const ob = b.question?.order ?? 999999
    if (oa !== ob) return oa - ob
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return ta - tb
  })
}

export async function mongoGetInspectionDetailForInspector(inspectionId) {
  const db = await getMongoDb()
  const raw = await db.collection('Inspection').findOne({ _id: inspectionId })
  if (!raw) return null
  const enriched = await enrichInspectionRelations(db, raw)
  const ansDocs = await db.collection('InspectionAnswer').find({ inspectionId }).toArray()
  const answers = await Promise.all(ansDocs.map((a) => answerWithQuestionCategory(db, a)))
  return {
    ...enriched,
    answers: sortAnswersByQuestionOrder(answers),
  }
}

export async function mongoGetInspectionWithAnswersForStart(inspectionId) {
  const db = await getMongoDb()
  const raw = await db.collection('Inspection').findOne({ _id: inspectionId })
  if (!raw) return null
  const base = toApiShape(raw)
  const ansDocs = await db
    .collection('InspectionAnswer')
    .find({ inspectionId })
    .sort({ createdAt: 1 })
    .toArray()
  const answers = ansDocs.map((d) => toApiShape(d))
  const skippedQuestionIds = Array.isArray(base.skippedQuestionIds)
    ? [...base.skippedQuestionIds]
    : []
  return { ...base, skippedQuestionIds, answers }
}

export async function mongoInspectionAnswersChronological(inspectionId) {
  const db = await getMongoDb()
  const ansDocs = await db
    .collection('InspectionAnswer')
    .find({ inspectionId })
    .sort({ createdAt: 1 })
    .toArray()
  return ansDocs.map((d) => toApiShape(d))
}

export async function mongoGetAdminInspectionReport(inspectionId) {
  const db = await getMongoDb()
  const raw = await db.collection('Inspection').findOne({ _id: inspectionId })
  if (!raw) return null
  const enriched = await enrichInspectionRelations(db, raw)
  const withInsp = await withInspectorSelect(db, raw, enriched)
  const ansDocs = await db.collection('InspectionAnswer').find({ inspectionId }).toArray()
  const answers = await Promise.all(ansDocs.map((a) => answerWithQuestionCategory(db, a)))
  return {
    ...withInsp,
    answers: sortAnswersByQuestionOrder(answers),
  }
}

export async function mongoGetAdminInspectionPdf(inspectionId) {
  const db = await getMongoDb()
  const raw = await db.collection('Inspection').findOne({ _id: inspectionId })
  if (!raw) return null
  const enriched = await enrichInspectionRelations(db, raw)
  const withInsp = await withInspectorSelect(db, raw, enriched)
  const ansDocs = await db
    .collection('InspectionAnswer')
    .find({
      inspectionId,
      answer: 'uygun_degil',
    })
    .toArray()
  const answers = await Promise.all(ansDocs.map((a) => answerWithQuestionCategory(db, a)))
  return {
    ...withInsp,
    answers: sortAnswersByQuestionOrder(answers),
  }
}

export async function mongoInspectionsSinceForStats(startDate) {
  const db = await getMongoDb()
  const rows = await db
    .collection('Inspection')
    .find({ createdAt: { $gte: startDate } })
    .toArray()
  return rows.map((r) => toApiShape(r))
}

export async function mongoListQuestionsWithCategory(categoryId) {
  const db = await getMongoDb()
  const q = categoryId ? { categoryId } : {}
  const questions = await db.collection('Question').find(q).sort({ order: 1 }).toArray()
  return Promise.all(
    questions.map(async (qu) => {
      const base = toApiShape(qu)
      const cat = qu.categoryId
        ? await db.collection('Category').findOne({ _id: qu.categoryId })
        : null
      return { ...base, category: cat ? toApiShape(cat) : null }
    }),
  )
}

export async function mongoGetPackageById(id) {
  if (!id) return null
  const db = await getMongoDb()
  return db.collection('Package').findOne({ _id: id })
}

/**
 * Paket.features (string[] veya JSON string): denetçide yalnızca `name` ile eşleşen kategoriler + soruları gösterilir.
 * Liste boş veya parse edilemezse tüm kategoriler (eski paketler için).
 */
export function filterCategoriesByPackageFeatures(categories, packageDoc) {
  if (!packageDoc || !categories?.length) return categories
  let names = []
  try {
    const f = packageDoc.features
    names = typeof f === 'string' ? JSON.parse(f || '[]') : f || []
  } catch {
    return categories
  }
  if (!Array.isArray(names) || names.length === 0) return categories
  const wanted = new Set(names.map((n) => String(n).trim()).filter(Boolean))
  if (wanted.size === 0) return categories
  return categories.filter((c) => wanted.has(String(c.name || '').trim()))
}

// --- Prisma yerine doğrudan Mongo okumaları (replica set / tutarsız ilişki hatalarından kaçınır) ---

export async function mongoFindUserByPhone(phone) {
  if (!phone) return null
  const db = await getMongoDb()
  const u = await db.collection('User').findOne({ phone })
  return u ? toApiShape(u) : null
}

export async function mongoListStaffInspectors() {
  const db = await getMongoDb()
  const rows = await db.collection('User').find({ role: 'inspector' }).toArray()
  return rows.map((u) => ({
    id: u._id,
    phone: u.phone,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
  }))
}

/** Prisma `category.findMany` + questions ile aynı şekil */
export async function mongoListCategoriesWithQuestions() {
  const db = await getMongoDb()
  const catDocs = await db.collection('Category').find({}).sort({ order: 1 }).toArray()
  const qDocs = await db.collection('Question').find({}).toArray()
  const byCat = new Map()
  for (const q of qDocs) {
    const k = q.categoryId
    if (!byCat.has(k)) byCat.set(k, [])
    byCat.get(k).push(toApiShape(q))
  }
  for (const arr of byCat.values()) {
    arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }
  return catDocs.map((c) => ({
    ...toApiShape(c),
    questions: byCat.get(c._id) || [],
  }))
}

export async function mongoListPackagesAdmin() {
  const db = await getMongoDb()
  const rows = await db.collection('Package').find({}).sort({ createdAt: -1 }).toArray()
  return rows.map((r) => toApiShape(r))
}

export async function mongoListPackagesPublicWithFeatures() {
  const db = await getMongoDb()
  const rows = await db.collection('Package').find({ active: true }).sort({ price: 1 }).toArray()
  return rows.map((pkg) => {
    const p = toApiShape(pkg)
    let feats = []
    try {
      feats = typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features || []
    } catch {
      feats = []
    }
    return { ...p, features: Array.isArray(feats) ? feats : [] }
  })
}

export async function mongoListCitiesByNameAsc() {
  const db = await getMongoDb()
  const rows = await db.collection('City').find({}).sort({ name: 1 }).toArray()
  return rows.map((r) => toApiShape(r))
}

export async function mongoListMessagesAdmin(status, limit = 30) {
  const db = await getMongoDb()
  const q = status ? { status } : {}
  const rows = await db
    .collection('Message')
    .find(q)
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
  return rows.map((r) => toApiShape(r))
}

export async function mongoListNewsAdmin(limit = 200) {
  const db = await getMongoDb()
  const rows = await db
    .collection('News')
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
  return rows.map((r) => toApiShape(r))
}

export async function mongoListNewsPublished(limit = 12) {
  const db = await getMongoDb()
  const rows = await db
    .collection('News')
    .find({ published: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
  return rows.map((r) => toApiShape(r))
}

export async function mongoNewsBySlug(slug) {
  if (!slug) return null
  const db = await getMongoDb()
  const n = await db.collection('News').findOne({ slug })
  return n ? toApiShape(n) : null
}

export async function mongoInspectionScalarsById(id) {
  if (!id) return null
  const db = await getMongoDb()
  const doc = await db.collection('Inspection').findOne({ _id: id })
  return doc ? toApiShape(doc) : null
}

export async function mongoMessagesSince(startDate) {
  const db = await getMongoDb()
  const rows = await db
    .collection('Message')
    .find({ createdAt: { $gte: startDate } })
    .toArray()
  return rows.map((r) => toApiShape(r))
}

export async function mongoPaymentsCompletedSince(startDate) {
  const db = await getMongoDb()
  const rows = await db
    .collection('Payment')
    .find({
      createdAt: { $gte: startDate },
      status: 'completed',
    })
    .toArray()
  return rows.map((r) => toApiShape(r))
}
