/**
 * CLI: .env içindeki DATABASE_URL ile export JSON içe aktarır.
 * Kullanım: node --env-file=.env scripts/import-export.mjs [dosya.json]
 * Varsayılan dosya: denetim-export.json (proje kökü)
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { importFullDatabaseWithClient } from '../lib/databaseImportCore.js'

const file = process.argv[2] || 'denetim-export.json'
const path = resolve(process.cwd(), file)
const payload = JSON.parse(readFileSync(path, 'utf8'))

const prisma = new PrismaClient()
try {
  const summary = await importFullDatabaseWithClient(prisma, payload)
  console.log('İçe aktarma tamam:', JSON.stringify(summary, null, 2))
} finally {
  await prisma.$disconnect()
}
