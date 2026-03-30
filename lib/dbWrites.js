import { prisma } from '@/lib/prisma'

function httpError(message, statusCode) {
  const err = new Error(message)
  err.statusCode = statusCode
  return err
}

function mapPrismaUnique(e, fallback) {
  if (e?.code === 'P2002') {
    const err = new Error(fallback)
    err.statusCode = 400
    return err
  }
  return e
}

// --- User ---
export async function createUser({ phone, password, name, role }) {
  try {
    return await prisma.user.create({
      data: {
        phone,
        password,
        name,
        role: role || 'inspector',
      },
    })
  } catch (e) {
    throw mapPrismaUnique(e, 'Bu telefon numarası zaten kayıtlı')
  }
}

export async function updateUser(id, { phone, name, password }) {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) throw httpError('Kullanıcı bulunamadı', 404)
  if (phone !== undefined && phone !== existing.phone) {
    const dup = await prisma.user.findUnique({ where: { phone } })
    if (dup) throw httpError('Bu telefon numarası zaten kayıtlı', 400)
  }
  const data = {}
  if (phone !== undefined) data.phone = phone
  if (name !== undefined) data.name = name
  if (password !== undefined) data.password = password
  if (Object.keys(data).length === 0) return existing
  try {
    return await prisma.user.update({ where: { id }, data })
  } catch (e) {
    throw mapPrismaUnique(e, 'Bu telefon numarası zaten kayıtlı')
  }
}

export async function deleteUser(id) {
  try {
    await prisma.user.delete({ where: { id } })
  } catch (e) {
    if (e?.code === 'P2025') throw httpError('Kullanıcı bulunamadı', 404)
    throw e
  }
}

// --- Category ---
export async function createCategory({ name, order }) {
  return prisma.category.create({
    data: {
      name,
      order: Number(order) || 0,
    },
  })
}

export async function updateCategory(id, { name, order }) {
  const existing = await prisma.category.findUnique({ where: { id } })
  if (!existing) throw httpError('Kategori bulunamadı', 404)
  const data = {}
  if (name !== undefined) data.name = name
  if (order !== undefined) data.order = order
  if (Object.keys(data).length === 0) return existing
  return prisma.category.update({ where: { id }, data })
}

export async function deleteCategory(id) {
  try {
    await prisma.category.delete({ where: { id } })
  } catch (e) {
    if (e?.code === 'P2025') throw httpError('Kategori bulunamadı', 404)
    throw e
  }
}

// --- Question ---
export async function createQuestion(body) {
  const category = await prisma.category.findUnique({ where: { id: body.categoryId } })
  if (!category) throw httpError('Kategori bulunamadı', 400)
  return prisma.question.create({
    data: {
      categoryId: body.categoryId,
      question: body.question,
      regulationText: body.regulationText ?? '',
      imageUrl: body.imageUrl ?? '',
      order: Number(body.order) || 0,
      penaltyType: body.penaltyType ?? '',
    },
  })
}

export async function updateQuestion(id, body) {
  const existing = await prisma.question.findUnique({ where: { id } })
  if (!existing) throw httpError('Soru bulunamadı', 404)
  if (body.categoryId != null) {
    const cat = await prisma.category.findUnique({ where: { id: body.categoryId } })
    if (!cat) throw httpError('Kategori bulunamadı', 400)
  }
  const data = {}
  if (body.categoryId !== undefined) data.categoryId = body.categoryId
  if (body.question !== undefined) data.question = body.question
  if (body.regulationText !== undefined) data.regulationText = body.regulationText
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl
  if (body.order !== undefined) data.order = Number(body.order) || 0
  if (body.penaltyType !== undefined) data.penaltyType = body.penaltyType
  if (Object.keys(data).length === 0) return existing
  return prisma.question.update({ where: { id }, data })
}

