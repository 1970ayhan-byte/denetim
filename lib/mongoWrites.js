import { v4 as uuidv4 } from 'uuid'
import { getMongoDb } from '@/lib/mongoDb'

export function toApiShape(doc) {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { id: _id, ...rest }
}

function httpError(message, statusCode) {
  const err = new Error(message)
  err.statusCode = statusCode
  return err
}

// --- User ---
export async function mongoCreateUser({ phone, password, name, role }) {
  const db = await getMongoDb()
  const dup = await db.collection('User').findOne({ phone })
  if (dup) throw httpError('Bu telefon numarası zaten kayıtlı', 400)
  const id = uuidv4()
  const now = new Date()
  const doc = {
    _id: id,
    phone,
    password,
    name,
    role: role || 'inspector',
    createdAt: now,
    updatedAt: now,
  }
  await db.collection('User').insertOne(doc)
  return toApiShape(doc)
}

export async function mongoUpdateUser(id, { phone, name, password }) {
  const db = await getMongoDb()
  const existing = await db.collection('User').findOne({ _id: id })
  if (!existing) throw httpError('Kullanıcı bulunamadı', 404)
  if (phone !== undefined && phone !== existing.phone) {
    const dup = await db.collection('User').findOne({ phone })
    if (dup) throw httpError('Bu telefon numarası zaten kayıtlı', 400)
  }
  const $set = { updatedAt: new Date() }
  if (phone !== undefined) $set.phone = phone
  if (name !== undefined) $set.name = name
  if (password !== undefined) $set.password = password
  if (Object.keys($set).length === 1) {
    return toApiShape(existing)
  }
  await db.collection('User').updateOne({ _id: id }, { $set })
  return toApiShape(await db.collection('User').findOne({ _id: id }))
}

export async function mongoDeleteUser(id) {
  const db = await getMongoDb()
  const r = await db.collection('User').deleteOne({ _id: id })
  if (r.deletedCount === 0) throw httpError('Kullanıcı bulunamadı', 404)
}

// --- Category ---
export async function mongoCreateCategory({ name, order }) {
  const db = await getMongoDb()
  const id = uuidv4()
  const doc = {
    _id: id,
    name,
    order: Number(order) || 0,
    createdAt: new Date(),
  }
  await db.collection('Category').insertOne(doc)
  return toApiShape(doc)
}

export async function mongoUpdateCategory(id, { name, order }) {
  const db = await getMongoDb()
  const existing = await db.collection('Category').findOne({ _id: id })
  if (!existing) throw httpError('Kategori bulunamadı', 404)
  const $set = {}
  if (name !== undefined) $set.name = name
  if (order !== undefined) $set.order = order
  if (Object.keys($set).length === 0) return toApiShape(existing)
  await db.collection('Category').updateOne({ _id: id }, { $set })
  return toApiShape(await db.collection('Category').findOne({ _id: id }))
}

export async function mongoDeleteCategory(id) {
  const db = await getMongoDb()
  await db.collection('Question').deleteMany({ categoryId: id })
  const r = await db.collection('Category').deleteOne({ _id: id })
  if (r.deletedCount === 0) throw httpError('Kategori bulunamadı', 404)
}

// --- Question ---
export async function mongoCreateQuestion(body) {
  const db = await getMongoDb()
  const category = await db.collection('Category').findOne({ _id: body.categoryId })
  if (!category) throw httpError('Kategori bulunamadı', 400)
  const id = uuidv4()
  const doc = {
    _id: id,
    categoryId: body.categoryId,
    question: body.question,
    regulationText: body.regulationText ?? '',
    imageUrl: body.imageUrl ?? '',
    order: Number(body.order) || 0,
    penaltyType: body.penaltyType ?? '',
    createdAt: new Date(),
  }
  await db.collection('Question').insertOne(doc)
  return toApiShape(doc)
}

export async function mongoUpdateQuestion(id, body) {
  const db = await getMongoDb()
  const existing = await db.collection('Question').findOne({ _id: id })
  if (!existing) throw httpError('Soru bulunamadı', 404)
  if (body.categoryId != null) {
    const cat = await db.collection('Category').findOne({ _id: body.categoryId })
    if (!cat) throw httpError('Kategori bulunamadı', 400)
  }
  const $set = {}
  if (body.categoryId !== undefined) $set.categoryId = body.categoryId
  if (body.question !== undefined) $set.question = body.question
  if (body.regulationText !== undefined) $set.regulationText = body.regulationText
  if (body.imageUrl !== undefined) $set.imageUrl = body.imageUrl
  if (body.order !== undefined) $set.order = Number(body.order) || 0
  if (body.penaltyType !== undefined) $set.penaltyType = body.penaltyType
  if (Object.keys($set).length === 0) return toApiShape(existing)
  await db.collection('Question').updateOne({ _id: id }, { $set })
  return toApiShape(await db.collection('Question').findOne({ _id: id }))
}

export async function mongoDeleteQuestion(id) {
  const db = await getMongoDb()
  const r = await db.collection('Question').deleteOne({ _id: id })
  if (r.deletedCount === 0) throw httpError('Soru bulunamadı', 404)
}

