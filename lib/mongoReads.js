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
  return { ...base, answers }
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
      answer: { $in: ['uygun_degil', 'goreceli'] },
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
