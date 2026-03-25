import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

/**
 * @param {import('mongodb').Db} db — bağlı Mongo DB (client kapatma burada yapılmaz)
 */
export async function runSeed(db) {
  const adminPassword = await bcrypt.hash('123457', 10)
  const inspectorPassword = await bcrypt.hash('123456', 10)

  await db.collection('InspectionAnswer').deleteMany({})
  await db.collection('Inspection').deleteMany({})
  await db.collection('Question').deleteMany({})
  await db.collection('Category').deleteMany({})
  await db.collection('Payment').deleteMany({})
  await db.collection('Package').deleteMany({})
  await db.collection('City').deleteMany({})
  await db.collection('User').deleteMany({})

  const adminId = uuidv4()
  await db.collection('User').insertOne({
    _id: adminId,
    phone: '05549584320',
    password: adminPassword,
    name: 'Admin',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const inspectorId = uuidv4()
  await db.collection('User').insertOne({
    _id: inspectorId,
    phone: '05549584321',
    password: inspectorPassword,
    name: 'seyhan',
    role: 'inspector',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const istanbulId = uuidv4()
  await db.collection('City').insertOne({
    _id: istanbulId,
    name: 'İstanbul',
    travelCost: 0,
    accommodationCost: 0,
    createdAt: new Date(),
  })

  const izmirId = uuidv4()
  await db.collection('City').insertOne({
    _id: izmirId,
    name: 'İzmir',
    travelCost: 500,
    accommodationCost: 300,
    createdAt: new Date(),
  })

  const ankaraId = uuidv4()
  await db.collection('City').insertOne({
    _id: ankaraId,
    name: 'Ankara',
    travelCost: 400,
    accommodationCost: 250,
    createdAt: new Date(),
  })

  const pkg1Id = uuidv4()
  await db.collection('Package').insertOne({
    _id: pkg1Id,
    name: 'KURULUŞ STANDARTLARI DENETLEMESİ',
    price: 5000,
    description: 'MEB kuruluş standartları kapsamlı denetimi',
    features: JSON.stringify(['MEB Evrak Kontrolü', 'Fiziki Şartlar Kontrolü', 'Personel Kontrolü']),
    active: true,
    createdAt: new Date(),
  })

  const pkg2Id = uuidv4()
  await db.collection('Package').insertOne({
    _id: pkg2Id,
    name: 'MEB EVRAK DENETLEME',
    price: 3000,
    description: 'Sadece MEB evrak kontrolü',
    features: JSON.stringify(['MEB Evrak Kontrolü']),
    active: true,
    createdAt: new Date(),
  })

  const cat1Id = uuidv4()
  await db.collection('Category').insertOne({
    _id: cat1Id,
    name: 'MEB Evrak Kontrolü',
    order: 1,
    createdAt: new Date(),
  })

  const cat2Id = uuidv4()
  await db.collection('Category').insertOne({
    _id: cat2Id,
    name: 'Fiziki Şartlar Kontrolü',
    order: 2,
    createdAt: new Date(),
  })

  const cat3Id = uuidv4()
  await db.collection('Category').insertOne({
    _id: cat3Id,
    name: 'Personel Kontrolü',
    order: 3,
    createdAt: new Date(),
  })

  await db.collection('Question').insertMany([
    {
      _id: uuidv4(),
      categoryId: cat1Id,
      question: 'Kurum açılış izin belgesi mevcut mu?',
      regulationText: 'Milli Eğitim Bakanlığı Özel Öğretim Kurumları Yönetmeliği Madde 5',
      imageUrl: '',
      order: 1,
      penaltyType: 'idari_para_cezasi',
      createdAt: new Date(),
    },
    {
      _id: uuidv4(),
      categoryId: cat1Id,
      question: 'Personel sözleşmeleri güncel ve onaylı mı?',
      regulationText: 'İş Kanunu Madde 8 ve MEB Özel Öğretim Kurumları Yönetmeliği',
      imageUrl: '',
      order: 2,
      penaltyType: 'uyarı',
      createdAt: new Date(),
    },
  ])

  await db.collection('Question').insertMany([
    {
      _id: uuidv4(),
      categoryId: cat2Id,
      question: 'Yangın söndürme cihazları kontrol edilmiş ve dolumu yapılmış mı?',
      regulationText: 'Binaların Yangından Korunması Hakkında Yönetmelik Madde 99',
      imageUrl: '',
      order: 1,
      penaltyType: 'idari_para_cezasi',
      createdAt: new Date(),
    },
    {
      _id: uuidv4(),
      categoryId: cat2Id,
      question: 'Acil çıkış kapıları ve yönlendirme işaretleri uygun mu?',
      regulationText: 'Binaların Yangından Korunması Hakkında Yönetmelik Madde 45',
      imageUrl: '',
      order: 2,
      penaltyType: 'idari_para_cezasi',
      createdAt: new Date(),
    },
  ])

  await db.collection('Question').insertOne({
    _id: uuidv4(),
    categoryId: cat3Id,
    question: 'Tüm personelin sabıka kaydı sorgulama belgesi mevcut mu?',
    regulationText: 'Okul Öncesi Eğitim ve İlköğretim Kurumları Yönetmeliği',
    imageUrl: '',
    order: 1,
    penaltyType: 'idari_para_cezasi',
    createdAt: new Date(),
  })

  return {
    users: 2,
    cities: 3,
    packages: 2,
    categories: 3,
    questions: 5,
    adminPhone: '05549584320',
    adminPasswordHint: '123457',
    inspectorPhone: '05549584321',
    inspectorPasswordHint: '123456',
  }
}
