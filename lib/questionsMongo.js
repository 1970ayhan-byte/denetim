import { v4 as uuidv4 } from 'uuid'
import { getMongoDb } from '@/lib/mongoDb'

const COLLECTION = 'Question'
const CATEGORY = 'Category'

function toApiShape(doc) {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { id: _id, ...rest }
}

function httpError(message, statusCode) {
  const err = new Error(message)
  err.statusCode = statusCode
  return err
}

/**
 * Prisma MongoDB yazma işlemleri replica set gerektirir; tek düğüm MongoDB için doğrudan koleksiyon kullanılır.
 */
export async function mongoCreateQuestion(body) {
  const db = await getMongoDb()
  const category = await db.collection(CATEGORY).findOne({ _id: body.categoryId })
  if (!category) {
    throw httpError('Kategori bulunamadı', 400)
  }
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
  await db.collection(COLLECTION).insertOne(doc)
  return toApiShape(doc)
}

export async function mongoUpdateQuestion(id, body) {
  const db = await getMongoDb()
  const existing = await db.collection(COLLECTION).findOne({ _id: id })
  if (!existing) {
    throw httpError('Soru bulunamadı', 404)
  }
  if (body.categoryId != null) {
    const category = await db.collection(CATEGORY).findOne({ _id: body.categoryId })
    if (!category) {
      throw httpError('Kategori bulunamadı', 400)
    }
  }
  const $set = {}
  if (body.categoryId !== undefined) $set.categoryId = body.categoryId
  if (body.question !== undefined) $set.question = body.question
  if (body.regulationText !== undefined) $set.regulationText = body.regulationText
  if (body.imageUrl !== undefined) $set.imageUrl = body.imageUrl
  if (body.order !== undefined) $set.order = Number(body.order) || 0
  if (body.penaltyType !== undefined) $set.penaltyType = body.penaltyType
  await db.collection(COLLECTION).updateOne({ _id: id }, { $set })
  const updated = await db.collection(COLLECTION).findOne({ _id: id })
  return toApiShape(updated)
}

export async function mongoDeleteQuestion(id) {
  const db = await getMongoDb()
  const result = await db.collection(COLLECTION).deleteOne({ _id: id })
  if (result.deletedCount === 0) {
    throw httpError('Soru bulunamadı', 404)
  }
}
