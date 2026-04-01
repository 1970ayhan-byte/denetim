'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileCheck,
  Building2,
  Shield,
  Users,
  BookOpen,
  ClipboardList,
  MonitorCog,
} from 'lucide-react'

const DENETIM_ALANLARI = [
  {
    icon: FileCheck,
    title: 'Kuruluşa Ait Temel Bilgiler',
    desc: 'Kuruluş Evraklarının Kontrolü',
  },
  {
    icon: Building2,
    title: 'Bina Fiziksel Özellikleri',
    desc: 'Fiziki şartlar ve Gereklilikler Kontrolü',
  },
  {
    icon: Shield,
    title: 'Sağlık ve Güvenlik Önlemleri',
    desc: 'Hijyen, İlaçlama, Yangın, Deprem Kontrolü',
  },
  {
    icon: Users,
    title: 'Personel İşleri',
    desc: 'Mebbis, Çalışan Evrakları, SGK, Servis Kontrolü',
  },
  {
    icon: BookOpen,
    title: 'Öğrenci İşleri',
    desc: 'E-Okul, Kayıt, Ücret ve Fatura Kontrolü',
  },
  {
    icon: ClipboardList,
    title: 'Okul Öncesi Program İçerikleri',
    desc: 'Toplantı Tutanakları, Planlar, Komisyonlar, Çizelgeler Kontrolü',
  },
  {
    icon: MonitorCog,
    title: 'İç Denetim ve Bilişim Sistemleri',
    desc: 'Kontroller, Uygunluklar, Zamanlama Kontrolü',
  },
]

export function HizmetlerPage() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Hizmetlerimiz</h1>

        <div className="max-w-3xl mx-auto mb-12 text-center">
          <p className="text-lg text-muted-foreground">
            Anaokullarının denetimlerde karşılaşabileceği riskleri önceden tespit ediyor, kurumunuzu MEB, Yangın ve
            Tarım denetimlerine hazırlıyoruz.
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center">Denetlenen Alanlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {DENETIM_ALANLARI.map((item, i) => (
            <Card key={i} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <item.icon className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-lg leading-snug">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/paketler">Paketleri İncele</Link>
          </Button>
          <Button size="lg" asChild>
            <Link href="/iletisim">Denetleme Yaptırmak İstiyorum</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