// --- Package ---
export async function mongoCreatePackage(body) {
  const db = await getMongoDb()
  let features = body.features
  if (typeof features === 'object' && features !== null) {
    features = JSON.stringify(features)
  }
  const id = uuidv4()
  const doc = {
    _id: id,
    name: body.name,
    price: Number(body.price),
    description: body.description ?? '',
    features: features ?? '',
    active: body.active !== undefined ? !!body.active : true,
    createdAt: new Date(),
  }
  await db.collection('Package').insertOne(doc)
  return toApiShape(doc)
}

export async function mongoUpdatePackage(id, body) {
  const db = await getMongoDb()
  const existing = await db.collection('Package').findOne({ _id: id })
  if (!existing) throw httpError('Paket bulunamadı', 404)
  const $set = {}
  if (body.name !== undefined) $set.name = body.name
  if (body.price !== undefined) $set.price = Number(body.price)
  if (body.description !== undefined) $set.description = body.description
  if (body.features !== undefined) {
    $set.features =
      typeof body.features === 'object' && body.features !== null
        ? JSON.stringify(body.features)
        : body.features
  }
  if (body.active !== undefined) $set.active = !!body.active
  if (Object.keys($set).length === 0) return toApiShape(existing)
  await db.collection('Package').updateOne({ _id: id }, { $set })
  return toApiShape(await db.collection('Package').findOne({ _id: id }))
}

export async function mongoDeletePackage(id) {
  const db = await getMongoDb()
  const r = await db.collection('Package').deleteOne({ _id: id })
  if (r.deletedCount === 0) throw httpError('Paket bulunamadı', 404)
}

// --- City ---
export async function mongoCreateCity(body) {
  const db = await getMongoDb()
  const name = body.name
  const dup = await db.collection('City').findOne({ name })
  if (dup) throw httpError('Bu il adı zaten kayıtlı', 400)
  const id = uuidv4()
  const doc = {
    _id: id,
    name,
    travelCost: Number(body.travelCost) || 0,
    accommodationCost: Number(body.accommodationCost) || 0,
    createdAt: new Date(),
  }
  await db.collection('City').insertOne(doc)
  return toApiShape(doc)
}

export async function mongoUpdateCity(id, body) {
  const db = await getMongoDb()
  const existing = await db.collection('City').findOne({ _id: id })
  if (!existing) throw httpError('İl bulunamadı', 404)
  if (body.name !== undefined && body.name !== existing.name) {
    const dup = await db.collection('City').findOne({ name: body.name })
    if (dup) throw httpError('Bu il adı zaten kayıtlı', 400)
  }
  const $set = {}
  if (body.name !== undefined) $set.name = body.name
  if (body.travelCost !== undefined) $set.travelCost = Number(body.travelCost) || 0
  if (body.accommodationCost !== undefined) {
    $set.accommodationCost = Number(body.accommodationCost) || 0
  }
  if (Object.keys($set).length === 0) return toApiShape(existing)
  await db.collection('City').updateOne({ _id: id }, { $set })
  return toApiShape(await db.collection('City').findOne({ _id: id }))
}

export async function mongoDeleteCity(id) {
  const db = await getMongoDb()
  const r = await db.collection('City').deleteOne({ _id: id })
  if (r.deletedCount === 0) throw httpError('İl bulunamadı', 404)
}

// --- Message ---
export async function mongoCreateMessage(body) {
  const db = await getMongoDb()
  const id = uuidv4()
  const doc = {
    _id: id,
    name: body.name,
    schoolName: body.schoolName ?? '',
    phone: body.phone,
    type: body.type,
    status: body.status ?? 'new',
    note: body.note ?? '',
    createdAt: new Date(),
  }
  await db.collection('Message').insertOne(doc)
  return toApiShape(doc)
}

export async function mongoUpdateMessage(id, { status, note }) {
  const db = await getMongoDb()
  const existing = await db.collection('Message').findOne({ _id: id })
  if (!existing) throw httpError('Mesaj bulunamadı', 404)
  const $set = {}
  if (status !== undefined) $set.status = status
  if (note !== undefined) $set.note = note
  if (Object.keys($set).length === 0) return toApiShape(existing)
  await db.collection('Message').updateOne({ _id: id }, { $set })
  return toApiShape(await db.collection('Message').findOne({ _id: id }))
}

// --- News ---
export async function mongoCreateNews(body) {
  const db = await getMongoDb()
  const slug = body.slug
  const dup = await db.collection('News').findOne({ slug })
  if (dup) throw httpError('Bu slug zaten kullanılıyor', 400)
  const id = uuidv4()
  const now = new Date()
  const doc = {
    _id: id,
    title: body.title,
    content: body.content,
    imageUrl: body.imageUrl ?? '',
    keywords: body.keywords ?? '',
    slug,
    published: body.published !== undefined ? !!body.published : true,
    createdAt: now,
    updatedAt: now,
  }
  await db.collection('News').insertOne(doc)
  return toApiShape(doc)
}

