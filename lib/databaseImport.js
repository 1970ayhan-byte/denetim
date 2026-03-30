import { prisma } from '@/lib/prisma'
import { importFullDatabaseWithClient } from '@/lib/databaseImportCore'

export { importFullDatabaseWithClient } from '@/lib/databaseImportCore'

/**
 * `exportFullDatabase` çıktısı veya aynı şekilli JSON’u içe aktarır.
 * Mevcut tüm uygulama verisini siler, sonra yedekten yükler (tam değiştirme).
 *
 * @param {Record<string, unknown>} payload
 * @returns {Promise<Record<string, number>>}
 */
export async function importFullDatabase(payload) {
  return importFullDatabaseWithClient(prisma, payload)
}