export async function deleteQuestion(id) {
  try {
    await prisma.question.delete({ where: { id } })
  } catch (e) {
    if (e?.code === 'P2025') throw httpError('Soru bulunamadı', 404)
    throw e
  }
}

export async function reorderQuestionsInCategory(categoryId, orderedIds) {
  if (!categoryId || !Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw httpError('Geçersiz istek', 400)
  }
  const existing = await prisma.question.findMany({
    where: { categoryId },
    select: { id: true },
  })
  const idSet = new Set(existing.map((e) => e.id))
  if (orderedIds.length !== idSet.size) {
    throw httpError('Soru listesi bu kategori ile eşleşmiyor', 400)
  }
  for (const id of orderedIds) {
    if (!idSet.has(id)) throw httpError('Geçersiz soru', 400)
  }
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.question.update({ where: { id }, data: { order: index } }),
    ),
  )
}

// --- Package ---
export async function createPackage(body) {
  let features = body.features
  if (typeof features === 'object' && features !== null) {
    features = JSON.stringify(features)
  }
  return prisma.package.create({
    data: {
      name: body.name,
      price: Number(body.price),
      description: body.description ?? '',
      features: features ?? '',
      active: body.active !== undefined ? !!body.active : true,
    },
  })
}

export async function updatePackage(id, body) {
  const existing = await prisma.package.findUnique({ where: { id } })
  if (!existing) throw httpError('Paket bulunamadı', 404)
  const data = {}
  if (body.name !== undefined) data.name = body.name
  if (body.price !== undefined) data.price = Number(body.price)
  if (body.description !== undefined) data.description = body.description
  if (body.features !== undefined) {
    data.features =
      typeof body.features === 'object' && body.features !== null
        ? JSON.stringify(body.features)
        : body.features
  }
  if (body.active !== undefined) data.active = !!body.active
  if (Object.keys(data).length === 0) return existing
  return prisma.package.update({ where: { id }, data })
}

export async function deletePackage(id) {
  try {
    await prisma.package.delete({ where: { id } })
  } catch (e) {
    if (e?.code === 'P2025') throw httpError('Paket bulunamadı', 404)
    if (e?.code === 'P2003') throw httpError('Bu pakete bağlı kayıtlar var', 400)
    throw e
  }
}

// --- City ---
export async function createCity(body) {
  const name = body.name
  const dup = await prisma.city.findUnique({ where: { name } })
  if (dup) throw httpError('Bu il adı zaten kayıtlı', 400)
  try {
    return await prisma.city.create({
      data: {
        name,
        travelCost: Number(body.travelCost) || 0,
        accommodationCost: Number(body.accommodationCost) || 0,
      },
    })
  } catch (e) {
    throw mapPrismaUnique(e, 'Bu il adı zaten kayıtlı')
  }
}

export async function updateCity(id, body) {
  const existing = await prisma.city.findUnique({ where: { id } })
  if (!existing) throw httpError('İl bulunamadı', 404)
  if (body.name !== undefined && body.name !== existing.name) {
    const dup = await prisma.city.findUnique({ where: { name: body.name } })
    if (dup) throw httpError('Bu il adı zaten kayıtlı', 400)
  }
  const data = {}
  if (body.name !== undefined) data.name = body.name
  if (body.travelCost !== undefined) data.travelCost = Number(body.travelCost) || 0
  if (body.accommodationCost !== undefined) {
    data.accommodationCost = Number(body.accommodationCost) || 0
  }
  if (Object.keys(data).length === 0) return existing
  try {
    return await prisma.city.update({ where: { id }, data })
  } catch (e) {
    throw mapPrismaUnique(e, 'Bu il adı zaten kayıtlı')
  }
}

export async function deleteCity(id) {
  try {
    await prisma.city.delete({ where: { id } })
  } catch (e) {
    if (e?.code === 'P2025') throw httpError('İl bulunamadı', 404)
    if (e?.code === 'P2003') throw httpError('Bu ile bağlı kayıtlar var', 400)
    throw e
  }
}

