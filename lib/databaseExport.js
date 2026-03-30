import { prisma } from '@/lib/prisma'

/**
 * Tüm tabloları tek JSON yapısında döner (admin yedek).
 * Geri yüklemek için aynı token ile POST /api/admin/database-import ve bu JSON gövdesi kullanılır.
 * @returns {Promise<{ version: number, exportedAt: string } & Record<string, unknown[]>>}
 */
export async function exportFullDatabase() {
  const exportedAt = new Date().toISOString()
  const [
    users,
    cities,
    packages,
    categories,
    questions,
    payments,
    inspections,
    inspectionAnswers,
    messages,
    news,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.city.findMany(),
    prisma.package.findMany(),
    prisma.category.findMany(),
    prisma.question.findMany(),
    prisma.payment.findMany(),
    prisma.inspection.findMany(),
    prisma.inspectionAnswer.findMany(),
    prisma.message.findMany(),
    prisma.news.findMany(),
  ])

  return {
    version: 1,
    exportedAt,
    users,
    cities,
    packages,
    categories,
    questions,
    payments,
    inspections,
    inspectionAnswers,
    messages,
    news,
  }
}
