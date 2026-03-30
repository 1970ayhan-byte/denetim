import { MongoClient } from 'mongodb'

const uri = process.env.MONGO_URL

/** @type {import('mongodb').MongoClient | undefined} */
let client
/** @type {Promise<import('mongodb').MongoClient> | undefined} */
let clientPromise

function getClientPromise() {
  if (!uri) {
    throw new Error('MONGO_URL is not defined')
  }
  if (clientPromise) return clientPromise
  if (process.env.NODE_ENV === 'development') {
    const g = globalThis
    if (!g.__denetimMongoClientPromise) {
      client = new MongoClient(uri)
      g.__denetimMongoClientPromise = client.connect()
    }
    clientPromise = g.__denetimMongoClientPromise
  } else {
    client = new MongoClient(uri)
    clientPromise = client.connect()
  }
  return clientPromise
}

/**
 * @returns {Promise<import('mongodb').Db>}
 */
export async function getMongoDb() {
  const c = await getClientPromise()
  return c.db()
}
