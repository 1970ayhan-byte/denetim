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
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <button onClick={() => setCurrentPage('home')} className="text-xl font-bold text-primary">
                SARIMEŞE DANIŞMANLIK
              </button>
              
              {!user && (
                <div className="hidden md:flex space-x-6">
                  <button onClick={() => setCurrentPage('home')} className="text-sm hover:text-primary">Anasayfa</button>
                  <button onClick={() => setCurrentPage('services')} className="text-sm hover:text-primary">Hizmetlerimiz</button>
                  <button onClick={() => setCurrentPage('packages')} className="text-sm hover:text-primary">Paketler</button>
                  <button onClick={() => setCurrentPage('news')} className="text-sm hover:text-primary">Bizden Haberler</button>
                  <button onClick={() => setCurrentPage('contact')} className="text-sm hover:text-primary">İletişim</button>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">SARIMEŞE DANIŞMANLIK</h3>
              <p className="text-sm text-muted-foreground">EĞİTİM VE BİLİŞİM TEKNOLOJİLERİ SANAYİ TİCARET LTD ŞTİ</p>
              <p className="text-sm text-muted-foreground mt-2">17 yıllık MEB danışmanlık tecrübesi</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">İletişim</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> 0554 958 43 20</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> 0216 606 12 78</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> KOZYATAĞI MAH. BAYAR CAD. NO:86 KADIKÖY / İSTANBUL</div>
              </div>
            </div>
            <div>
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
            { icon: BookOpen, title: 'e-Okul Kontrolü', desc: 'Öğrenci ve personel kayıtları' },
            { icon: Shield, title: 'Fiziki Şartlar', desc: 'Bina ve donanım uygunluğu' },
            { icon: AlertCircle, title: 'Yangın Yönetmeliği', desc: 'Yangın güvenlik sistemleri' },
            { icon: CheckCircle2, title: 'Tarım ve Hijyen', desc: 'Gıda ve sağlık kuralları' }
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
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-6">
            <TabsTrigger value="categories">Kategoriler</TabsTrigger>
            <TabsTrigger value="questions">Sorular</TabsTrigger>
            <TabsTrigger value="staff">Personel</TabsTrigger>
            <TabsTrigger value="packages">Paketler</TabsTrigger>
            <TabsTrigger value="cities">İller</TabsTrigger>
            <TabsTrigger value="messages">Mesajlar</TabsTrigger>
            <TabsTrigger value="payments">Ödemeler</TabsTrigger>
            <TabsTrigger value="inspections">Denetimler</TabsTrigger>
          </TabsList>
          <TabsContent value="categories"><CategoriesTab token={token} /></TabsContent>
          <TabsContent value="questions"><QuestionsTab token={token} /></TabsContent>
          <TabsContent value="staff"><StaffTab token={token} /></TabsContent>
          <TabsContent value="packages"><PackagesTab token={token} /></TabsContent>
          <TabsContent value="cities"><CitiesTab token={token} /></TabsContent>
          <TabsContent value="messages"><MessagesTab token={token} /></TabsContent>
          <TabsContent value="payments"><PaymentsTab token={token} /></TabsContent>
          <TabsContent value="inspections"><InspectionsTab token={token} /></TabsContent>
        </Tabs>
      </div>
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
    penaltyType: ''
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
      penaltyType: ''
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
      penaltyType: item.penaltyType || ''
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
                  <SelectItem value="">Yok</SelectItem>
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
// Inspections Tab - Raporlama ve PDF İndirme
function InspectionsTab({ token }) {
  const [inspections, setInspections] = useState([])
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [reportData, setReportData] = useState(null)

  useEffect(() => {
    fetch('/api/admin/inspections', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setInspections)
  }, [])

  const viewReport = async (inspection) => {
    const response = await fetch(`/api/admin/inspection/${inspection.id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    setReportData(data)
    setSelectedInspection(inspection)
    setShowDetailDialog(true)
  }

  const downloadPDF = () => {
    if (!reportData) return
    
    // Create PDF content
    let pdfContent = `
DENETIM RAPORU
=================

Rapor Tarihi: ${reportData.generatedAt}
Hazırlayan: ${reportData.company}

KURUM BİLGİLERİ:
- Okul Adı: ${reportData.inspection.schoolName}
- İl/İlçe: ${reportData.inspection.city.name} / ${reportData.inspection.district}
- Paket: ${reportData.inspection.package.name}

DENETIM SONUÇLARI:
==================

`
    
    reportData.inspection.answers.forEach((answer, index) => {
      pdfContent += `
${index + 1}. ${answer.question.category.name}
--------------------------------------
Soru: ${answer.question.question}
Cevap: ${answer.answer === 'uygun_degil' ? 'UYGUN DEĞİL' : 'GÖRECELİ'}
${answer.note ? `Not: ${answer.note}` : ''}
${answer.question.penaltyType ? `Ceza Gerekliliği: ${answer.question.penaltyType}` : ''}

`
    })

    pdfContent += `

HUKUKI UYARI:
=============
Bu rapor yalnızca öneri niteliğindedir ve kurumun yasal sorumluluklarını ortadan kaldırmaz.
Raporun yasal bir değeri bulunmamaktadır. Sadece bilgilendirme amaçlıdır.

SARIMEŞE DANIŞMANLIK
Eğitim ve Bilişim Teknolojileri Sanayi Ticaret Ltd. Şti.
`

    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `denetim_raporu_${reportData.inspection.schoolName}_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    sonnerToast.success('Rapor indirildi')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Denetimler ({inspections.length})</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Okul</TableHead>
              <TableHead>İl/İlçe</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Denetçi</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inspections.map(insp => (
              <TableRow key={insp.id}>
                <TableCell className="font-medium">{insp.schoolName}</TableCell>
                <TableCell>{insp.city?.name} / {insp.district}</TableCell>
                <TableCell>{insp.package?.name}</TableCell>
                <TableCell>{insp.inspector?.name || 'Atanmadı'}</TableCell>
                <TableCell>
                  {insp.status === 'completed' ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Tamamlandı
                    </Badge>
                  ) : insp.status === 'in_progress' ? (
                    <Badge variant="default">Devam Ediyor</Badge>
                  ) : (
                    <Badge variant="secondary">Bekliyor</Badge>
                  )}
                </TableCell>
                <TableCell>{new Date(insp.createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</TableCell>
                <TableCell className="text-right space-x-2">
                  {insp.status === 'completed' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => viewReport(insp)}>
                        <Eye className="h-3 w-3 mr-1" /> Rapor
                      </Button>
                      <Button size="sm" variant="default" onClick={() => viewReport(insp)}>
                        <Download className="h-3 w-3 mr-1" /> PDF
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Denetim Raporu</DialogTitle>
            <DialogDescription>
              {selectedInspection?.schoolName} - {reportData?.generatedAt}
            </DialogDescription>
          </DialogHeader>
          
          {reportData && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Kurum Bilgileri</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Okul: {reportData.inspection.schoolName}</div>
                  <div>İl/İlçe: {reportData.inspection.city.name} / {reportData.inspection.district}</div>
                  <div>Paket: {reportData.inspection.package.name}</div>
                  <div>Rapor Tarihi: {reportData.generatedAt}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Denetim Sonuçları (Uygun Değil ve Göreceli)</h3>
                {reportData.inspection.answers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Tüm kontroller uygun bulunmuştur. 🎉
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reportData.inspection.answers.map((answer, index) => (
                      <Card key={answer.id}>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <Badge variant="outline" className="mb-2">
                                  {answer.question.category.name}
                                </Badge>
                                <h4 className="font-semibold">{index + 1}. {answer.question.question}</h4>
                              </div>
                              <Badge className={answer.answer === 'uygun_degil' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                                {answer.answer === 'uygun_degil' ? 'UYGUN DEĞİL' : 'GÖRECELİ'}
                              </Badge>
                            </div>
                            {answer.note && (
                              <div className="bg-muted p-3 rounded text-sm">
                                <strong>Not:</strong> {answer.note}
                              </div>
                            )}
                            {answer.question.penaltyType && (
                              <div className="bg-red-50 border border-red-200 p-3 rounded text-sm">
                                <strong className="text-red-900">⚠️ Ceza Gerekliliği:</strong>
                                <span className="text-red-800 ml-2">{answer.question.penaltyType}</span>
                              </div>
                            )}
                            {answer.photos && JSON.parse(answer.photos || '[]').length > 0 && (
                              <div className="grid grid-cols-3 gap-2 mt-2">
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

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm">
                <strong>⚠️ HUKUKI UYARI:</strong>
                <p className="mt-2">
                  Bu rapor yalnızca öneri niteliğindedir ve kurumun yasal sorumluluklarını ortadan kaldırmaz.
                  Raporun yasal bir değeri bulunmamaktadır. Sadece bilgilendirme amaçlıdır.
                </p>
                <p className="mt-2 font-semibold">
                  {reportData.company}
                </p>
              </div>

              <Button onClick={downloadPDF} className="w-full" size="lg">
                <Download className="h-4 w-4 mr-2" />
                PDF Olarak İndir
              </Button>
            </div>
          )}
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

  useEffect(() => {
    loadInspections()
  }, [])

  const loadInspections = async () => {
    const response = await fetch('/api/inspector/inspections', { 
      headers: { Authorization: `Bearer ${token}` } 
    })
    setInspections(await response.json())
  }

  const startInspection = async (inspection) => {
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
      setCurrentCategoryIndex(0)
      setAnswers({})
      setView('inspection')
      sonnerToast.success('Denetim başlatıldı')
    } catch (error) {
      sonnerToast.error('Hata oluştu')
    }
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
    if (!confirm('Denetimi tamamlamak istediğinizden emin misiniz?')) return
    
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
                      <Badge variant="default">
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
                          <Button className="w-full" onClick={() => startInspection(insp)}>
                            <Zap className="h-4 w-4 mr-2" />
                            Denetimi Başlat
                          </Button>
                        )}
                        {insp.status === 'in_progress' && (
                          <Button className="w-full" variant="outline" onClick={() => startInspection(insp)}>
                            Denetim e Devam Et
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
  token
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [localAnswer, setLocalAnswer] = useState('')
  const [localNote, setLocalNote] = useState('')
  const [localPhotos, setLocalPhotos] = useState([])
  const [uploading, setUploading] = useState(false)

  const currentCategory = categories[currentCategoryIndex]
  const currentQuestion = currentCategory?.questions[currentQuestionIndex]
  const totalQuestions = currentCategory?.questions.length || 0
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const isLastCategory = currentCategoryIndex === categories.length - 1

  useEffect(() => {
    if (currentQuestion) {
      const savedAnswer = answers[currentQuestion.id]
      setLocalAnswer(savedAnswer?.answer || '')
      setLocalNote(savedAnswer?.note || '')
      setLocalPhotos(savedAnswer?.photos || [])
    }
  }, [currentQuestion, answers])

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
        // Son soru, son kategori - tamamla
        await completeInspection()
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

  if (!currentQuestion) return null

  const progress = ((currentCategoryIndex * 100) + ((currentQuestionIndex + 1) / totalQuestions * 100)) / categories.length

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
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
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
          <Button 
            onClick={handleNext}
            disabled={!localAnswer}
            className="flex-1"
          >
            {isLastQuestion && isLastCategory ? 'Denetimi Tamamla' : 'Sonraki Soru'} →
          </Button>
        </div>
      </div>
    </div>
  )
}
