import { prisma } from '@/lib/prisma'

function inspectionScalars(row) {
  if (!row) return null
  const { city, package: pkg, payment, inspector, answers, ...rest } = row
  return rest
}

export function enrichInspectionRow(row) {
  if (!row) return null
  const base = inspectionScalars(row)
  return {
    ...base,
    city: row.city ?? null,
    package: row.package ?? null,
    payment: row.payment ?? null,
  }
}

function withInspector(row, enriched) {
  if (!row?.inspectorId) {
    return { ...enriched, inspector: null }
  }
  const u = row.inspector
  return {
    ...enriched,
    inspector: u ? { name: u.name, phone: u.phone } : null,
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

async function answerWithQuestionCategory(ans) {
  if (!ans.questionId) {
    return { ...ans, question: null }
  }
  const q = await prisma.question.findUnique({
    where: { id: ans.questionId },
    include: { category: true },
  })
  if (!q) {
    return { ...ans, question: null }
  }
  const { category, ...qRest } = q
  return {
    ...ans,
    question: {
      ...qRest,
      category: category ?? null,
    },
  }
}

export async function listInspectionsForInspector(inspectorId) {
  const rows = await prisma.inspection.findMany({
    where: { inspectorId },
    orderBy: { createdAt: 'desc' },
    include: {
      city: true,
      package: true,
      payment: true,
    },
  })
  return rows.map((r) => enrichInspectionRow(r))
}

export async function listInspectionsAdmin(limit = 500) {
  const rows = await prisma.inspection.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      city: true,
      package: true,
      payment: true,
      inspector: true,
    },
  })
  return rows.map((r) => {
    const e = enrichInspectionRow(r)
    return withInspector(r, e)
  })
}

export async function listInspectionsExport(startDate, endDate) {
  const where =
    startDate && endDate
      ? {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }
      : {}
  const rows = await prisma.inspection.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      city: true,
      package: true,
      payment: true,
      inspector: true,
    },
  })
  return rows.map((r) => {
    const e = enrichInspectionRow(r)
    return withInspector(r, e)
  })
}

export async function listPaymentsAdmin(limit = 500) {
  const rows = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      package: true,
      city: true,
    },
  })
  return rows.map((p) => ({
    ...p,
    package: p.package ?? null,
    city: p.city ?? null,
  }))
}

export async function getInspectionDetailForInspector(inspectionId) {
  const raw = await prisma.inspection.findUnique({
    where: { id: inspectionId },
    include: {
      city: true,
      package: true,
      payment: true,
    },
  })
  if (!raw) return null
  const enriched = enrichInspectionRow(raw)
  const ansDocs = await prisma.inspectionAnswer.findMany({
    where: { inspectionId },
  })
  const answers = await Promise.all(ansDocs.map((a) => answerWithQuestionCategory(a)))
  return {
    ...enriched,
    answers: sortAnswersByQuestionOrder(answers),
  }
}

export async function getInspectionWithAnswersForStart(inspectionId) {
  const raw = await prisma.inspection.findUnique({ where: { id: inspectionId } })
  if (!raw) return null
  const ansDocs = await prisma.inspectionAnswer.findMany({
    where: { inspectionId },
    orderBy: { createdAt: 'asc' },
  })
  const skippedQuestionIds = Array.isArray(raw.skippedQuestionIds)
    ? [...raw.skippedQuestionIds]
    : []
  return { ...raw, skippedQuestionIds, answers: ansDocs }
}