// --- Message ---
export async function createMessage(body) {
  return prisma.message.create({
    data: {
      name: body.name,
      schoolName: body.schoolName ?? '',
      phone: body.phone,
      type: body.type,
      status: body.status ?? 'new',
      note: body.note ?? '',
    },
  })
}

export async function updateMessage(id, { status, note }) {
  const existing = await prisma.message.findUnique({ where: { id } })
  if (!existing) throw httpError('Mesaj bulunamadı', 404)
  const data = {}
  if (status !== undefined) data.status = status
  if (note !== undefined) data.note = note
  if (Object.keys(data).length === 0) return existing
  return prisma.message.update({ where: { id }, data })
}

// --- News ---
export async function createNews(body) {
  const slug = body.slug
  const dup = await prisma.news.findUnique({ where: { slug } })
  if (dup) throw httpError('Bu slug zaten kullanılıyor', 400)
  try {
    return await prisma.news.create({
      data: {
        title: body.title,
        content: body.content,
        imageUrl: body.imageUrl ?? '',
        keywords: body.keywords ?? '',
        slug,
        published: body.published !== undefined ? !!body.published : true,
      },
    })
  } catch (e) {
    throw mapPrismaUnique(e, 'Bu slug zaten kullanılıyor')
  }
}

export async function updateNews(id, body) {
  const existing = await prisma.news.findUnique({ where: { id } })
  if (!existing) throw httpError('Haber bulunamadı', 404)
  if (body.slug !== undefined && body.slug !== existing.slug) {
    const dup = await prisma.news.findUnique({ where: { slug: body.slug } })
    if (dup) throw httpError('Bu slug zaten kullanılıyor', 400)
  }
  const data = {}
  if (body.title !== undefined) data.title = body.title
  if (body.content !== undefined) data.content = body.content
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl
  if (body.keywords !== undefined) data.keywords = body.keywords
  if (body.slug !== undefined) data.slug = body.slug
  if (body.published !== undefined) data.published = !!body.published
  try {
    return await prisma.news.update({ where: { id }, data })
  } catch (e) {
    throw mapPrismaUnique(e, 'Bu slug zaten kullanılıyor')
  }
}

export async function deleteNews(id) {
  try {
    await prisma.news.delete({ where: { id } })
  } catch (e) {
    if (e?.code === 'P2025') throw httpError('Haber bulunamadı', 404)
    throw e
  }
}

// --- Payment ---
export async function createPayment(data) {
  return prisma.payment.create({
    data: {
      amount: Number(data.amount),
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
      status: data.status || 'pending',
      transactionId: data.transactionId || '',
      paidAt: data.paidAt ?? null,
    },
  })
}

const PAYMENT_PATCH_KEYS = [
  'amount',
  'packageId',
  'schoolName',
  'cityId',
  'district',
  'contactName',
  'contactPhone',
  'contactEmail',
  'taxOffice',
  'taxNumber',
  'address',
  'status',
  'transactionId',
  'paidAt',
]

export async function updatePayment(id, patch) {
  const data = {}
  for (const k of PAYMENT_PATCH_KEYS) {
    if (patch[k] !== undefined) data[k] = patch[k]
  }
  try {
    return await prisma.payment.update({ where: { id }, data })
  } catch (e) {
    if (e?.code === 'P2025') throw httpError('Ödeme bulunamadı', 404)
    throw e
  }
}

// --- Inspection ---
export async function createInspection(data) {
  return prisma.inspection.create({
    data: {
      schoolName: data.schoolName,
      cityId: data.cityId,
      district: data.district || '',
      packageId: data.packageId,
      paymentId: data.paymentId ?? null,
      inspectorId: data.inspectorId ?? null,
      status: data.status || 'pending',
      schoolContact: data.schoolContact || '',
      schoolPhone: data.schoolPhone || '',
      schoolEmail: data.schoolEmail || '',
      capacity: data.capacity || '',
      currentCategoryIndex: data.currentCategoryIndex ?? 0,
      currentQuestionIndex: data.currentQuestionIndex ?? 0,
      skippedQuestionIds: [],
      completedAt: data.completedAt ?? null,
    },
  })
}

