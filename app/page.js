'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, XCircle, AlertCircle, Menu, X, Phone, Mail, MapPin,
  Shield, FileCheck, Building2, BookOpen, ChevronRight, LogOut,
  Users, Package, MapIcon, MessageSquare, CreditCard, ClipboardList,
  Settings, Plus, Edit2, Trash2, Eye, Download, Camera, Save, Clock, Zap
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/sonner'
import { toast as sonnerToast } from 'sonner'
import { trackFormSubmit, trackWhatsAppClick, trackCTAClick, openWhatsApp, trackPackageView, trackPurchaseIntent } from '@/lib/tracking'
import WhatsAppButton from '@/components/WhatsAppButton'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedNews, setSelectedNews] = useState(null)

  // Load user from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentPage])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setCurrentPage('home')
    sonnerToast.success('Çıkış yapıldı')
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-16">
            {/* Logo - Sol */}
            <button onClick={() => setCurrentPage('home')} className="text-xl font-bold text-primary absolute left-4 md:static md:mr-8">
              SARIMEŞE DANIŞMANLIK
            </button>
            
            {/* Ortalanmış Menü */}
            {!user && (
              <div className="hidden md:flex items-center justify-center space-x-8 flex-1">
                <button onClick={() => setCurrentPage('home')} className="text-sm hover:text-primary">Anasayfa</button>
                <button onClick={() => setCurrentPage('services')} className="text-sm hover:text-primary">Hizmetlerimiz</button>
                <button onClick={() => setCurrentPage('packages')} className="text-sm hover:text-primary">Paketler</button>
                <button onClick={() => setCurrentPage('news')} className="text-sm hover:text-primary">Bizden Haberler</button>
                <button onClick={() => setCurrentPage('contact')} className="text-sm hover:text-primary">İletişim</button>
              </div>
            )}
            
            {/* Sağ Taraf Butonlar */}
            <div className="flex items-center space-x-4 absolute right-4 md:static">
              {user ? (
                <>
                  <span className="text-sm hidden md:inline">{user.name} ({user.role === 'admin' ? 'Admin' : 'Denetçi'})</span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(user.role === 'admin' ? 'admin' : 'inspector')}>
                    Panel
                  </Button>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage('login')}>
                    Giriş Yap
                  </Button>
                  <Button size="sm" onClick={() => setCurrentPage('contact')}>
                    Bilgi Al
                  </Button>
                </>
              )}
              
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-muted">Anasayfa</button>
              <button onClick={() => { setCurrentPage('services'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-muted">Hizmetlerimiz</button>
              <button onClick={() => { setCurrentPage('packages'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-muted">Paketler</button>
              <button onClick={() => { setCurrentPage('news'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-muted">Bizden Haberler</button>
              <button onClick={() => { setCurrentPage('contact'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-muted">İletişim</button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
        {currentPage === 'services' && <ServicesPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'packages' && <PackagesPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'news' && <NewsPage setCurrentPage={setCurrentPage} setSelectedNews={setSelectedNews} />}
        {currentPage === 'news-detail' && selectedNews && <NewsDetailPage news={selectedNews} setCurrentPage={setCurrentPage} />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'login' && <LoginPage setCurrentPage={setCurrentPage} setToken={setToken} setUser={setUser} />}
        {currentPage === 'admin' && user?.role === 'admin' && <AdminPanel token={token} />}
        {currentPage === 'inspector' && user?.role === 'inspector' && <InspectorPanel token={token} user={user} />}
        {currentPage === 'landing' && <LandingPage />}
      </main>

      {/* WhatsApp Floating Button */}
      {!user && <WhatsAppButton />}

      {/* Footer */}
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
                <div className="flex items-center justify-center md:justify-start gap-2"><Phone className="h-4 w-4" /> 0554 958 43 20</div>
                <div className="flex items-center justify-center md:justify-start gap-2"><Phone className="h-4 w-4" /> 0216 606 12 78</div>
                <div className="flex items-center justify-center md:justify-start gap-2"><MapPin className="h-4 w-4" /> KOZYATAĞI MAH. BAYAR CAD. NO:86 KADIKÖY / İSTANBUL</div>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-bold text-lg mb-4">Hızlı Linkler</h3>
              <div className="space-y-2 text-sm">
                <button onClick={() => setCurrentPage('services')} className="block hover:text-primary">Hizmetlerimiz</button>
                <button onClick={() => setCurrentPage('packages')} className="block hover:text-primary">Paketler</button>
                <button onClick={() => setCurrentPage('contact')} className="block hover:text-primary">İletişim</button>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2025 Sarımeşe Danışmanlık. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  )
}

// Home Page
function HomePage({ setCurrentPage }) {
  const [latestNews, setLatestNews] = useState([])
  
  useEffect(() => {
    fetch('/api/news').then(r => r.json()).then(data => {
      setLatestNews(data.slice(0, 3))
    })
  }, [])
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1740493430383-a0bfff9550a5" 
          className="absolute inset-0 w-full h-full object-cover"
          alt="Okul Öncesi Denetim"
        />
        <div className="container mx-auto px-4 z-20 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Denetime Hazır mısınız?
            </h1>
            <p className="text-xl mb-4">
              Anaokullarına Özel Profesyonel İç Denetim
            </p>
            <p className="text-lg mb-8 leading-relaxed">
              Mevzuata uygun, eksiksiz ve sürdürülebilir bir okul yönetimi için geliştirilmiş
              profesyonel denetim modelimiz ile kurumunuzu resmi denetimlere hazırlıyoruz.
            </p>
            <p className="text-2xl font-semibold mb-8">
              Denetime yakalanan değil, denetime hazır olan kurum olun.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" onClick={() => {
                trackCTAClick('Denetleme Yaptırmak İstiyorum', 'hero')
                setCurrentPage('packages')
              }} className="bg-white text-primary hover:bg-white/90 font-semibold text-base px-8">
                Denetleme Yaptırmak İstiyorum
              </Button>
              <Button size="lg" onClick={() => {
                trackCTAClick('Bilgi Almak İstiyorum', 'hero')
                setCurrentPage('contact')
              }} className="bg-white text-primary hover:bg-white/90 font-semibold text-base px-8">
                Bilgi Almak İstiyorum
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="bg-primary text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">SARIMEŞE DANIŞMANLIK</h2>
          <p className="text-xl mt-2">17 yıllık MEB danışmanlık tecrübesi</p>
        </div>
      </section>

      {/* Features - Görseller Kaldırıldı */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-bold text-center mb-12">Neden Sarımeşe Danışmanlık?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Shield className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="text-xl">Mevzuata Uygun</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">MEB, Yangın ve Tarım yönetmeliklerine tam uyum</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <FileCheck className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="text-xl">Eksiksiz Denetim</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Evrak, fiziki şartlar ve finans kontrolü</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <BookOpen className="h-16 w-16 text-primary" />
                </div>
                <CardTitle className="text-xl">Detaylı Raporlama</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Eksiklikler ve çözüm önerileri ile kapsamlı rapor</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Güvenli Ödeme Bölümü */}
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

      {/* Bizden Haberler - Footer Üstü */}
      {latestNews.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Bizden Haberler</h2>
              <p className="text-muted-foreground">Son gelişmeler ve duyurular</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestNews.map(news => (
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
                    <CardDescription>
                      {new Date(news.createdAt).toLocaleDateString('tr-TR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {news.content}
                    </p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={() => setCurrentPage('news')}
                    >
                      Devamını Oku <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" onClick={() => setCurrentPage('news')}>
                Tüm Haberleri Gör
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-3xl font-bold mb-4">Kurumunuzu Denetime Hazırlayalım</h2>
          <p className="text-lg mb-8 opacity-90">Hemen iletişime geçin, ücretsiz ön değerlendirme alın</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold" onClick={() => {
              trackCTAClick('Bilgi Almak İstiyorum', 'cta_section')
              setCurrentPage('contact')
            }}>
              Bilgi Almak İstiyorum <ChevronRight className="ml-2" />
            </Button>
            <Button 
              size="lg" 
              className="bg-white/10 text-white border-2 border-white hover:bg-white hover:text-primary font-semibold transition-all" 
              onClick={() => {
                trackCTAClick('Paketleri İncele', 'cta_section')
                setCurrentPage('packages')
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

// Services Page
function ServicesPage({ setCurrentPage }) {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Hizmetlerimiz</h1>
        
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <p className="text-lg text-muted-foreground">
            Anaokullarının denetimlerde karşılaşabileceği riskleri önceden tespit ediyor,
            kurumunuzu MEB, Yangın ve Tarım denetimlerine hazırlıyoruz.
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center">Denetlenen Alanlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            { icon: FileCheck, title: 'MEB Evrakları', desc: 'Tüm resmi evrakların kontrolü' },
            { icon: Building2, title: 'MEBBİS Kontrolü', desc: 'Sistem kayıtlarının doğruluğu' },
            { icon: BookOpen, title: 'e-Okul Kontrolü', desc: 'Öğrenci İşleri ve Personel Kullanıcı Tanımlamaları' },
            { icon: Shield, title: 'Fiziki Şartlar', desc: 'Bina ve donanım uygunluğu' },
            { icon: AlertCircle, title: 'Yangın Yönetmeliği', desc: 'Yangın Önlem Uygunlukları' },
            { icon: CheckCircle2, title: 'Tarım ve Sağlık', desc: 'Gıda İşletme Uygunluk Denetimi' }
          ].map((item, i) => (
            <Card key={i} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <item.icon className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" onClick={() => setCurrentPage('packages')}>
            Paketleri İncele
          </Button>
          <Button size="lg" onClick={() => setCurrentPage('contact')}>
            Denetleme Yaptırmak İstiyorum
          </Button>
        </div>
      </div>
    </div>
  )
}

// Packages Page
function PackagesPage({ setCurrentPage }) {
  const [packages, setPackages] = useState([])
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [formData, setFormData] = useState({
    schoolName: '',
    district: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    taxOffice: '',
    taxNumber: '',
    address: ''
  })

  useEffect(() => {
    fetch('/api/packages').then(r => r.json()).then(setPackages)
    fetch('/api/cities').then(r => r.json()).then(setCities)
  }, [])
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const selectPackage = (pkg) => {
    setSelectedPackage(pkg)
    setShowCheckout(true)
  }

  const calculateTotal = () => {
    if (!selectedPackage) return 0
    let total = selectedPackage.price
    if (selectedCity) {
      total += selectedCity.travelCost + selectedCity.accommodationCost
    }
    const kdv = total * 0.20
    return { subtotal: total, kdv, total: total + kdv }
  }

  const handleCheckout = async () => {
    if (!selectedCity) {
      sonnerToast.error('Lütfen il seçin')
      return
    }
    if (!formData.schoolName || !formData.contactName || !formData.contactPhone) {
      sonnerToast.error('Lütfen zorunlu alanları doldurun')
      return
    }

    const totals = calculateTotal()
    const response = await fetch('/api/payment/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        packageId: selectedPackage.id,
        cityId: selectedCity.id,
        amount: totals.total
      })
    })

    const result = await response.json()
    if (result.success) {
      sonnerToast.success(result.message)
      setShowCheckout(false)
      setSelectedPackage(null)
      setSelectedCity(null)
      setFormData({
        schoolName: '',
        district: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        taxOffice: '',
        taxNumber: '',
        address: ''
      })
    }
  }

  if (showCheckout && selectedPackage) {
    const totals = calculateTotal()
    return (
      <div className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button variant="ghost" onClick={() => setShowCheckout(false)} className="mb-6">
            ← Geri
          </Button>
          <h1 className="text-3xl font-bold mb-8">Sipariş Özeti</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{selectedPackage.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Paket Ücreti:</span>
                  <span>{selectedPackage.price.toLocaleString('tr-TR')} TL</span>
                </div>
                {selectedCity && (
                  <>
                    <div className="flex justify-between">
                      <span>Yol Ücreti ({selectedCity.name}):</span>
                      <span>{selectedCity.travelCost.toLocaleString('tr-TR')} TL</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Konaklama Ücreti:</span>
                      <span>{selectedCity.accommodationCost.toLocaleString('tr-TR')} TL</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span>Ara Toplam:</span>
                  <span>{totals.subtotal.toLocaleString('tr-TR')} TL</span>
                </div>
                <div className="flex justify-between">
                  <span>KDV (%20):</span>
                  <span>{totals.kdv.toLocaleString('tr-TR')} TL</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Toplam:</span>
                  <span>{totals.total.toLocaleString('tr-TR')} TL</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Kurum Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>İl *</Label>
                <Select onValueChange={(val) => setSelectedCity(cities.find(c => c.id === val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="İl seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Okul Adı *</Label>
                <Input value={formData.schoolName} onChange={(e) => setFormData({...formData, schoolName: e.target.value})} />
              </div>
              <div>
                <Label>İlçe</Label>
                <Input value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} />
              </div>
              <div>
                <Label>Yetkili Adı Soyadı *</Label>
                <Input value={formData.contactName} onChange={(e) => setFormData({...formData, contactName: e.target.value})} />
              </div>
              <div>
                <Label>Telefon *</Label>
                <Input value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} />
              </div>
              <div>
                <Label>E-posta</Label>
                <Input type="email" value={formData.contactEmail} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} />
              </div>
              <div>
                <Label>Vergi Dairesi</Label>
                <Input value={formData.taxOffice} onChange={(e) => setFormData({...formData, taxOffice: e.target.value})} />
              </div>
              <div>
                <Label>Vergi No</Label>
                <Input value={formData.taxNumber} onChange={(e) => setFormData({...formData, taxNumber: e.target.value})} />
              </div>
              <div>
                <Label>Adres</Label>
                <Textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
            </CardContent>
          </Card>

          <Button size="lg" className="w-full" onClick={handleCheckout}>
            Ödemeyi Tamamla (DEMO)
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Taksit Banner - Dikkat Çekici */}
        <div className="mb-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-6 text-center shadow-lg sticky top-20 z-40">
          <div className="flex items-center justify-center gap-3 text-xl md:text-2xl font-bold">
            <CreditCard className="h-8 w-8" />
            <span>Kredi Kartına 6 Taksit - Tüm Paketlerde Geçerli</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4 text-center">Denetim Paketleri</h1>
        <p className="text-center text-lg text-muted-foreground mb-12">
          Kurumunuza uygun paketi seçin, güvenli ödeme yapın.
        </p>
        
        {/* Paketler Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {packages.map(pkg => {
            const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features || '[]') : pkg.features
            return (
              <Card key={pkg.id} className="flex flex-col hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">
                    {pkg.price.toLocaleString('tr-TR')} TL
                    <span className="text-sm font-normal text-muted-foreground"> + KDV</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
                  <div className="space-y-2">
                    {features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardContent>
                  <Button className="w-full" size="lg" onClick={() => selectPackage(pkg)}>
                    Satın Al
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Ödeme Sonrası Süreç - Yeni Bölüm */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Ödeme Sonrası Süreç</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: Package,
                title: '1. Paket Seçimi',
                desc: 'İhtiyacınıza uygun paketi seçin'
              },
              {
                icon: CreditCard,
                title: '2. Güvenli Ödeme',
                desc: 'ParamPOS ile kredi kartı / 6 taksit'
              },
              {
                icon: Phone,
                title: '3. Randevu',
                desc: 'Yetkilimiz sizi arayarak denetim günü planlar'
              },
              {
                icon: Users,
                title: '4. Uzman Ziyareti',
                desc: 'Ekibimiz kurumunuzu ziyaret eder'
              }
            ].map((step, i) => (
              <Card key={i} className="text-center bg-white hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA - Kararsız Müşteriler İçin */}
        <Card className="bg-gradient-to-r from-primary to-blue-600 text-white border-0">
          <CardContent className="py-12 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Hangi paketi seçeceğinize karar veremediniz mi?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Uzmanlarımız size en uygun paketi önerebilir
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => setCurrentPage('contact')}
              className="text-lg px-8"
            >
              <Phone className="mr-2 h-5 w-5" />
              Bilgi İstiyorum - Uzman Sizi Arasın
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

// News Page
// News Page
function NewsPage({ setCurrentPage, setSelectedNews }) {
  const [news, setNews] = useState([])
  const [currentPageNum, setCurrentPageNum] = useState(1)
  const itemsPerPage = 15

  useEffect(() => {
    fetch('/api/news').then(r => r.json()).then(setNews)
  }, [])

  // Pagination calculation
  const totalPages = Math.ceil(news.length / itemsPerPage)
  const startIndex = (currentPageNum - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentNews = news.slice(startIndex, endIndex)

  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Bizden Haberler</h1>
        <p className="text-center text-muted-foreground mb-12">Son gelişmeler ve duyurular</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {currentNews.map(item => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
              setSelectedNews(item)
              setCurrentPage('news-detail')
            }}>
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded-t-lg" />
              )}
              <CardHeader>
                <CardTitle className="text-xl line-clamp-2">{item.title}</CardTitle>
                <CardDescription>
                  {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
                <Button variant="link" className="p-0 mt-2">
                  Devamını Oku <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPageNum(p => Math.max(1, p - 1))}
              disabled={currentPageNum === 1}
            >
              Önceki
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPageNum === page ? "default" : "outline"}
                onClick={() => setCurrentPageNum(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => setCurrentPageNum(p => Math.min(totalPages, p + 1))}
              disabled={currentPageNum === totalPages}
            >
              Sonraki
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// News Detail Page
function NewsDetailPage({ news, setCurrentPage }) {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" onClick={() => setCurrentPage('news')} className="mb-6">
          ← Geri Dön
        </Button>
        
        {news.imageUrl && (
          <img 
            src={news.imageUrl} 
            alt={news.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}
        
        <h1 className="text-4xl font-bold mb-4">{news.title}</h1>
        
        <div className="flex items-center gap-4 text-muted-foreground mb-8">
          <span>{new Date(news.createdAt).toLocaleDateString('tr-TR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <p className="whitespace-pre-wrap">{news.content}</p>
        </div>
        
        {news.keywords && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="font-semibold mb-2">Etiketler:</h3>
            <div className="flex flex-wrap gap-2">
              {news.keywords.split(',').map((keyword, i) => (
                <Badge key={i} variant="secondary">{keyword.trim()}</Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Button size="lg" onClick={() => setCurrentPage('contact')}>
            Bilgi Almak İstiyorum
          </Button>
        </div>
      </div>
    </div>
  )
}

// Contact Page
function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    schoolName: '',
    phone: '',
    type: 'bilgi_almak'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    const result = await response.json()
    sonnerToast.success(result.message)
    setFormData({ name: '', schoolName: '', phone: '', type: 'bilgi_almak' })
  }

  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-12 text-center">İletişim</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>İletişim Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">SARIMEŞE DANIŞMANLIK</h3>
                  <p className="text-sm text-muted-foreground">EĞİTİM VE BİLİŞİM TEKNOLOJİLERİ SANAYİ TİCARET LTD ŞTİ</p>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <p className="text-sm">KOZYATAĞI MAH. BAYAR CAD. NO:86 KADIKÖY / İSTANBUL</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <p>0554 958 43 20</p>
                    <p>0216 606 12 78</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Google Maps */}
            <Card>
              <CardHeader>
                <CardTitle>Konum</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.9773458739987!2d29.079815076396985!3d40.97757387135804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cac7d441c0e0e1%3A0x3e7d8f5c5f5f5f5f!2zS296eWF0YcSfxLEsIEJheWFyIENkLiBObzo4NiwgMzQ3NDIgS2FkxLFrw7Z5L8Swc3RhbmJ1bA!5e0!3m2!1str!2str!4v1704963600000!5m2!1str!2str"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  ></iframe>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>İletişim Formu</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Ad Soyad *</Label>
                    <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <Label>Kurum Adı</Label>
                    <Input value={formData.schoolName} onChange={(e) => setFormData({...formData, schoolName: e.target.value})} />
                  </div>
                  <div>
                    <Label>Telefon *</Label>
                    <Input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <Label>Talep Türü</Label>
                    <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bilgi_almak">Bilgi almak istiyorum</SelectItem>
                        <SelectItem value="denetim_yaptirmak">Denetleme yapılmasını istiyorum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Gönder</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Login Page
function LoginPage({ setCurrentPage, setToken, setUser }) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    })
    const result = await response.json()
    if (result.token) {
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      setToken(result.token)
      setUser(result.user)
      sonnerToast.success('Giriş başarılı')
      setCurrentPage(result.user.role === 'admin' ? 'admin' : 'inspector')
    } else {
      sonnerToast.error(result.error || 'Giriş başarısız')
    }
  }

  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Giriş Yap</CardTitle>
            <CardDescription>Personel ve yönetici girişi</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label>Telefon</Label>
                <Input placeholder="05xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div>
                <Label>Şifre</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Giriş Yap</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Admin Panel (Basitleştirilmiş - tüm yönetim özellikleri burada)
function AdminPanel({ token }) {
  const [activeTab, setActiveTab] = useState('categories')

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Paneli</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-11 mb-6">
            <TabsTrigger value="dashboard">📊 Raporlama</TabsTrigger>
            <TabsTrigger value="categories">Kategoriler</TabsTrigger>
            <TabsTrigger value="questions">Sorular</TabsTrigger>
            <TabsTrigger value="staff">Personel</TabsTrigger>
            <TabsTrigger value="packages">Paketler</TabsTrigger>
            <TabsTrigger value="cities">İller</TabsTrigger>
            <TabsTrigger value="messages">Mesajlar</TabsTrigger>
            <TabsTrigger value="payments">Ödemeler</TabsTrigger>
            <TabsTrigger value="inspections">Denetimler</TabsTrigger>
            <TabsTrigger value="news">Haberler</TabsTrigger>
            <TabsTrigger value="assign">Atama</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard"><DashboardTab token={token} /></TabsContent>
          <TabsContent value="categories"><CategoriesTab token={token} /></TabsContent>
          <TabsContent value="questions"><QuestionsTab token={token} /></TabsContent>
          <TabsContent value="staff"><StaffTab token={token} /></TabsContent>
          <TabsContent value="packages"><PackagesTab token={token} /></TabsContent>
          <TabsContent value="cities"><CitiesTab token={token} /></TabsContent>
          <TabsContent value="messages"><MessagesTab token={token} /></TabsContent>
          <TabsContent value="payments"><PaymentsTab token={token} /></TabsContent>
          <TabsContent value="inspections"><InspectionsTab token={token} /></TabsContent>
          <TabsContent value="news"><NewsManagementTab token={token} /></TabsContent>
          <TabsContent value="assign"><InspectionAssignmentTab token={token} /></TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Dashboard Tab - Raporlama ve İstatistikler
function DashboardTab({ token }) {
  const [period, setPeriod] = useState('1m')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exportDateRange, setExportDateRange] = useState({ start: '', end: '' })
  const [exportData, setExportData] = useState(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadStats()
  }, [period])

  const loadStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/stats?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      sonnerToast.error('İstatistikler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const exportPDF = async () => {
    if (!exportDateRange.start || !exportDateRange.end) {
      sonnerToast.error('Tarih aralığı seçin')
      return
    }
    
    setExporting(true)
    try {
      const response = await fetch(
        `/api/admin/inspections/export?startDate=${exportDateRange.start}&endDate=${exportDateRange.end}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await response.json()
      
      // Generate PDF
      const html2pdf = (await import('html2pdf.js')).default
      
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <style>
            * { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            body { padding: 20px; color: #333; font-size: 11px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
            .header h1 { color: #1e40af; margin: 0 0 5px 0; font-size: 20px; }
            .header p { margin: 3px 0; color: #666; font-size: 10px; }
            .date-range { background: #f0f9ff; padding: 10px; border-radius: 6px; margin-bottom: 20px; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #1e40af; color: white; padding: 10px 8px; text-align: left; font-size: 10px; }
            td { padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
            tr:nth-child(even) { background: #f9fafb; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 9px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DENETİM LİSTESİ RAPORU</h1>
            <p><strong>SARIMEŞE DANIŞMANLIK</strong></p>
            <p>Eğitim ve Bilişim Teknolojileri Sanayi Ticaret Ltd. Şti.</p>
          </div>
          
          <div class="date-range">
            <strong>Tarih Aralığı:</strong> ${new Date(exportDateRange.start).toLocaleDateString('tr-TR')} - ${new Date(exportDateRange.end).toLocaleDateString('tr-TR')}
            <br><strong>Toplam Kayıt:</strong> ${data.length}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Okul Adı</th>
                <th>Yetkili</th>
                <th>İl</th>
                <th>İlçe</th>
                <th>Telefon</th>
                <th>Paket</th>
                <th>Durum</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((insp, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${insp.schoolName}</td>
                  <td>${insp.contactName || '-'}</td>
                  <td>${insp.city?.name || '-'}</td>
                  <td>${insp.district || '-'}</td>
                  <td>${insp.phone || '-'}</td>
                  <td>${insp.package?.name || '-'}</td>
                  <td>${insp.status === 'completed' ? 'Tamamlandı' : insp.status === 'in_progress' ? 'Devam Ediyor' : 'Bekliyor'}</td>
                  <td>${new Date(insp.createdAt).toLocaleDateString('tr-TR')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Oluşturulma: ${new Date().toLocaleString('tr-TR')} | SARIMEŞE DANIŞMANLIK</p>
          </div>
        </body>
        </html>
      `
      
      const element = document.createElement('div')
      element.innerHTML = htmlContent
      document.body.appendChild(element)
      
      await html2pdf().set({
        margin: 10,
        filename: `denetim_listesi_${exportDateRange.start}_${exportDateRange.end}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      }).from(element).save()
      
      document.body.removeChild(element)
      sonnerToast.success('PDF rapor indirildi')
    } catch (error) {
      sonnerToast.error('Export hatası')
    } finally {
      setExporting(false)
    }
  }

  // Dynamic import for Recharts
  const [RechartsComponents, setRechartsComponents] = useState(null)
  
  useEffect(() => {
    import('recharts').then(module => {
      setRechartsComponents({
        LineChart: module.LineChart,
        Line: module.Line,
        XAxis: module.XAxis,
        YAxis: module.YAxis,
        CartesianGrid: module.CartesianGrid,
        Tooltip: module.Tooltip,
        Legend: module.Legend,
        ResponsiveContainer: module.ResponsiveContainer
      })
    })
  }, [])

  const periodOptions = [
    { value: '1m', label: 'Aylık' },
    { value: '3m', label: '3 Aylık' },
    { value: '6m', label: '6 Aylık' },
    { value: '1y', label: 'Yıllık' },
    { value: '2y', label: '2 Yıllık' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📊 Raporlama & İstatistikler</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Gelen Mesajlar</p>
                  <p className="text-4xl font-bold mt-2">{stats.totals.messages}</p>
                </div>
                <MessageSquare className="h-12 w-12 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Tamamlanan Denetimler</p>
                  <p className="text-4xl font-bold mt-2">{stats.totals.inspections}</p>
                </div>
                <ClipboardList className="h-12 w-12 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Toplam Ciro</p>
                  <p className="text-4xl font-bold mt-2">₺{stats.totals.revenue.toLocaleString('tr-TR')}</p>
                </div>
                <CreditCard className="h-12 w-12 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      {stats && RechartsComponents && (
        <Card>
          <CardHeader>
            <CardTitle>Zaman Bazlı Değişim</CardTitle>
            <CardDescription>Mesajlar, denetimler ve ciro trendi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <RechartsComponents.ResponsiveContainer width="100%" height="100%">
                <RechartsComponents.LineChart data={stats.chartData}>
                  <RechartsComponents.CartesianGrid strokeDasharray="3 3" />
                  <RechartsComponents.XAxis dataKey="month" />
                  <RechartsComponents.YAxis yAxisId="left" />
                  <RechartsComponents.YAxis yAxisId="right" orientation="right" />
                  <RechartsComponents.Tooltip />
                  <RechartsComponents.Legend />
                  <RechartsComponents.Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="mesajlar" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Mesajlar"
                  />
                  <RechartsComponents.Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="denetimler" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Denetimler"
                  />
                  <RechartsComponents.Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="ciro" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    name="Ciro (₺)"
                  />
                </RechartsComponents.LineChart>
              </RechartsComponents.ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>📥 Denetim Listesi PDF Export</CardTitle>
          <CardDescription>Belirli tarih aralığındaki denetimleri PDF olarak indirin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Başlangıç Tarihi</Label>
              <Input 
                type="date" 
                value={exportDateRange.start}
                onChange={(e) => setExportDateRange({ ...exportDateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Bitiş Tarihi</Label>
              <Input 
                type="date" 
                value={exportDateRange.end}
                onChange={(e) => setExportDateRange({ ...exportDateRange, end: e.target.value })}
              />
            </div>
            <Button onClick={exportPDF} disabled={exporting}>
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Hazırlanıyor...' : 'PDF İndir'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      )}
    </div>
  )
}

// Categories Tab
function CategoriesTab({ token }) {
  const [categories, setCategories] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({ name: '', order: 0 })

  const loadCategories = async () => {
    const response = await fetch('/api/admin/categories', {
      headers: { Authorization: `Bearer ${token}` }
    })
    setCategories(await response.json())
  }

  useEffect(() => { loadCategories() }, [])

  const handleSave = async () => {
    const url = editItem ? `/api/admin/categories/${editItem.id}` : '/api/admin/categories'
    const method = editItem ? 'PUT' : 'POST'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    })
    sonnerToast.success(editItem ? 'Güncellendi' : 'Eklendi')
    setShowDialog(false)
    setEditItem(null)
    setFormData({ name: '', order: 0 })
    loadCategories()
  }

  const handleDelete = async (id) => {
    if (!confirm('Silmek istediğinizden emin misiniz?')) return
    await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    sonnerToast.success('Silindi')
    loadCategories()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Kategoriler</h2>
        <Button onClick={() => { setEditItem(null); setFormData({ name: '', order: 0 }); setShowDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Yeni Kategori
        </Button>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kategori Adı</TableHead>
              <TableHead>Sıra</TableHead>
              <TableHead>Soru Sayısı</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map(cat => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell>{cat.order}</TableCell>
                <TableCell>{cat.questions?.length || 0}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditItem(cat); setFormData({ name: cat.name, order: cat.order }); setShowDialog(true); }}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Kategori Düzenle' : 'Yeni Kategori'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Kategori Adı</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <Label>Sıra</Label>
              <Input type="number" value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})} />
            </div>
            <Button onClick={handleSave} className="w-full">Kaydet</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Questions Tab (Basitleştirilmiş)
// Questions Tab - Tam CRUD
function QuestionsTab({ token }) {
  const [questions, setQuestions] = useState([])
  const [categories, setCategories] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [formData, setFormData] = useState({
    categoryId: '',
    question: '',
    regulationText: '',
    imageUrl: '',
    order: 0,
    penaltyType: 'none'
  })

  const loadQuestions = async () => {
    const response = await fetch('/api/admin/questions', {
      headers: { Authorization: `Bearer ${token}` }
    })
    setQuestions(await response.json())
  }

  useEffect(() => {
    fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setCategories)
    loadQuestions()
  }, [])

  const filteredQuestions = selectedCategory === 'all' 
    ? questions 
    : questions.filter(q => q.categoryId === selectedCategory)

  const handleSave = async () => {
    if (!formData.categoryId || !formData.question) {
      sonnerToast.error('Kategori ve soru zorunludur')
      return
    }
    
    if (!formData.categoryId) {
      sonnerToast.error('Lütfen bir kategori seçin')
      return
    }

    const url = editItem ? `/api/admin/questions/${editItem.id}` : '/api/admin/questions'
    const method = editItem ? 'PUT' : 'POST'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    })
    sonnerToast.success(editItem ? 'Güncellendi' : 'Eklendi')
    setShowDialog(false)
    setEditItem(null)
    setFormData({
      categoryId: '',
      question: '',
      regulationText: '',
      imageUrl: '',
      order: 0,
      penaltyType: 'none'
    })
    loadQuestions()
  }

  const handleDelete = async (id) => {
    if (!confirm('Silmek istediğinizden emin misiniz?')) return
    await fetch(`/api/admin/questions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    sonnerToast.success('Silindi')
    loadQuestions()
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setFormData({
      categoryId: item.categoryId,
      question: item.question,
      regulationText: item.regulationText || '',
      imageUrl: item.imageUrl || '',
      order: item.order || 0,
      penaltyType: item.penaltyType || 'none'
    })
    setShowDialog(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Denetim Soruları ({filteredQuestions.length})</h2>
        <div className="flex gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Kategori Seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => {
            setEditItem(null)
            setFormData({
              categoryId: '',
              question: '',
              regulationText: '',
              imageUrl: '',
              order: 0,
              penaltyType: ''
            })
            setShowDialog(true)
          }}>
            <Plus className="h-4 w-4 mr-2" /> Yeni Soru
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kategori</TableHead>
              <TableHead>Soru</TableHead>
              <TableHead>Ceza Türü</TableHead>
              <TableHead>Sıra</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map(q => (
              <TableRow key={q.id}>
                <TableCell>
                  <Badge variant="outline">{q.category?.name}</Badge>
                </TableCell>
                <TableCell className="max-w-md">
                  <p className="line-clamp-2">{q.question}</p>
                </TableCell>
                <TableCell>
                  {q.penaltyType && (
                    <Badge variant="destructive">{q.penaltyType}</Badge>
                  )}
                </TableCell>
                <TableCell>{q.order}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(q)}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(q.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Soru Düzenle' : 'Yeni Soru Ekle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Kategori *</Label>
              <Select value={formData.categoryId} onValueChange={(val) => setFormData({...formData, categoryId: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Denetim Sorusu *</Label>
              <Textarea 
                rows={3}
                value={formData.question} 
                onChange={(e) => setFormData({...formData, question: e.target.value})} 
                placeholder="Örn: Yangın söndürme tüplerinin periyodik kontrolleri yapılmış mı?"
              />
            </div>
            <div>
              <Label>Yönetmelik Açıklaması</Label>
              <Textarea 
                rows={3}
                value={formData.regulationText} 
                onChange={(e) => setFormData({...formData, regulationText: e.target.value})}
                placeholder="İlgili yönetmelik maddesini yazın"
              />
            </div>
            <div>
              <Label>Görsel URL</Label>
              <Input 
                value={formData.imageUrl} 
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label>Sıra Numarası</Label>
              <Input 
                type="number" 
                value={formData.order} 
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})} 
              />
            </div>
            <div>
              <Label>Ceza Gerekliliği</Label>
              <Select value={formData.penaltyType} onValueChange={(val) => setFormData({...formData, penaltyType: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Ceza türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok</SelectItem>
                  <SelectItem value="idari_para_cezasi">İdari Para Cezası</SelectItem>
                  <SelectItem value="uyarı">Uyarı</SelectItem>
                  <SelectItem value="kınama">Kınama</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full">Kaydet</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Staff Tab (Basitleştirilmiş)
// Staff Tab - Tam CRUD
function StaffTab({ token }) {
  const [staff, setStaff] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: ''
  })

  const loadStaff = async () => {
    const response = await fetch('/api/admin/staff', { headers: { Authorization: `Bearer ${token}` } })
    setStaff(await response.json())
  }

  useEffect(() => {
    loadStaff()
  }, [])

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      sonnerToast.error('Ad soyad ve telefon zorunludur')
      return
    }
    
    if (!editItem && !formData.password) {
      sonnerToast.error('Yeni personel için şifre zorunludur')
      return
    }

    const url = editItem ? `/api/admin/staff/${editItem.id}` : '/api/admin/staff'
    const method = editItem ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    })
    
    if (response.ok) {
      sonnerToast.success(editItem ? 'Personel güncellendi' : 'Personel eklendi')
      setShowDialog(false)
      setEditItem(null)
      setFormData({ name: '', phone: '', password: '' })
      loadStaff()
    } else {
      const error = await response.json()
      sonnerToast.error(error.error || 'Hata oluştu')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu personeli silmek istediğinizden emin misiniz?')) return
    await fetch(`/api/admin/staff/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    sonnerToast.success('Personel silindi')
    loadStaff()
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setFormData({
      name: item.name,
      phone: item.phone,
      password: ''
    })
    setShowDialog(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Denetim Personeli ({staff.length})</h2>
        <Button onClick={() => {
          setEditItem(null)
          setFormData({ name: '', phone: '', password: '' })
          setShowDialog(true)
        }}>
          <Plus className="h-4 w-4 mr-2" /> Yeni Personel
        </Button>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell>{new Date(s.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(s)}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Personel Düzenle' : 'Yeni Personel Ekle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ad Soyad *</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>
            <div>
              <Label>Telefon *</Label>
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="05xxxxxxxxx"
              />
            </div>
            <div>
              <Label>Şifre {editItem ? '(Değiştirmek için doldurun)' : '*'}</Label>
              <Input 
                type="password"
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder={editItem ? 'Boş bırakılırsa değişmez' : 'Şifre girin'}
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              {editItem ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Packages Tab (Basitleştirilmiş)
// Packages Tab - Tam CRUD
function PackagesTab({ token }) {
  const [packages, setPackages] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    features: [],
    active: true
  })
  const [featureInput, setFeatureInput] = useState('')

  const loadPackages = async () => {
    const response = await fetch('/api/admin/packages', { headers: { Authorization: `Bearer ${token}` } })
    setPackages(await response.json())
  }

  useEffect(() => {
    loadPackages()
  }, [])

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      sonnerToast.error('Paket adı ve fiyat zorunludur')
      return
    }

    const url = editItem ? `/api/admin/packages/${editItem.id}` : '/api/admin/packages'
    const method = editItem ? 'PUT' : 'POST'
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...formData,
        price: parseFloat(formData.price)
      })
    })
    
    sonnerToast.success(editItem ? 'Paket güncellendi' : 'Paket eklendi')
    setShowDialog(false)
    setEditItem(null)
    setFormData({ name: '', price: '', description: '', features: [], active: true })
    loadPackages()
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu paketi silmek istediğinizden emin misiniz?')) return
    await fetch(`/api/admin/packages/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    sonnerToast.success('Paket silindi')
    loadPackages()
  }

  const handleEdit = (item) => {
    setEditItem(item)
    const features = typeof item.features === 'string' ? JSON.parse(item.features || '[]') : item.features
    setFormData({
      name: item.name,
      price: item.price.toString(),
      description: item.description || '',
      features: features,
      active: item.active
    })
    setShowDialog(true)
  }

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      })
      setFeatureInput('')
    }
  }

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Paketler ({packages.length})</h2>
        <Button onClick={() => {
          setEditItem(null)
          setFormData({ name: '', price: '', description: '', features: [], active: true })
          setShowDialog(true)
        }}>
          <Plus className="h-4 w-4 mr-2" /> Yeni Paket
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map(pkg => {
          const features = typeof pkg.features === 'string' ? JSON.parse(pkg.features || '[]') : pkg.features
          return (
            <Card key={pkg.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{pkg.name}</CardTitle>
                    <CardDescription>{pkg.price.toLocaleString('tr-TR')} TL + KDV</CardDescription>
                  </div>
                  {pkg.active && <Badge>Aktif</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">{pkg.description}</p>
                <div className="space-y-1 mb-4">
                  {features.slice(0, 3).map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{feature}</span>
                    </div>
                  ))}
                  {features.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{features.length - 3} özellik daha</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(pkg)} className="flex-1">
                    <Edit2 className="h-3 w-3 mr-1" /> Düzenle
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(pkg.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Paket Düzenle' : 'Yeni Paket Ekle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Paket Adı *</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Örn: FULL DENETLEME"
              />
            </div>
            <div>
              <Label>Fiyat (KDV Hariç) *</Label>
              <Input 
                type="number"
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="20000"
              />
            </div>
            <div>
              <Label>Kısa Açıklama</Label>
              <Textarea 
                rows={2}
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Paket hakkında kısa bilgi"
              />
            </div>
            <div>
              <Label>Paket İçeriği</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input 
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    placeholder="Özellik girin ve Enter'a basın"
                  />
                  <Button type="button" onClick={addFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {formData.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 bg-muted p-2 rounded">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="flex-1 text-sm">{feature}</span>
                      <Button 
                        type="button"
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeFeature(i)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({...formData, active: e.target.checked})}
                className="h-4 w-4"
              />
              <Label htmlFor="active">Aktif (Web sitesinde göster)</Label>
            </div>
            <Button onClick={handleSave} className="w-full">
              {editItem ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Cities Tab - Tam CRUD
function CitiesTab({ token }) {
  const [cities, setCities] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    travelCost: 0,
    accommodationCost: 0
  })

  const loadCities = async () => {
    const response = await fetch('/api/admin/cities', { headers: { Authorization: `Bearer ${token}` } })
    setCities(await response.json())
  }

  useEffect(() => {
    loadCities()
  }, [])

  const handleSave = async () => {
    if (!formData.name) {
      sonnerToast.error('İl adı zorunludur')
      return
    }

    const url = editItem ? `/api/admin/cities/${editItem.id}` : '/api/admin/cities'
    const method = editItem ? 'PUT' : 'POST'
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        ...formData,
        travelCost: parseFloat(formData.travelCost),
        accommodationCost: parseFloat(formData.accommodationCost)
      })
    })
    
    sonnerToast.success(editItem ? 'İl güncellendi' : 'İl eklendi')
    setShowDialog(false)
    setEditItem(null)
    setFormData({ name: '', travelCost: 0, accommodationCost: 0 })
    loadCities()
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu ili silmek istediğinizden emin misiniz?')) return
    await fetch(`/api/admin/cities/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    sonnerToast.success('İl silindi')
    loadCities()
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setFormData({
      name: item.name,
      travelCost: item.travelCost,
      accommodationCost: item.accommodationCost
    })
    setShowDialog(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">İller ({cities.length})</h2>
        <Button onClick={() => {
          setEditItem(null)
          setFormData({ name: '', travelCost: 0, accommodationCost: 0 })
          setShowDialog(true)
        }}>
          <Plus className="h-4 w-4 mr-2" /> Yeni İl
        </Button>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İl</TableHead>
              <TableHead>Yol Ücreti</TableHead>
              <TableHead>Konaklama Ücreti</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cities.map(city => (
              <TableRow key={city.id}>
                <TableCell className="font-medium">{city.name}</TableCell>
                <TableCell>{city.travelCost.toLocaleString('tr-TR')} TL</TableCell>
                <TableCell>{city.accommodationCost.toLocaleString('tr-TR')} TL</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(city)}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(city.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'İl Düzenle' : 'Yeni İl Ekle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>İl Adı *</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Örn: İstanbul"
              />
            </div>
            <div>
              <Label>Yol Ücreti (TL)</Label>
              <Input 
                type="number"
                value={formData.travelCost} 
                onChange={(e) => setFormData({...formData, travelCost: e.target.value})}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Konaklama Ücreti (TL)</Label>
              <Input 
                type="number"
                value={formData.accommodationCost} 
                onChange={(e) => setFormData({...formData, accommodationCost: e.target.value})}
                placeholder="0"
              />
            </div>
            <Button onClick={handleSave} className="w-full">
              {editItem ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Messages Tab - CRM Sistemi
function MessagesTab({ token }) {
  const [messages, setMessages] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showDialog, setShowDialog] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState('')
  const [noteUpdate, setNoteUpdate] = useState('')

  const loadMessages = async () => {
    const url = filterStatus === 'all' 
      ? '/api/admin/messages' 
      : `/api/admin/messages?status=${filterStatus}`
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    setMessages(await response.json())
  }

  useEffect(() => {
    loadMessages()
  }, [filterStatus])

  const handleUpdateStatus = async () => {
    await fetch(`/api/admin/messages/${selectedMessage.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: statusUpdate, note: noteUpdate })
    })
    sonnerToast.success('Durum güncellendi')
    setShowDialog(false)
    loadMessages()
  }

  const openDialog = (msg) => {
    setSelectedMessage(msg)
    setStatusUpdate(msg.status)
    setNoteUpdate(msg.note || '')
    setShowDialog(true)
  }

  const statusColors = {
    'new': 'bg-blue-100 text-blue-800',
    'contacted': 'bg-yellow-100 text-yellow-800',
    'positive': 'bg-green-100 text-green-800',
    'negative': 'bg-red-100 text-red-800',
    'wrong': 'bg-gray-100 text-gray-800'
  }

  const statusLabels = {
    'new': 'Yeni',
    'contacted': 'Görüşüldü',
    'positive': 'Olumlu',
    'negative': 'Olumsuz',
    'wrong': 'Yanlış Mesaj'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Mesajlar ({messages.length})</h2>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="new">Yeni</SelectItem>
            <SelectItem value="contacted">Görüşüldü</SelectItem>
            <SelectItem value="positive">Olumlu</SelectItem>
            <SelectItem value="negative">Olumsuz</SelectItem>
            <SelectItem value="wrong">Yanlış Mesaj</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>Kurum</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Tür</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map(msg => (
              <TableRow key={msg.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDialog(msg)}>
                <TableCell className="font-medium">{msg.name}</TableCell>
                <TableCell>{msg.schoolName || '-'}</TableCell>
                <TableCell>
                  <a href={`tel:${msg.phone}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                    {msg.phone}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {msg.type === 'bilgi_almak' ? 'Bilgi' : 'Denetim'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[msg.status]}>
                    {statusLabels[msg.status]}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(msg.createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDialog(msg); }}>
                    <Eye className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mesaj Detayı</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Ad Soyad</Label>
                <p>{selectedMessage.name}</p>
              </div>
              {selectedMessage.schoolName && (
                <div>
                  <Label className="text-sm font-semibold">Kurum</Label>
                  <p>{selectedMessage.schoolName}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-semibold">Telefon</Label>
                <p>
                  <a href={`tel:${selectedMessage.phone}`} className="text-primary hover:underline">
                    {selectedMessage.phone}
                  </a>
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Talep Türü</Label>
                <p>{selectedMessage.type === 'bilgi_almak' ? 'Bilgi Almak' : 'Denetim Yaptırmak'}</p>
              </div>
              <div>
                <Label>Durum</Label>
                <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Yeni</SelectItem>
                    <SelectItem value="contacted">Görüşüldü</SelectItem>
                    <SelectItem value="positive">Olumlu</SelectItem>
                    <SelectItem value="negative">Olumsuz</SelectItem>
                    <SelectItem value="wrong">Yanlış Mesaj</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Not</Label>
                <Textarea 
                  value={noteUpdate}
                  onChange={(e) => setNoteUpdate(e.target.value)}
                  rows={3}
                  placeholder="Görüşme notları..."
                />
              </div>
              <Button onClick={handleUpdateStatus} className="w-full">
                Kaydet
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Payments Tab
function PaymentsTab({ token }) {
  const [payments, setPayments] = useState([])

  useEffect(() => {
    fetch('/api/admin/payments', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setPayments)
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Ödemeler ({payments.length})</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Okul</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>İl</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map(payment => (
              <TableRow key={payment.id}>
                <TableCell>{payment.schoolName}</TableCell>
                <TableCell>{payment.package?.name}</TableCell>
                <TableCell>{payment.city?.name}</TableCell>
                <TableCell>{payment.amount.toLocaleString('tr-TR')} TL</TableCell>
                <TableCell>
                  {payment.status === 'completed' ? (
                    <span className="text-green-600 font-medium">Tamamlandı</span>
                  ) : (
                    <span className="text-yellow-600">Bekliyor</span>
                  )}
                </TableCell>
                <TableCell>{new Date(payment.createdAt).toLocaleDateString('tr-TR')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

// Inspections Tab
// News Management Tab - Haber Yönetimi
function NewsManagementTab({ token }) {
  const [news, setNews] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    keywords: '',
    published: true
  })

  const loadNews = async () => {
    const response = await fetch('/api/admin/news', { headers: { Authorization: `Bearer ${token}` } })
    setNews(await response.json())
  }

  useEffect(() => {
    loadNews()
  }, [])

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      sonnerToast.error('Başlık ve içerik zorunludur')
      return
    }

    const url = editItem ? `/api/admin/news/${editItem.id}` : '/api/admin/news'
    const method = editItem ? 'PUT' : 'POST'
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    })
    
    sonnerToast.success(editItem ? 'Haber güncellendi' : 'Haber eklendi')
    setShowDialog(false)
    setEditItem(null)
    setFormData({ title: '', content: '', imageUrl: '', keywords: '', published: true })
    loadNews()
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu haberi silmek istediğinizden emin misiniz?')) return
    await fetch(`/api/admin/news/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    sonnerToast.success('Haber silindi')
    loadNews()
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setFormData({
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl || '',
      keywords: item.keywords || '',
      published: item.published
    })
    setShowDialog(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Haberler ({news.length})</h2>
        <Button onClick={() => {
          setEditItem(null)
          setFormData({ title: '', content: '', imageUrl: '', keywords: '', published: true })
          setShowDialog(true)
        }}>
          <Plus className="h-4 w-4 mr-2" /> Yeni Haber
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map(item => (
          <Card key={item.id}>
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded-t-lg" />
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                {item.published && <Badge>Yayında</Badge>}
              </div>
              <CardDescription>
                {new Date(item.createdAt).toLocaleDateString('tr-TR')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{item.content}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="flex-1">
                  <Edit2 className="h-3 w-3 mr-1" /> Düzenle
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Haber Düzenle' : 'Yeni Haber Ekle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Başlık *</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Haber başlığı"
              />
            </div>
            <div>
              <Label>İçerik *</Label>
              <Textarea 
                rows={8}
                value={formData.content} 
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Haber içeriği..."
              />
            </div>
            <div>
              <Label>Görsel URL</Label>
              <Input 
                value={formData.imageUrl} 
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label>SEO Anahtar Kelimeleri</Label>
              <Input 
                value={formData.keywords} 
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                placeholder="meb, denetim, yangın (virgülle ayırın)"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({...formData, published: e.target.checked})}
                className="h-4 w-4"
              />
              <Label htmlFor="published">Yayınla (Web sitesinde göster)</Label>
            </div>
            <Button onClick={handleSave} className="w-full">
              {editItem ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Inspection Assignment Tab - Denetim Atama
function InspectionAssignmentTab({ token }) {
  const [staff, setStaff] = useState([])
  const [packages, setPackages] = useState([])
  const [cities, setCities] = useState([])
  const [formData, setFormData] = useState({
    schoolName: '',
    cityId: '',
    district: '',
    packageId: '',
    inspectorId: '',
    schoolContact: '',
    schoolPhone: '',
    schoolEmail: '',
    capacity: ''
  })

  useEffect(() => {
    fetch('/api/admin/staff', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setStaff)
    fetch('/api/admin/packages', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setPackages)
    fetch('/api/admin/cities', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setCities)
  }, [])

  const handleAssign = async () => {
    if (!formData.schoolName || !formData.cityId || !formData.packageId || !formData.inspectorId) {
      sonnerToast.error('Okul adı, il, paket ve danışman seçimi zorunludur')
      return
    }

    // Create mock payment and inspection
    const paymentResponse = await fetch('/api/payment/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schoolName: formData.schoolName,
        cityId: formData.cityId,
        district: formData.district,
        packageId: formData.packageId,
        contactName: formData.schoolContact,
        contactPhone: formData.schoolPhone,
        contactEmail: formData.schoolEmail,
        amount: packages.find(p => p.id === formData.packageId)?.price || 0
      })
    })

    const paymentData = await paymentResponse.json()

    if (paymentData.success) {
      // Assign inspector to the inspection
      await fetch(`/api/admin/inspections/${paymentData.inspection.id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ inspectorId: formData.inspectorId })
      })

      sonnerToast.success('Denetim oluşturuldu ve danışmana atandı!')
      setFormData({
        schoolName: '',
        cityId: '',
        district: '',
        packageId: '',
        inspectorId: '',
        schoolContact: '',
        schoolPhone: '',
        schoolEmail: '',
        capacity: ''
      })
    } else {
      sonnerToast.error('Denetim oluşturulamadı')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Denetim Atama</h2>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Yeni Denetim Oluştur ve Danışman Ata</CardTitle>
          <CardDescription>Kurum bilgilerini girin ve danışman atayın</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Okul Adı *</Label>
            <Input 
              value={formData.schoolName}
              onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
              placeholder="Örn: Mutlu Çocuklar Anaokulu"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>İl *</Label>
              <Select value={formData.cityId} onValueChange={(val) => setFormData({...formData, cityId: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="İl seçin" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>İlçe</Label>
              <Input 
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
                placeholder="İlçe"
              />
            </div>
          </div>
          <div>
            <Label>Paket *</Label>
            <Select value={formData.packageId} onValueChange={(val) => setFormData({...formData, packageId: val})}>
              <SelectTrigger>
                <SelectValue placeholder="Paket seçin" />
              </SelectTrigger>
              <SelectContent>
                {packages.map(pkg => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.name} ({pkg.price.toLocaleString('tr-TR')} TL)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Danışman (Denetçi) *</Label>
            <Select value={formData.inspectorId} onValueChange={(val) => setFormData({...formData, inspectorId: val})}>
              <SelectTrigger>
                <SelectValue placeholder="Danışman seçin" />
              </SelectTrigger>
              <SelectContent>
                {staff.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.phone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Yetkili Bilgileri (Opsiyonel)</h4>
            <div className="space-y-3">
              <Input 
                value={formData.schoolContact}
                onChange={(e) => setFormData({...formData, schoolContact: e.target.value})}
                placeholder="Yetkili Ad Soyad"
              />
              <Input 
                value={formData.schoolPhone}
                onChange={(e) => setFormData({...formData, schoolPhone: e.target.value})}
                placeholder="Telefon"
              />
              <Input 
                value={formData.schoolEmail}
                onChange={(e) => setFormData({...formData, schoolEmail: e.target.value})}
                placeholder="E-posta"
              />
              <Input 
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                placeholder="Kontenjan"
              />
            </div>
          </div>
          <Button onClick={handleAssign} className="w-full" size="lg">
            Denetim Oluştur ve Danışmana Ata
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Inspections Tab - Tam Raporlama, Düzenleme ve PDF
function InspectionsTab({ token }) {
  const [inspections, setInspections] = useState([])
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [fullReportData, setFullReportData] = useState(null)
  const [editingAnswer, setEditingAnswer] = useState(null)
  const [editNote, setEditNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadInspections()
  }, [])

  const loadInspections = async () => {
    const response = await fetch('/api/admin/inspections', { 
      headers: { Authorization: `Bearer ${token}` } 
    })
    setInspections(await response.json())
  }

  const viewReport = async (inspection) => {
    const response = await fetch(`/api/admin/inspection/${inspection.id}/report`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    setFullReportData(data)
    setSelectedInspection(inspection)
    setShowDetailDialog(true)
  }

  const startEditNote = (answer) => {
    setEditingAnswer(answer)
    setEditNote(answer.note || '')
    setShowEditDialog(true)
  }

  const saveNote = async () => {
    if (!editingAnswer) return
    setSavingNote(true)
    try {
      await fetch(`/api/admin/inspection/${selectedInspection.id}/answer/${editingAnswer.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ note: editNote })
      })
      
      // Update local state
      setFullReportData(prev => ({
        ...prev,
        inspection: {
          ...prev.inspection,
          answers: prev.inspection.answers.map(a => 
            a.id === editingAnswer.id ? { ...a, note: editNote } : a
          )
        }
      }))
      
      sonnerToast.success('Not güncellendi')
      setShowEditDialog(false)
      setEditingAnswer(null)
    } catch (error) {
      sonnerToast.error('Güncelleme hatası')
    } finally {
      setSavingNote(false)
    }
  }

  // Türkçe karakterleri koruyarak PDF oluştur
  const downloadPDF = async () => {
    if (!fullReportData) return
    setGeneratingPDF(true)
    
    try {
      const html2pdf = (await import('html2pdf.js')).default
      
      const inspection = fullReportData.inspection
      
      // Tarih formatlama
      const reportDate = new Date(inspection.completedAt || inspection.createdAt)
      const formattedDate = reportDate.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      
      const issueAnswers = (inspection.answers || []).filter(a => a.answer !== 'uygun')
      
      // HTML içeriği oluştur
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <style>
            * { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            body { padding: 20px; color: #333; font-size: 12px; line-height: 1.5; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
            .header h1 { color: #1e40af; margin: 0 0 5px 0; font-size: 22px; }
            .header p { margin: 3px 0; color: #666; font-size: 11px; }
            .info-box { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .info-box h3 { margin: 0 0 10px 0; color: #1e40af; font-size: 14px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            .info-item { font-size: 11px; }
            .info-item strong { color: #1e40af; }
            .intro-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b; }
            .intro-box p { margin: 0 0 10px 0; font-size: 11px; }
            .intro-box .support { color: #92400e; font-style: italic; }
            .section-title { color: #dc2626; font-size: 16px; font-weight: bold; margin: 20px 0 15px 0; }
            .issue-card { background: #fff; border: 1px solid #e5e7eb; border-left: 4px solid #dc2626; border-radius: 8px; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
            .issue-title { color: #dc2626; font-weight: bold; font-size: 13px; margin-bottom: 10px; }
            .issue-number { background: #fee2e2; color: #dc2626; border-radius: 50%; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; margin-right: 8px; }
            .regulation-box { background: #eff6ff; padding: 10px; border-radius: 6px; margin: 10px 0; font-size: 11px; }
            .regulation-box strong { color: #1e40af; }
            .note-box { background: #f3f4f6; padding: 10px; border-radius: 6px; margin: 10px 0; font-size: 11px; }
            .penalty-box { background: #fef2f2; border: 1px solid #fecaca; padding: 8px 12px; border-radius: 6px; margin-top: 10px; font-size: 11px; }
            .penalty-box strong { color: #991b1b; }
            .success-box { background: #dcfce7; padding: 30px; border-radius: 8px; text-align: center; color: #166534; }
            .success-box h3 { margin: 0; font-size: 16px; }
            .legal-box { background: #fefce8; border: 1px solid #fde047; padding: 15px; border-radius: 8px; margin-top: 25px; font-size: 10px; }
            .legal-box strong { color: #854d0e; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 9px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DENETİM RAPORU</h1>
            <p><strong>SARIMEŞE DANIŞMANLIK</strong></p>
            <p>Eğitim ve Bilişim Teknolojileri Sanayi Ticaret Ltd. Şti.</p>
          </div>
          
          <div class="info-box">
            <h3>KURUM BİLGİLERİ</h3>
            <div class="info-grid">
              <div class="info-item"><strong>Okul Adı:</strong> ${inspection.schoolName}</div>
              <div class="info-item"><strong>İl / İlçe:</strong> ${inspection.city?.name || ''} / ${inspection.district || ''}</div>
              <div class="info-item"><strong>Paket:</strong> ${inspection.package?.name || ''}</div>
              <div class="info-item"><strong>Danışman:</strong> ${inspection.inspector?.name || 'Belirtilmemiş'}</div>
              <div class="info-item"><strong>Rapor Tarihi:</strong> ${formattedDate}</div>
            </div>
          </div>
          
          <div class="intro-box">
            <p><strong>${formattedDate}</strong> tarihinde <strong>${inspection.schoolName}</strong> kurumu yetkilisi <strong>${inspection.schoolContact || 'kurum yetkilisi'}</strong> talebi üzerine yapılan özel denetleme hizmetimiz çerçevesinde aşağıda belirtilen detaylar tespit edilmiştir.</p>
            <p class="support">Eksiklerin en kısa sürede giderilmesi noktasında danışmanlık almak isterseniz sizlere destek olmaktan mutluluk duyarız.</p>
          </div>
          
          ${issueAnswers.length > 0 ? `
            <div class="section-title">TESPİT EDİLEN EKSİKLER</div>
            ${issueAnswers.map((answer, index) => `
              <div class="issue-card">
                <div class="issue-title">
                  <span class="issue-number">${index + 1}</span>
                  ${answer.question?.question || ''}
                </div>
                ${answer.question?.regulationText ? `
                  <div class="regulation-box">
                    <strong>📜 Yönetmelik:</strong><br/>
                    ${answer.question.regulationText}
                  </div>
                ` : ''}
                ${answer.note ? `
                  <div class="note-box">
                    <strong>🗒️ Not:</strong><br/>
                    ${answer.note}
                  </div>
                ` : ''}
                ${answer.question?.penaltyType ? `
                  <div class="penalty-box">
                    <strong>Ceza:</strong> ${answer.question.penaltyType}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          ` : `
            <div class="success-box">
              <h3>✅ Tüm kontroller uygun bulunmuştur!</h3>
            </div>
          `}
          
          <div class="legal-box">
            <strong>⚠️ HUKUKİ UYARI:</strong>
            <p style="margin: 8px 0 0 0;">Bu rapor yalnızca öneri niteliğindedir ve kurumun yasal sorumluluklarını ortadan kaldırmaz. Raporun yasal bir değeri bulunmamaktadır. Sadece bilgilendirme amaçlıdır.</p>
            <p style="margin: 8px 0 0 0;"><strong>SARIMEŞE DANIŞMANLIK</strong></p>
          </div>
          
          <div class="footer">
            <p>Oluşturulma: ${new Date().toLocaleString('tr-TR')} | SARIMEŞE DANIŞMANLIK</p>
          </div>
        </body>
        </html>
      `
      
      // HTML'den PDF oluştur
      const element = document.createElement('div')
      element.innerHTML = htmlContent
      document.body.appendChild(element)
      
      const opt = {
        margin: 10,
        filename: `denetim_raporu_${inspection.schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      
      await html2pdf().set(opt).from(element).save()
      
      document.body.removeChild(element)
      sonnerToast.success('PDF rapor indirildi')
    } catch (error) {
      console.error('PDF Error:', error)
      sonnerToast.error('PDF oluşturma hatası')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const filteredInspections = filterStatus === 'all' 
    ? inspections 
    : inspections.filter(i => i.status === filterStatus)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Denetimler ({inspections.length})</h2>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Durum Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="pending">Bekleyenler</SelectItem>
            <SelectItem value="in_progress">Devam Edenler</SelectItem>
            <SelectItem value="completed">Tamamlananlar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Okul</TableHead>
              <TableHead>İl/İlçe</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Danışman</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInspections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {filterStatus === 'all' ? 'Henüz denetim yok' : 'Bu durumda denetim yok'}
                </TableCell>
              </TableRow>
            ) : (
              filteredInspections.map(insp => (
                <TableRow key={insp.id}>
                  <TableCell className="font-medium">{insp.schoolName}</TableCell>
                  <TableCell>{insp.city?.name} / {insp.district}</TableCell>
                  <TableCell>{insp.package?.name}</TableCell>
                  <TableCell>{insp.inspector?.name || <span className="text-muted-foreground">Atanmadı</span>}</TableCell>
                  <TableCell>
                    {insp.status === 'completed' ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Tamamlandı
                      </Badge>
                    ) : insp.status === 'in_progress' ? (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3 mr-1" /> Devam Ediyor
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" /> Bekliyor
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(insp.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {insp.status === 'completed' ? (
                      <Button size="sm" variant="default" onClick={() => viewReport(insp)}>
                        <Eye className="h-3 w-3 mr-1" /> Rapor
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        <Clock className="h-3 w-3 mr-1" /> Bekliyor
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Report Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Denetim Raporu</DialogTitle>
            <DialogDescription>
              {selectedInspection?.schoolName} - {fullReportData?.generatedAt}
            </DialogDescription>
          </DialogHeader>
          
          {fullReportData && (
            <div className="space-y-6">
              {/* Kurum Bilgileri */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Kurum Bilgileri</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Okul:</span> <strong>{fullReportData.inspection.schoolName}</strong></div>
                  <div><span className="text-muted-foreground">İl / İlçe:</span> <strong>{fullReportData.inspection.city?.name} / {fullReportData.inspection.district}</strong></div>
                  <div><span className="text-muted-foreground">Paket:</span> <strong>{fullReportData.inspection.package?.name}</strong></div>
                  <div><span className="text-muted-foreground">Danışman:</span> <strong>{fullReportData.inspection.inspector?.name || 'Belirtilmemiş'}</strong></div>
                  <div><span className="text-muted-foreground">Rapor Tarihi:</span> <strong>{fullReportData.generatedAt}</strong></div>
                </div>
              </div>

              {/* Giriş Metni - Highlight Box */}
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg">
                <p className="text-sm leading-relaxed">
                  <strong>{fullReportData.generatedAt}</strong> tarihinde <strong>{fullReportData.inspection.schoolName}</strong> kurumu yetkilisi{' '}
                  <strong>{fullReportData.inspection.schoolContact || 'kurum yetkilisi'}</strong> talebi üzerine yapılan özel denetleme hizmetimiz 
                  çerçevesinde aşağıda belirtilen detaylar tespit edilmiştir.
                </p>
                <p className="text-sm mt-3 text-amber-800">
                  Eksiklerin en kısa sürede giderilmesi noktasında danışmanlık almak isterseniz sizlere destek olmaktan mutluluk duyarız.
                </p>
              </div>

              {/* Tespit Edilen Eksikler */}
              <div>
                <h3 className="font-bold text-lg mb-4 text-red-800">Tespit Edilen Eksikler</h3>
                {fullReportData.inspection.answers?.filter(a => a.answer !== 'uygun').length === 0 ? (
                  <Card className="p-8 text-center bg-green-50">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <p className="text-lg font-semibold text-green-700">Tüm kontroller uygun bulunmuştur! 🎉</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {fullReportData.inspection.answers?.filter(a => a.answer !== 'uygun').map((answer, index) => (
                      <Card key={answer.id} className="overflow-hidden border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Kırmızı Başlık */}
                            <div className="flex items-start justify-between gap-4">
                              <h4 className="font-bold text-red-700 text-base flex items-center gap-2">
                                <span className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">{index + 1}</span>
                                {answer.question?.question}
                              </h4>
                              <Button size="sm" variant="ghost" onClick={() => startEditNote(answer)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {/* Yönetmelik */}
                            {answer.question?.regulationText && (
                              <div className="flex items-start gap-2 bg-blue-50 p-3 rounded text-sm">
                                <span className="text-blue-600">📜</span>
                                <div>
                                  <strong className="text-blue-900">Yönetmelik:</strong>
                                  <p className="text-blue-800 mt-1">{answer.question.regulationText}</p>
                                </div>
                              </div>
                            )}
                            
                            {/* Not */}
                            {answer.note && (
                              <div className="flex items-start gap-2 bg-gray-50 p-3 rounded text-sm">
                                <span>🗒️</span>
                                <div>
                                  <strong>Not:</strong>
                                  <p className="mt-1">{answer.note}</p>
                                </div>
                              </div>
                            )}
                            
                            {/* Ceza */}
                            {answer.question?.penaltyType && (
                              <div className="bg-red-50 border border-red-200 p-3 rounded text-sm">
                                <strong className="text-red-900">Ceza:</strong>
                                <span className="text-red-800 ml-2 capitalize">{answer.question.penaltyType}</span>
                              </div>
                            )}
                            
                            {/* Fotoğraflar */}
                            {answer.photos && JSON.parse(answer.photos || '[]').length > 0 && (
                              <div className="grid grid-cols-4 gap-2 mt-2">
                                {JSON.parse(answer.photos).map((photo, i) => (
                                  <img key={i} src={photo} alt={`Foto ${i + 1}`} className="w-full aspect-square object-cover rounded" />
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Hukuki Uyarı */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm">
                <strong>⚠️ HUKUKİ UYARI:</strong>
                <p className="mt-2">
                  Bu rapor yalnızca öneri niteliğindedir ve kurumun yasal sorumluluklarını ortadan kaldırmaz.
                  Raporun yasal bir değeri bulunmamaktadır. Sadece bilgilendirme amaçlıdır.
                </p>
                <p className="mt-2 font-semibold">{fullReportData.company}</p>
              </div>

              {/* PDF İndir Butonu */}
              <div className="flex gap-4">
                <Button onClick={downloadPDF} className="flex-1" size="lg" disabled={generatingPDF}>
                  {generatingPDF ? (
                    <>Oluşturuluyor...</>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" /> PDF Olarak İndir</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notu Düzenle</DialogTitle>
            <DialogDescription>
              {editingAnswer?.question?.question?.substring(0, 100)}...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Danışman Notu</Label>
              <Textarea 
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Eksiklik hakkında detaylı not yazın..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                İptal
              </Button>
              <Button onClick={saveNote} disabled={savingNote} className="flex-1">
                {savingNote ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
// Inspector Panel - Tablet Denetim Sistemi
function InspectorPanel({ token, user }) {
  const [view, setView] = useState('list') // list, detail, inspection
  const [inspections, setInspections] = useState([])
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [categories, setCategories] = useState([])
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [resumePosition, setResumePosition] = useState(null)

  useEffect(() => {
    loadInspections()
  }, [])

  const loadInspections = async () => {
    const response = await fetch('/api/inspector/inspections', { 
      headers: { Authorization: `Bearer ${token}` } 
    })
    setInspections(await response.json())
  }

  const startInspection = async (inspection, isResume = false) => {
    try {
      const response = await fetch('/api/inspector/inspection/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ inspectionId: inspection.id })
      })
      
      const data = await response.json()
      setSelectedInspection(data.inspection)
      setCategories(data.categories)
      
      // If resuming, load existing answers
      if (isResume && inspection.status === 'in_progress') {
        const answersResponse = await fetch(`/api/inspector/inspection/${inspection.id}/answers`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const answersData = await answersResponse.json()
        setAnswers(answersData.answers || {})
        
        // Find last answered position
        if (answersData.lastAnsweredQuestionId) {
          const position = findQuestionPosition(data.categories, answersData.lastAnsweredQuestionId)
          if (position) {
            setResumePosition(position)
          }
        }
      } else {
        setAnswers({})
        setResumePosition(null)
      }
      
      setCurrentCategoryIndex(0)
      setView('inspection')
      sonnerToast.success(isResume ? 'Denetime devam ediliyor' : 'Denetim başlatıldı')
    } catch (error) {
      sonnerToast.error('Hata oluştu')
    }
  }

  // Find question position in categories
  const findQuestionPosition = (cats, questionId) => {
    for (let catIdx = 0; catIdx < cats.length; catIdx++) {
      const questions = cats[catIdx].questions || []
      for (let qIdx = 0; qIdx < questions.length; qIdx++) {
        if (questions[qIdx].id === questionId) {
          return { categoryIndex: catIdx, questionIndex: qIdx }
        }
      }
    }
    return null
  }

  const saveAnswer = async (questionId, answer, note = '', photos = []) => {
    try {
      await fetch('/api/inspector/inspection/answer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          inspectionId: selectedInspection.id,
          questionId,
          answer,
          note,
          photos
        })
      })
      
      setAnswers({
        ...answers,
        [questionId]: { answer, note, photos }
      })
      
      sonnerToast.success('Cevap kaydedildi')
    } catch (error) {
      sonnerToast.error('Kaydetme hatası')
    }
  }

  const completeInspection = async () => {
    if (!confirm('Denetimi tamamlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return
    
    try {
      await fetch('/api/inspector/inspection/complete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ inspectionId: selectedInspection.id })
      })
      
      sonnerToast.success('Denetim tamamlandı!')
      setView('list')
      loadInspections()
    } catch (error) {
      sonnerToast.error('Hata oluştu')
    }
  }

  if (view === 'inspection' && selectedInspection && categories.length > 0) {
    return <InspectionFlow 
      inspection={selectedInspection}
      categories={categories}
      currentCategoryIndex={currentCategoryIndex}
      setCurrentCategoryIndex={setCurrentCategoryIndex}
      answers={answers}
      saveAnswer={saveAnswer}
      completeInspection={completeInspection}
      onCancel={() => setView('list')}
      token={token}
      resumePosition={resumePosition}
    />
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Denetim Paneli</h1>
          <p className="text-muted-foreground">Hoş geldiniz, {user.name}</p>
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Denetimlerim ({inspections.length})</h2>
        
        {inspections.length === 0 ? (
          <Card className="p-12 text-center">
            <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Henüz atanmış denetim yok</h3>
            <p className="text-muted-foreground">Yönetici size denetim atadığında buradan görebileceksiniz</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inspections.map(insp => (
              <Card key={insp.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{insp.schoolName}</CardTitle>
                      <CardDescription>{insp.city?.name} / {insp.district}</CardDescription>
                    </div>
                    {insp.status === 'completed' && (
                      <Badge variant="success" className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Tamamlandı
                      </Badge>
                    )}
                    {insp.status === 'in_progress' && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3 mr-1" /> Devam Ediyor
                      </Badge>
                    )}
                    {insp.status === 'pending' && (
                      <Badge variant="secondary">Bekliyor</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{insp.package?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(insp.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long', 
                        day: 'numeric'
                      })}</span>
                    </div>
                    
                    {insp.payment?.status === 'completed' ? (
                      <div className="pt-4 border-t">
                        {insp.status === 'pending' && (
                          <Button className="w-full" onClick={() => startInspection(insp, false)}>
                            <Zap className="h-4 w-4 mr-2" />
                            Denetimi Başlat
                          </Button>
                        )}
                        {insp.status === 'in_progress' && (
                          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => startInspection(insp, true)}>
                            <ChevronRight className="h-4 w-4 mr-2" />
                            Denetime Devam Et
                          </Button>
                        )}
                        {insp.status === 'completed' && (
                          <Button className="w-full" variant="outline" disabled>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Tamamlandı
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="pt-4 border-t">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-800 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Ödeme bekleniyor
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Inspection Flow Component
function InspectionFlow({ 
  inspection, 
  categories, 
  currentCategoryIndex, 
  setCurrentCategoryIndex,
  answers,
  saveAnswer,
  completeInspection,
  onCancel,
  token,
  resumePosition
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [localAnswer, setLocalAnswer] = useState('')
  const [localNote, setLocalNote] = useState('')
  const [localPhotos, setLocalPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [showFinishDialog, setShowFinishDialog] = useState(false)

  const currentCategory = categories[currentCategoryIndex]
  const currentQuestion = currentCategory?.questions[currentQuestionIndex]
  const totalQuestions = currentCategory?.questions.length || 0
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const isLastCategory = currentCategoryIndex === categories.length - 1

  // Resume from last position
  useEffect(() => {
    if (resumePosition) {
      setCurrentCategoryIndex(resumePosition.categoryIndex)
      // Go to next question after last answered
      const nextQIdx = resumePosition.questionIndex + 1
      const catQuestions = categories[resumePosition.categoryIndex]?.questions?.length || 0
      if (nextQIdx < catQuestions) {
        setCurrentQuestionIndex(nextQIdx)
      } else if (resumePosition.categoryIndex < categories.length - 1) {
        setCurrentCategoryIndex(resumePosition.categoryIndex + 1)
        setCurrentQuestionIndex(0)
      }
    }
  }, [resumePosition])

  useEffect(() => {
    if (currentQuestion) {
      const savedAnswer = answers[currentQuestion.id]
      setLocalAnswer(savedAnswer?.answer || '')
      setLocalNote(savedAnswer?.note || '')
      setLocalPhotos(savedAnswer?.photos || [])
    }
  }, [currentQuestion, answers])

  // Autosave when answer changes
  useEffect(() => {
    if (currentQuestion && localAnswer) {
      const timer = setTimeout(async () => {
        setAutoSaving(true)
        await saveAnswer(currentQuestion.id, localAnswer, localNote, localPhotos)
        setAutoSaving(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [localAnswer, localNote])

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('photo', file)

    try {
      const response = await fetch('/api/inspector/inspection/upload-photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const data = await response.json()
      setLocalPhotos([...localPhotos, data.url])
      sonnerToast.success('Fotoğraf yüklendi')
    } catch (error) {
      sonnerToast.error('Yükleme hatası')
    } finally {
      setUploading(false)
    }
  }

  const handleNext = async () => {
    if (!localAnswer) {
      sonnerToast.error('Lütfen bir cevap seçin')
      return
    }

    await saveAnswer(currentQuestion.id, localAnswer, localNote, localPhotos)

    if (isLastQuestion) {
      if (isLastCategory) {
        // Son soru, son kategori - "Denetimi Bitir" dialogu göster
        setShowFinishDialog(true)
      } else {
        // Sonraki kategoriye geç
        setCurrentCategoryIndex(currentCategoryIndex + 1)
        setCurrentQuestionIndex(0)
      }
    } else {
      // Sonraki soruya geç
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }

    // Reset local state
    setLocalAnswer('')
    setLocalNote('')
    setLocalPhotos([])
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1)
      setCurrentQuestionIndex(categories[currentCategoryIndex - 1].questions.length - 1)
    }
  }

  const handleFinishInspection = async () => {
    await completeInspection()
    setShowFinishDialog(false)
  }

  if (!currentQuestion) return null

  const progress = ((currentCategoryIndex * 100) + ((currentQuestionIndex + 1) / totalQuestions * 100)) / categories.length
  
  // Count answered questions
  const totalAllQuestions = categories.reduce((sum, cat) => sum + (cat.questions?.length || 0), 0)
  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">{inspection.schoolName}</h2>
              <p className="text-sm text-muted-foreground">{currentCategory.name}</p>
            </div>
            <div className="flex items-center gap-2">
              {autoSaving && (
                <span className="text-xs text-green-600 animate-pulse">💾 Kaydediliyor...</span>
              )}
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Soru {currentQuestionIndex + 1} / {totalQuestions}</span>
              <span>Kategori {currentCategoryIndex + 1} / {categories.length}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-center text-muted-foreground">
              Toplam ilerleme: {answeredCount} / {totalAllQuestions} soru cevaplandı
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Question */}
            <div>
              <h3 className="text-xl font-bold mb-2">{currentQuestion.question}</h3>
              {currentQuestion.regulationText && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Yönetmelik:</p>
                  <p className="text-sm text-blue-800">{currentQuestion.regulationText}</p>
                </div>
              )}
            </div>

            {/* Image */}
            {currentQuestion.imageUrl && (
              <img 
                src={currentQuestion.imageUrl} 
                alt="Soru görseli"
                className="w-full rounded-lg"
              />
            )}

            {/* Answer Options */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Cevabınız:</Label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'uygun', label: 'UYGUN', color: 'bg-green-50 border-green-500 text-green-900', icon: CheckCircle2 },
                  { value: 'uygun_degil', label: 'UYGUN DEĞİL', color: 'bg-red-50 border-red-500 text-red-900', icon: XCircle },
                  { value: 'goreceli', label: 'GÖRECELİ', color: 'bg-yellow-50 border-yellow-500 text-yellow-900', icon: AlertCircle }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setLocalAnswer(option.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
                      localAnswer === option.value 
                        ? `${option.color} border-opacity-100` 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <option.icon className="h-6 w-6" />
                    <span className="font-semibold text-lg">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <Label>Not (Opsiyonel)</Label>
              <Textarea 
                value={localNote}
                onChange={(e) => setLocalNote(e.target.value)}
                placeholder="Varsa ek açıklama yazın..."
                rows={3}
              />
            </div>

            {/* Photo Upload */}
            <div>
              <Label>Fotoğraf Ekle</Label>
              <div className="mt-2 space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    disabled={uploading}
                    onClick={() => document.getElementById('photo-upload').click()}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {uploading ? 'Yükleniyor...' : 'Fotoğraf Çek'}
                  </Button>
                </label>
                
                {localPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {localPhotos.map((photo, i) => (
                      <div key={i} className="relative aspect-square">
                        <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover rounded" />
                        <button
                          onClick={() => setLocalPhotos(localPhotos.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Penalty Info */}
            {currentQuestion.penaltyType && localAnswer === 'uygun_degil' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-900 mb-1">⚠️ Ceza Gerekliliği:</p>
                <p className="text-sm text-red-800">{currentQuestion.penaltyType}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4 mt-6">
          {(currentQuestionIndex > 0 || currentCategoryIndex > 0) && (
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              className="flex-1"
            >
              ← Önceki Soru
            </Button>
          )}
          {isLastQuestion && isLastCategory ? (
            <Button 
              onClick={() => {
                if (localAnswer) {
                  saveAnswer(currentQuestion.id, localAnswer, localNote, localPhotos)
                }
                setShowFinishDialog(true)
              }}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              DENETİMİ BİTİR
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!localAnswer}
              className="flex-1"
            >
              Sonraki Soru →
            </Button>
          )}
        </div>
      </div>

      {/* Finish Inspection Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Denetimi Tamamla
            </DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. Denetimi tamamladıktan sonra cevaplar düzenlenemez.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Özet</h4>
              <div className="text-sm space-y-1">
                <p>Kurum: <strong>{inspection.schoolName}</strong></p>
                <p>Cevaplanan Soru: <strong>{answeredCount} / {totalAllQuestions}</strong></p>
              </div>
            </div>
            
            {answeredCount < totalAllQuestions && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Dikkat: Bazı sorular henüz cevaplanmamış.
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowFinishDialog(false)} className="flex-1">
                Geri Dön
              </Button>
              <Button onClick={handleFinishInspection} className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Denetimi Tamamla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