export async function inspectionAnswersChronological(inspectionId) {
  return prisma.inspectionAnswer.findMany({
    where: { inspectionId },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getAdminInspectionReport(inspectionId) {
  const raw = await prisma.inspection.findUnique({
    where: { id: inspectionId },
    include: {
      city: true,
      package: true,
      payment: true,
      inspector: true,
    },
  })
  if (!raw) return null
  const enriched = enrichInspectionRow(raw)
  const withInsp = withInspector(raw, enriched)
  const ansDocs = await prisma.inspectionAnswer.findMany({
    where: { inspectionId },
  })
  const answers = await Promise.all(ansDocs.map((a) => answerWithQuestionCategory(a)))
  return {
    ...withInsp,
    answers: sortAnswersByQuestionOrder(answers),
  }
}

export async function getAdminInspectionPdf(inspectionId) {
  const raw = await prisma.inspection.findUnique({
    where: { id: inspectionId },
    include: {
      city: true,
      package: true,
      payment: true,
      inspector: true,
    },
  })
  if (!raw) return null
  const enriched = enrichInspectionRow(raw)
  const withInsp = withInspector(raw, enriched)
  const ansDocs = await prisma.inspectionAnswer.findMany({
    where: { inspectionId, answer: 'uygun_degil' },
  })
  const answers = await Promise.all(ansDocs.map((a) => answerWithQuestionCategory(a)))
  return {
    ...withInsp,
    answers: sortAnswersByQuestionOrder(answers),
  }
}

export async function inspectionsSinceForStats(startDate) {
  return prisma.inspection.findMany({
    where: { createdAt: { gte: startDate } },
  })
}

export async function listQuestionsWithCategory(categoryId) {
  const where = categoryId ? { categoryId } : {}
  const questions = await prisma.question.findMany({
    where,
    orderBy: { order: 'asc' },
    include: { category: true },
  })
  return questions.map((qu) => {
    const { category, ...rest } = qu
    return { ...rest, category: category ?? null }
  })
}

export async function getPackageById(id) {
  if (!id) return null
  return prisma.package.findUnique({ where: { id } })
}

/**
 * Paket.features (string[] veya JSON string): denetçide yalnızca `name` ile eşleşen kategoriler + soruları gösterilir.
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

export async function findUserByPhone(phone) {
  if (!phone) return null
  return prisma.user.findUnique({ where: { phone } })
}

export async function listStaffInspectors() {
  const rows = await prisma.user.findMany({
    where: { role: 'inspector' },
  })
  return rows.map((u) => ({
    id: u.id,
    phone: u.phone,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
  }))
}

export async function listCategoriesWithQuestions() {
  const catDocs = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      questions: { orderBy: { order: 'asc' } },
    },
  })
  return catDocs.map((c) => {
    const { questions, ...rest } = c
    return { ...rest, questions: questions || [] }
  })
}

export async function listPackagesAdmin() {
  return prisma.package.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function listPackagesPublicWithFeatures() {
  const rows = await prisma.package.findMany({
    where: { active: true },
    orderBy: { price: 'asc' },
  })
  return rows.map((pkg) => {
    let feats = []
    try {
      feats = typeof pkg.features === 'string' ? JSON.parse(pkg.features || '[]') : pkg.features || []
    } catch {
      feats = []
    }
    return { ...pkg, features: Array.isArray(feats) ? feats : [] }
  })
}

export async function listCitiesByNameAsc() {
  return prisma.city.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function listMessagesAdmin(status, limit = 30) {
  const where = status ? { status } : {}
  return prisma.message.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function listNewsAdmin(limit = 200) {
  return prisma.news.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function listNewsPublished(limit = 12) {
  return prisma.news.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function newsBySlug(slug) {
  if (!slug) return null
  return prisma.news.findUnique({ where: { slug } })
}

export async function inspectionScalarsById(id) {
  if (!id) return null
  return prisma.inspection.findUnique({ where: { id } })
}

/**
 * Paket kapsamındaki her soru için: kayıtlı cevap var mı veya soru geçildi mi.
 * Son soruda "Geç" sonrası tamamlama gibi durumlarda kullanılır.
 */
export async function inspectionEveryQuestionAnsweredOrSkipped(inspectionId) {
  const raw = await prisma.inspection.findUnique({ where: { id: inspectionId } })
  if (!raw) return { ok: false }

  const allCategories = await listCategoriesWithQuestions()
  const packageDoc = raw.packageId ? await getPackageById(raw.packageId) : null
  const categories = filterCategoriesByPackageFeatures(allCategories, packageDoc)

  const allQIds = []
  for (const cat of categories) {
    for (const q of cat.questions || []) {
      allQIds.push(q.id)
    }
  }
  if (allQIds.length === 0) return { ok: true }

  const ansDocs = await prisma.inspectionAnswer.findMany({
    where: { inspectionId },
    select: { questionId: true, answer: true },
  })
  const answeredSet = new Set(
    ansDocs
      .filter((a) => a.answer != null && String(a.answer).trim() !== '')
      .map((a) => a.questionId),
  )
  const skippedSet = new Set(Array.isArray(raw.skippedQuestionIds) ? raw.skippedQuestionIds : [])

  for (const qid of allQIds) {
    if (!answeredSet.has(qid) && !skippedSet.has(qid)) {
      return { ok: false }
    }
  }
  return { ok: true }
}

export async function messagesSince(startDate) {
  return prisma.message.findMany({
    where: { createdAt: { gte: startDate } },
  })
}

export async function paymentsCompletedSince(startDate) {
  return prisma.payment.findMany({
    where: {
      createdAt: { gte: startDate },
      status: 'completed',
    },
  })
}
