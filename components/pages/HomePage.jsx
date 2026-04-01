'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, FileCheck, BookOpen, CreditCard, CheckCircle2, ChevronRight } from 'lucide-react'
import { trackCTAClick } from '@/lib/tracking'

export function HomePage() {
  const router = useRouter()
  const [latestNews, setLatestNews] = useState([])

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((data) => {
        setLatestNews(data.slice(0, 3))
      })
  }, [])

  return (
    <div>
      <section className="relative h-[600px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 z-10" />
        <img
          src="https://images.unsplash.com/photo-1740493430383-a0bfff9550a5"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Okul Öncesi Denetim"
        />
        <div className="container mx-auto px-4 z-20 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Denetime Hazır mısınız?</h1>
            <p className="text-xl mb-4">Anaokullarına Özel Profesyonel İç Denetim</p>
            <p className="text-lg mb-8 leading-relaxed">
              Mevzuata uygun, eksiksiz ve sürdürülebilir bir okul yönetimi için geliştirilmiş profesyonel
              denetim modelimiz ile kurumunuzu resmi denetimlere hazırlıyoruz.
            </p>
            <p className="text-2xl font-semibold mb-8">Denetime yakalanan değil, denetime hazır olan kurum olun.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => {
                  trackCTAClick('Denetleme Yaptırmak İstiyorum', 'hero')
                  router.push('/paketler')
                }}
                className="bg-white text-primary hover:bg-white/90 font-semibold text-base px-8"
              >
                Denetleme Yaptırmak İstiyorum
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  trackCTAClick('Bilgi Almak İstiyorum', 'hero')
                  router.push('/iletisim')
                }}
                className="bg-white text-primary hover:bg-white/90 font-semibold text-base px-8"
              >
                Bilgi Almak İstiyorum
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">SARIMEŞE DANIŞMANLIK</h2>
          <p className="text-xl mt-2">17 yıllık MEB danışmanlık tecrübesi</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-12">Neden Sarımeşe Danışmanlık?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow text-center">
              <CardHeader className="pb-6">
                <div className="flex justify-center mb-4">
                  <Shield className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="text-xl">Mevzuata Uygun</CardTitle>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-xl transition-shadow text-center">
              <CardHeader className="pb-6">
                <div className="flex justify-center mb-4">
                  <FileCheck className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="text-xl">Eksiksiz Denetim</CardTitle>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-xl transition-shadow text-center">
              <CardHeader className="pb-6">
                <div className="flex justify-center mb-4">
                  <BookOpen className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="text-xl">Detaylı Raporlama</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Güvenli ve Kolay Ödeme</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">ParamPOS Güvencesi</h3>
                    <p className="text-sm text-muted-foreground">SSL sertifikalı güvenli ödeme altyapısı</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">6 Taksit İmkanı</h3>
                    <p className="text-sm text-muted-foreground">Tüm kredi kartlarına 6 taksit seçeneği</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">3D Secure</h3>
                    <p className="text-sm text-muted-foreground">Ekstra güvenlik katmanı ile koruma</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3"
                alt="Güvenli Ödeme"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {latestNews.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Bizden Haberler</h2>
              <p className="text-muted-foreground">Son gelişmeler ve duyurular</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestNews.map((news) => (
                <Card key={news.id} className="hover:shadow-xl transition-shadow">
                  {news.imageUrl && (
                    <img
                      src={news.imageUrl}
                      alt={news.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{news.title}</CardTitle>
                    <CardDescription>{new Date(news.createdAt).toLocaleDateString('tr-TR')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{news.content}</p>
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <Link href={news.slug ? `/haberler/${news.slug}` : '/haberler'}>
                        Devamını Oku <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link href="/haberler">Tüm Haberleri Gör</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-3xl font-bold mb-4">Kurumunuzu Denetime Hazırlayalım</h2>
          <p className="text-lg mb-8 opacity-90">Hemen iletişime geçin, ücretsiz ön değerlendirme alın</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold"
              onClick={() => {
                trackCTAClick('Bilgi Almak İstiyorum', 'cta_section')
                router.push('/iletisim')
              }}
            >
              Bilgi Almak İstiyorum <ChevronRight className="ml-2" />
            </Button>
            <Button
              size="lg"
              className="bg-white/10 text-white border-2 border-white hover:bg-white hover:text-primary font-semibold transition-all"
              onClick={() => {
                trackCTAClick('Paketleri İncele', 'cta_section')
                router.push('/paketler')
              }}
            >
              Paketleri İncele
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
