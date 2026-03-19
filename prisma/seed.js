// Seed script using MongoDB driver directly (no transaction required)
const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/anaokulu_denetim'

async function main() {
  console.log('🌱 Seeding database...')
  console.log('📍 Connecting to:', MONGO_URL)

  const client = new MongoClient(MONGO_URL)
  await client.connect()
  const db = client.db()

  // Hash passwords
  const adminPassword = await bcrypt.hash('123457', 10)
  const inspectorPassword = await bcrypt.hash('123456', 10)

  // Clear existing data
  console.log('🗑️ Clearing existing data...')
  await db.collection('InspectionAnswer').deleteMany({})
  await db.collection('Inspection').deleteMany({})
  await db.collection('Question').deleteMany({})
  await db.collection('Category').deleteMany({})
  await db.collection('Payment').deleteMany({})
  await db.collection('Package').deleteMany({})
  await db.collection('City').deleteMany({})
  await db.collection('User').deleteMany({})

  // Create Admin
  const adminId = uuidv4()
  await db.collection('User').insertOne({
    _id: adminId,
    phone: '05549584320',
    password: adminPassword,
    name: 'Admin',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  })
  console.log('✅ Admin created: 05549584320 / 123457')

  // Create Inspector
  const inspectorId = uuidv4()
  await db.collection('User').insertOne({
    _id: inspectorId,
    phone: '05549584321',
    password: inspectorPassword,
    name: 'seyhan',
    role: 'inspector',
    createdAt: new Date(),
    updatedAt: new Date()
  })
  console.log('✅ Inspector created: 05549584321 / 123456')

  // Create cities
  const istanbulId = uuidv4()
  await db.collection('City').insertOne({
    _id: istanbulId,
    name: 'İstanbul',
    travelCost: 0,
    accommodationCost: 0,
    createdAt: new Date()
  })

  const izmirId = uuidv4()
  await db.collection('City').insertOne({
    _id: izmirId,
    name: 'İzmir',
    travelCost: 500,
    accommodationCost: 300,
    createdAt: new Date()
  })

  const ankaraId = uuidv4()
  await db.collection('City').insertOne({
    _id: ankaraId,
    name: 'Ankara',
    travelCost: 400,
    accommodationCost: 250,
    createdAt: new Date()
  })
  console.log('✅ Cities created: İstanbul, İzmir, Ankara')

  // Create packages
  const pkg1Id = uuidv4()
  await db.collection('Package').insertOne({
    _id: pkg1Id,
    name: 'KURULUŞ STANDARTLARI DENETLEMESİ',
    price: 5000,
    description: 'MEB kuruluş standartları kapsamlı denetimi',
    features: JSON.stringify(['MEB Evrak Kontrolü', 'Fiziki Şartlar Kontrolü', 'Personel Kontrolü']),
    active: true,
    createdAt: new Date()
  })

  const pkg2Id = uuidv4()
  await db.collection('Package').insertOne({
    _id: pkg2Id,
    name: 'MEB EVRAK DENETLEME',
    price: 3000,
    description: 'Sadece MEB evrak kontrolü',
    features: JSON.stringify(['MEB Evrak Kontrolü']),
    active: true,
    createdAt: new Date()
  })
  console.log('✅ Packages created: 2')

  // Create categories
  const cat1Id = uuidv4()
  await db.collection('Category').insertOne({
    _id: cat1Id,
    name: 'MEB Evrak Kontrolü',
    order: 1,
    createdAt: new Date()
  })

  const cat2Id = uuidv4()
  await db.collection('Category').insertOne({
    _id: cat2Id,
    name: 'Fiziki Şartlar Kontrolü',
    order: 2,
    createdAt: new Date()
  })

  const cat3Id = uuidv4()
  await db.collection('Category').insertOne({
    _id: cat3Id,
    name: 'Personel Kontrolü',
    order: 3,
    createdAt: new Date()
  })
  console.log('✅ Categories created: 3')

  // Create questions for MEB Evrak
  await db.collection('Question').insertMany([
    {
      _id: uuidv4(),
      categoryId: cat1Id,
      question: 'Kurum açılış izin belgesi mevcut mu?',
      regulationText: 'Milli Eğitim Bakanlığı Özel Öğretim Kurumları Yönetmeliği Madde 5',
      imageUrl: '',
      order: 1,
      penaltyType: 'idari_para_cezasi',
      createdAt: new Date()
    },
    {
      _id: uuidv4(),
      categoryId: cat1Id,
      question: 'Personel sözleşmeleri güncel ve onaylı mı?',
      regulationText: 'İş Kanunu Madde 8 ve MEB Özel Öğretim Kurumları Yönetmeliği',
      imageUrl: '',
      order: 2,
      penaltyType: 'uyarı',
      createdAt: new Date()
    }
  ])

  // Create questions for Fiziki Şartlar
  await db.collection('Question').insertMany([
    {
      _id: uuidv4(),
      categoryId: cat2Id,
      question: 'Yangın söndürme cihazları kontrol edilmiş ve dolumu yapılmış mı?',
      regulationText: 'Binaların Yangından Korunması Hakkında Yönetmelik Madde 99',
      imageUrl: '',
      order: 1,
      penaltyType: 'idari_para_cezasi',
      createdAt: new Date()
    },
    {
      _id: uuidv4(),
      categoryId: cat2Id,
      question: 'Acil çıkış kapıları ve yönlendirme işaretleri uygun mu?',
      regulationText: 'Binaların Yangından Korunması Hakkında Yönetmelik Madde 45',
      imageUrl: '',
      order: 2,
      penaltyType: 'idari_para_cezasi',
      createdAt: new Date()
    }
  ])

  // Create questions for Personel
  await db.collection('Question').insertOne({
    _id: uuidv4(),
    categoryId: cat3Id,
    question: 'Tüm personelin sabıka kaydı sorgulama belgesi mevcut mu?',
    regulationText: 'Okul Öncesi Eğitim ve İlköğretim Kurumları Yönetmeliği',
    imageUrl: '',
    order: 1,
    penaltyType: 'idari_para_cezasi',
    createdAt: new Date()
  })
  console.log('✅ Questions created: 5')

  await client.close()

  console.log('\n🎉 Database seeded successfully!')
  console.log(`
📊 Summary:
- Users: 2 (1 admin, 1 inspector)
- Cities: 3
- Packages: 2
- Categories: 3
- Questions: 5

🔐 Login credentials:
- Admin: 05549584320 / 123457
- Inspector: 05549584321 / 123456
  `)
}

main().catch(e => {
  console.error('❌ Seed error:', e)
  process.exit(1)
})