export async function mongoUpdateNews(id, body) {
  const db = await getMongoDb()
  const existing = await db.collection('News').findOne({ _id: id })
  if (!existing) throw httpError('Haber bulunamadı', 404)
  if (body.slug !== undefined && body.slug !== existing.slug) {
    const dup = await db.collection('News').findOne({ slug: body.slug })
    if (dup) throw httpError('Bu slug zaten kullanılıyor', 400)
  }
  const now = new Date()
  const $set = { updatedAt: now }
  if (body.title !== undefined) $set.title = body.title
  if (body.content !== undefined) $set.content = body.content
  if (body.imageUrl !== undefined) $set.imageUrl = body.imageUrl
  if (body.keywords !== undefined) $set.keywords = body.keywords
  if (body.slug !== undefined) $set.slug = body.slug
  if (body.published !== undefined) $set.published = !!body.published
  await db.collection('News').updateOne({ _id: id }, { $set })
  return toApiShape(await db.collection('News').findOne({ _id: id }))
}

export async function mongoDeleteNews(id) {
  const db = await getMongoDb()
  const r = await db.collection('News').deleteOne({ _id: id })
  if (r.deletedCount === 0) throw httpError('Haber bulunamadı', 404)
}

// --- Payment ---
export async function mongoCreatePayment(data) {
  const db = await getMongoDb()
  const id = uuidv4()
  const doc = {
    _id: id,
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
    createdAt: new Date(),
    paidAt: data.paidAt ?? null,
  }
  await db.collection('Payment').insertOne(doc)
  return toApiShape(doc)
}

export async function mongoUpdatePayment(id, patch) {
  const db = await getMongoDb()
  const $set = { ...patch }
  const r = await db.collection('Payment').updateOne({ _id: id }, { $set })
  if (r.matchedCount === 0) throw httpError('Ödeme bulunamadı', 404)
  return toApiShape(await db.collection('Payment').findOne({ _id: id }))
}

// --- Inspection ---
export async function mongoCreateInspection(data) {
  const db = await getMongoDb()
  const id = uuidv4()
  const doc = {
    _id: id,
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
    createdAt: new Date(),
    completedAt: data.completedAt ?? null,
  }
  await db.collection('Inspection').insertOne(doc)
  return toApiShape(doc)
}

export async function mongoUpdateInspection(id, patch) {
  const db = await getMongoDb()
  const $set = {}
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) $set[k] = v
  }
  if (Object.keys($set).length === 0) {
    const doc = await db.collection('Inspection').findOne({ _id: id })
    if (!doc) throw httpError('Denetim bulunamadı', 404)
    return toApiShape(doc)
  }
  const r = await db.collection('Inspection').updateOne({ _id: id }, { $set })
  if (r.matchedCount === 0) throw httpError('Denetim bulunamadı', 404)
  return toApiShape(await db.collection('Inspection').findOne({ _id: id }))
}

export async function mongoAddSkippedQuestion(inspectionId, questionId) {
  const db = await getMongoDb()
  const r = await db.collection('Inspection').updateOne(
    { _id: inspectionId },
    { $addToSet: { skippedQuestionIds: questionId } }
  )
  if (r.matchedCount === 0) throw httpError('Denetim bulunamadı', 404)
  return toApiShape(await db.collection('Inspection').findOne({ _id: inspectionId }))
}

export async function mongoRemoveSkippedQuestion(inspectionId, questionId) {
  const db = await getMongoDb()
  const r = await db.collection('Inspection').updateOne(
    { _id: inspectionId },
    { $pull: { skippedQuestionIds: questionId } }
  )
  if (r.matchedCount === 0) throw httpError('Denetim bulunamadı', 404)
  return toApiShape(await db.collection('Inspection').findOne({ _id: inspectionId }))
}

// --- InspectionAnswer ---
export async function mongoCreateInspectionAnswer(data) {
  const db = await getMongoDb()
  const id = uuidv4()
  const doc = {
    _id: id,
    inspectionId: data.inspectionId,
    questionId: data.questionId,
    answer: data.answer,
    note: data.note || '',
    photos: data.photos || '',
    createdAt: new Date(),
  }
  await db.collection('InspectionAnswer').insertOne(doc)
  return toApiShape(doc)
}

export async function mongoUpdateInspectionAnswer(id, data) {
  const db = await getMongoDb()
  const existing = await db.collection('InspectionAnswer').findOne({ _id: id })
  if (!existing) throw httpError('Cevap bulunamadı', 404)
  const $set = {}
  if (data.answer !== undefined) $set.answer = data.answer
  if (data.note !== undefined) $set.note = data.note
  if (data.photos !== undefined) $set.photos = data.photos
  if (Object.keys($set).length === 0) return toApiShape(existing)
  await db.collection('InspectionAnswer').updateOne({ _id: id }, { $set })
  return toApiShape(await db.collection('InspectionAnswer').findOne({ _id: id }))
}

export async function mongoFindInspectionAnswerByInspectionAndQuestion(inspectionId, questionId) {
  const db = await getMongoDb()
  const doc = await db.collection('InspectionAnswer').findOne({ inspectionId, questionId })
  return doc ? toApiShape(doc) : null
}