const INSPECTION_PATCH_KEYS = [
  'schoolName',
  'cityId',
  'district',
  'packageId',
  'paymentId',
  'inspectorId',
  'status',
  'schoolContact',
  'schoolPhone',
  'schoolEmail',
  'capacity',
  'currentCategoryIndex',
  'currentQuestionIndex',
  'skippedQuestionIds',
  'completedAt',
]

export async function updateInspection(id, patch) {
  const data = {}
  for (const k of INSPECTION_PATCH_KEYS) {
    if (patch[k] !== undefined) data[k] = patch[k]
  }
  if (Object.keys(data).length === 0) {
    const doc = await prisma.inspection.findUnique({ where: { id } })
    if (!doc) throw httpError('Denetim bulunamadı', 404)
    return doc
  }
  try {
    return await prisma.inspection.update({ where: { id }, data })
  } catch (e) {
    if (e?.code === 'P2025') throw httpError('Denetim bulunamadı', 404)
    throw e
  }
}

/** Cevaplar cascade ile silinir (schema onDelete: Cascade). */
export async function deleteInspection(id) {
  try {
    await prisma.inspection.delete({ where: { id } })
  } catch (e) {
    if (e?.code === 'P2025') throw httpError('Denetim bulunamadı', 404)
    throw e
  }
}

export async function addSkippedQuestion(inspectionId, questionId) {
  const row = await prisma.inspection.findUnique({
    where: { id: inspectionId },
    select: { skippedQuestionIds: true },
  })
  if (!row) throw httpError('Denetim bulunamadı', 404)
  const next = [...new Set([...(row.skippedQuestionIds || []), questionId])]
  return prisma.inspection.update({
    where: { id: inspectionId },
    data: { skippedQuestionIds: next },
  })
}

export async function removeSkippedQuestion(inspectionId, questionId) {
  const row = await prisma.inspection.findUnique({
    where: { id: inspectionId },
    select: { skippedQuestionIds: true },
  })
  if (!row) throw httpError('Denetim bulunamadı', 404)
  const next = (row.skippedQuestionIds || []).filter((x) => x !== questionId)
  return prisma.inspection.update({
    where: { id: inspectionId },
    data: { skippedQuestionIds: next },
  })
}

// --- InspectionAnswer ---
export async function createInspectionAnswer(data) {
  return prisma.inspectionAnswer.create({
    data: {
      inspectionId: data.inspectionId,
      questionId: data.questionId,
      answer: data.answer,
      note: data.note || '',
      photos: data.photos || '',
    },
  })
}

export async function updateInspectionAnswer(id, data) {
  const existing = await prisma.inspectionAnswer.findUnique({ where: { id } })
  if (!existing) throw httpError('Cevap bulunamadı', 404)
  const patch = {}
  if (data.answer !== undefined) patch.answer = data.answer
  if (data.note !== undefined) patch.note = data.note
  if (data.photos !== undefined) patch.photos = data.photos
  if (Object.keys(patch).length === 0) return existing
  return prisma.inspectionAnswer.update({ where: { id }, data: patch })
}

export async function findInspectionAnswerByInspectionAndQuestion(inspectionId, questionId) {
  return prisma.inspectionAnswer.findFirst({
    where: { inspectionId, questionId },
  })
}

/** Soru geçildiğinde (skip) o soruya ait kayıtlı cevabı kaldırır. */
export async function deleteInspectionAnswerForQuestion(inspectionId, questionId) {
  await prisma.inspectionAnswer.deleteMany({
    where: { inspectionId, questionId },
  })
}
