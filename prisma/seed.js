// CLI: MONGO_URL ile çalışır. API seed /api/seed ayrı (x-access-token + tek sefer kilidi).
const { MongoClient } = require('mongodb')

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/anaokulu_denetim'

async function main() {
  console.log('🌱 Seeding database...')
  console.log('📍 Connecting to:', MONGO_URL)

  const { runSeed } = await import('../lib/seedDb.js')
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  try {
    const summary = await runSeed(client.db())
    console.log('\n🎉 Database seeded successfully!')
    console.log(`
📊 Summary:
- Users: ${summary.users}
- Cities: ${summary.cities}
- Packages: ${summary.packages}
- Categories: ${summary.categories}
- Questions: ${summary.questions}

🔐 Login credentials:
- Admin: ${summary.adminPhone} / ${summary.adminPasswordHint}
- Inspector: ${summary.inspectorPhone} / ${summary.inspectorPasswordHint}
  `)
  } finally {
    await client.close()
  }
}

main().catch((e) => {
  console.error('❌ Seed error:', e)
  process.exit(1)
})
