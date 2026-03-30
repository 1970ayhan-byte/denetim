'use client'

import Link from 'next/link'
import { Phone, MapPin } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="bg-muted mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-lg mb-4">SARIMEŞE DANIŞMANLIK</h3>
            <p className="text-sm text-muted-foreground">EĞİTİM VE BİLİŞİM TEKNOLOJİLERİ SANAYİ TİCARET LTD ŞTİ</p>
            <p className="text-sm text-muted-foreground mt-2">17 yıllık MEB danışmanlık tecrübesi</p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-lg mb-4">İletişim</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="h-4 w-4" /> 0554 958 43 20
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="h-4 w-4" /> 0216 606 12 78
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="h-4 w-4" /> KOZYATAĞI MAH. BAYAR CAD. NO:86 KADIKÖY / İSTANBUL
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-lg mb-4">Hızlı Linkler</h3>
            <div className="space-y-2 text-sm">
              <Link href="/hizmetler" className="block hover:text-primary">
                Hizmetlerimiz
              </Link>
              <Link href="/paketler" className="block hover:text-primary">
                Paketler
              </Link>
              <Link href="/iletisim" className="block hover:text-primary">
                İletişim
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Sarımeşe Danışmanlık. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  )
}
