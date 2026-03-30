function rowId(r) {
  if (!r || typeof r !== 'object') return ''
  const id = r.id ?? r._id
  return id != null ? String(id) : ''
}

function toDate(v, fallback) {
  if (v == null) return fallback
  if (v instanceof Date) return v
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return fallback
  return d
}

function toDateOrNull(v) {
  if (v == null || v === '') return null
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return null
  return d
}

function arr(x) {
  return Array.isArray(x) ? x : []
}

function chunk(a, size) {
  const out = []
  for (let i = 0; i < a.length; i += size) out.push(a.slice(i, i + size))
  return out
}

async function createManyBatched(tx, model, data, batchSize = 250) {
  for (const part of chunk(data, batchSize)) {
    if (part.length) await tx[model].createMany({ data: part })
  }
}

/**
 * @param {import('@prisma/client').PrismaClient} db
 * @param {Record<string, unknown>} payload
 */
export async function importFullDatabaseWithClient(db, payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Geçersiz payload')
  }

  const users = arr(payload.users)
  const cities = arr(payload.cities)
  const packages = arr(payload.packages)
  const categories = arr(payload.categories)
  const questions = arr(payload.questions)
  const payments = arr(payload.payments)
  const inspections = arr(payload.inspections)
  const inspectionAnswers = arr(payload.inspectionAnswers)
  const messages = arr(payload.messages)
  const news = arr(payload.news)

  const userRows = users.map((r) => {
    const id = rowId(r)
    if (!id) throw new Error('User kaydında id eksik')
    const createdAt = toDate(r.createdAt, new Date())
    return {
      id,
      phone: String(r.phone),
      password: String(r.password),
      name: String(r.name),
      role: String(r.role),
      createdAt,
      updatedAt: toDate(r.updatedAt, createdAt),
    }
  })

  const cityRows = cities.map((r) => {
    const id = rowId(r)
    if (!id) throw new Error('City kaydında id eksik')
    return {
      id,
      name: String(r.name),
      travelCost: Number(r.travelCost) || 0,
      accommodationCost: Number(r.accommodationCost) || 0,
      createdAt: toDate(r.createdAt, new Date()),
    }
  })

  const packageRows = packages.map((r) => {
    const id = rowId(r)
    if (!id) throw new Error('Package kaydında id eksik')
    return {
      id,
      name: String(r.name),
      price: Number(r.price) || 0,
      description: r.description != null ? String(r.description) : '',
      features: r.features != null ? String(r.features) : '',
      active: r.active !== undefined ? !!r.active : true,
      createdAt: toDate(r.createdAt, new Date()),
    }
  })

  const categoryRows = categories.map((r) => {
    const id = rowId(r)
    if (!id) throw new Error('Category kaydında id eksik')
    return {
      id,
      name: String(r.name),
      order: Number(r.order) || 0,
      createdAt: toDate(r.createdAt, new Date()),
    }
  })

  const questionRows = questions.map((r) => {
    const id = rowId(r)
    if (!id) throw new Error('Question kaydında id eksik')
    return {
      id,
      categoryId: String(r.categoryId ?? r.category_id ?? ''),
      question: String(r.question),
      regulationText: r.regulationText != null ? String(r.regulationText) : '',
      imageUrl: r.imageUrl != null ? String(r.imageUrl) : '',
      order: Number(r.order) || 0,
      penaltyType: r.penaltyType != null ? String(r.penaltyType) : '',
      createdAt: toDate(r.createdAt, new Date()),
    }
  })

  const paymentRows = payments.map((r) => {
    const id = rowId(r)
    if (!id) throw new Error('Payment kaydında id eksik')
    return {
      id,
      amount: Number(r.amount) || 0,
      packageId: String(r.packageId),
      schoolName: String(r.schoolName),
      cityId: String(r.cityId),
      district: r.district != null ? String(r.district) : '',
      contactName: String(r.contactName),
      contactPhone: String(r.contactPhone),
      contactEmail: r.contactEmail != null ? String(r.contactEmail) : '',
      taxOffice: r.taxOffice != null ? String(r.taxOffice) : '',
      taxNumber: r.taxNumber != null ? String(r.taxNumber) : '',
      address: r.address != null ? String(r.address) : '',
      status: r.status != null ? String(r.status) : 'pending',
      transactionId: r.transactionId != null ? String(r.transactionId) : '',
      createdAt: toDate(r.createdAt, new Date()),
      paidAt: toDateOrNull(r.paidAt),
    }
  })

  const inspectionRows = inspections.map((r) => {
    const id = rowId(r)
    if (!id) throw new Error('Inspection kaydında id eksik')
    const pid = r.paymentId
    const iid = r.inspectorId
    const skipped = arr(r.skippedQuestionIds).map(String)
    return {
      id,
      schoolName: String(r.schoolName),
      cityId: String(r.cityId),
      district: r.district != null ? String(r.district) : '',
      packageId: String(r.packageId),
      paymentId: pid != null && String(pid).trim() ? String(pid) : null,
      inspectorId: iid != null && String(iid).trim() ? String(iid) : null,
      status: r.status != null ? String(r.status) : 'pending',
      schoolContact: r.schoolContact != null ? String(r.schoolContact) : '',
      schoolPhone: r.schoolPhone != null ? String(r.schoolPhone) : '',
      schoolEmail: r.schoolEmail != null ? String(r.schoolEmail) : '',
      capacity: r.capacity != null ? String(r.capacity) : '',
      currentCategoryIndex: Number(r.currentCategoryIndex) || 0,
      currentQuestionIndex: Number(r.currentQuestionIndex) || 0,
      skippedQuestionIds: skipped,
      createdAt: toDate(r.createdAt, new Date()),
      completedAt: toDateOrNull(r.completedAt),
    }
  })

  const answerRows = inspectionAnswers.map((r) => {
    const id = rowId(r)
    if (!id) throw new Error('InspectionAnswer kaydında id eksik')
    return {
      id,
      inspectionId: String(r.inspectionId),
      questionId: String(r.questionId),
      answer: String(r.answer),
      note: r.note != null ? String(r.note) : '',
      photos: r.photos != null ? String(r.photos) : '',
      createdAt: toDate(r.createdAt, new Date()),
    }
  })

  const messageRows = messages.map((r) => {
    const id = rowId(r)
    if (!id) throw new Error('Message kaydında id eksik')
    return {
      id,
      name: String(r.name),
      schoolName: r.schoolName != null ? String(r.schoolName) : '',
      phone: String(r.phone),
      type: String(r.type),
      status: r.status != null ? String(r.status) : 'new',
      note: r.note != null ? String(r.note) : '',
      createdAt: toDate(r.createdAt, new Date()),
    }
  })

  const newsRows = news.map((r) => {
    const id = rowId(r)
    if (!id) throw new Error('News kaydında id eksik')
    const createdAt = toDate(r.createdAt, new Date())
    return {
      id,
      title: String(r.title),
      content: String(r.content),
      imageUrl: r.imageUrl != null ? String(r.imageUrl) : '',
      keywords: r.keywords != null ? String(r.keywords) : '',
      slug: String(r.slug),
      published: r.published !== undefined ? !!r.published : true,
      createdAt,
      updatedAt: toDate(r.updatedAt, createdAt),
    }
  })

  // Yedekte silinmiş paket/şehir vb. yüzünden kopuk FK (ör. prod’da paket silinmiş ödemeler)
  const packageIdSet = new Set(packageRows.map((r) => r.id))
  const cityIdSet = new Set(cityRows.map((r) => r.id))
  const userIdSet = new Set(userRows.map((r) => r.id))
  const questionIdSet = new Set(questionRows.map((r) => r.id))

  const paymentRowsOk = paymentRows.filter(
    (r) => packageIdSet.has(r.packageId) && cityIdSet.has(r.cityId),
  )
  const validPaymentIdSet = new Set(paymentRowsOk.map((r) => r.id))

  const inspectionRowsOk = inspectionRows.filter((r) => {
    if (!cityIdSet.has(r.cityId) || !packageIdSet.has(r.packageId)) return false
    if (r.paymentId && !validPaymentIdSet.has(r.paymentId)) return false
    if (r.inspectorId && !userIdSet.has(r.inspectorId)) return false
    return true
  })
  const validInspectionIdSet = new Set(inspectionRowsOk.map((r) => r.id))

  const answerRowsOk = answerRows.filter(
    (r) =>
      validInspectionIdSet.has(r.inspectionId) && questionIdSet.has(r.questionId),
  )

  await db.$transaction(async (tx) => {
    await tx.inspectionAnswer.deleteMany()
    await tx.inspection.deleteMany()
    await tx.payment.deleteMany()
    await tx.question.deleteMany()
    await tx.category.deleteMany()
    await tx.package.deleteMany()
    await tx.city.deleteMany()
    await tx.user.deleteMany()
    await tx.message.deleteMany()
    await tx.news.deleteMany()

    await createManyBatched(tx, 'user', userRows)
    await createManyBatched(tx, 'city', cityRows)
    await createManyBatched(tx, 'package', packageRows)
    await createManyBatched(tx, 'category', categoryRows)
    await createManyBatched(tx, 'question', questionRows)
    await createManyBatched(tx, 'payment', paymentRowsOk)
    await createManyBatched(tx, 'inspection', inspectionRowsOk)
    await createManyBatched(tx, 'inspectionAnswer', answerRowsOk)
    await createManyBatched(tx, 'message', messageRows)
    await createManyBatched(tx, 'news', newsRows)
  })

  return {
    users: userRows.length,
    cities: cityRows.length,
    packages: packageRows.length,
    categories: categoryRows.length,
    questions: questionRows.length,
    payments: paymentRowsOk.length,
    paymentsSkipped: paymentRows.length - paymentRowsOk.length,
    inspections: inspectionRowsOk.length,
    inspectionsSkipped: inspectionRows.length - inspectionRowsOk.length,
    inspectionAnswers: answerRowsOk.length,
    inspectionAnswersSkipped: answerRows.length - answerRowsOk.length,
    messages: messageRows.length,
    news: newsRows.length,
  }
}
