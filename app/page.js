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
import { 
  CheckCircle2, XCircle, AlertCircle, Menu, X, Phone, Mail, MapPin,
  Shield, FileCheck, Building2, BookOpen, ChevronRight, LogOut,
  Users, Package, MapIcon, MessageSquare, CreditCard, ClipboardList,
  Settings, Plus, Edit2, Trash2, Eye, Download, Camera, Save
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/sonner'
import { toast as sonnerToast } from 'sonner'

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
        {currentPage === 'news' && <NewsPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'login' && <LoginPage setCurrentPage={setCurrentPage} setToken={setToken} setUser={setUser} />}
        {currentPage === 'admin' && user?.role === 'admin' && <AdminPanel token={token} />}
        {currentPage === 'inspector' && user?.role === 'inspector' && <InspectorPanel token={token} user={user} />}
      </main>

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
          <div className="max-w-3xl">
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
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={() => setCurrentPage('packages')} className="bg-white text-primary hover:bg-white/90">
                Denetleme Yaptırmak İstiyorum
              </Button>
              <Button size="lg" variant="outline" onClick={() => setCurrentPage('contact')} className="border-white text-white hover:bg-white/10">
                Bize Ulaşın
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

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Neden Sarımeşe Danışmanlık?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1562564055-71e051d33c19" 
                alt="Profesyonel Danışmanlık"
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Mevzuata Uygun</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">MEB, Yangın ve Tarım yönetmeliklerine tam uyum</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1633526543814-9718c8922b7a" 
                alt="Detaylı Planlama"
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <CardHeader>
                <FileCheck className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Eksiksiz Denetim</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Evrak, fiziki şartlar ve finans kontrolü</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-xl transition-shadow">
              <img 
                src="https://images.unsplash.com/photo-1638262052640-82e94d64664a" 
                alt="Güvenilir Hizmet"
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Detaylı Raporlama</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Eksiklikler ve çözüm önerileri ile kapsamlı rapor</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Güvenli Ödeme Bölümü - Yeni */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
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

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Kurumunuzu Denetime Hazırlayalım</h2>
          <p className="text-lg mb-8 opacity-90">Hemen iletişime geçin, ücretsiz ön değerlendirme alın</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => setCurrentPage('contact')}>
              Bilgi Almak İstiyorum <ChevronRight className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setCurrentPage('packages')} className="border-white text-white hover:bg-white/10 hover:text-white">
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
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Hizmetlerimiz</h1>
        
        <div className="prose max-w-4xl mb-12">
          <p className="text-lg">
            Anaokullarının denetimlerde karşılaşabileceği riskleri önceden tespit ediyor,
            kurumunuzu MEB, Yangın ve Tarım denetimlerine hazırlıyoruz.
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-6">Denetlenen Alanlar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { icon: FileCheck, title: 'MEB Evrakları', desc: 'Tüm resmi evrakların kontrolü' },
            { icon: Building2, title: 'MEBBİS Kontrolü', desc: 'Sistem kayıtlarının doğruluğu' },
            { icon: BookOpen, title: 'e-Okul Kontrolü', desc: 'Öğrenci ve personel kayıtları' },
            { icon: Shield, title: 'Fiziki Şartlar', desc: 'Bina ve donanım uygunluğu' },
            { icon: AlertCircle, title: 'Yangın Yönetmeliği', desc: 'Yangın güvenlik sistemleri' },
            { icon: CheckCircle2, title: 'Tarım ve Hijyen', desc: 'Gıda ve sağlık kuralları' }
          ].map((item, i) => (
            <Card key={i}>
              <CardHeader>
                <item.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <Button size="lg" onClick={() => setCurrentPage('packages')}>
            Paketleri İncele
          </Button>
          <Button size="lg" variant="outline" onClick={() => setCurrentPage('contact')}>
            Bilgi Almak İstiyorum
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
function NewsPage() {
  const [news, setNews] = useState([])

  useEffect(() => {
    fetch('/api/news').then(r => r.json()).then(setNews)
  }, [])

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Bizden Haberler</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map(item => (
            <Card key={item.id}>
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded-t-lg" />
              )}
              <CardHeader>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription>
                  {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
              </CardContent>
            </Card>
          ))}
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
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">İletişim</h1>
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
function QuestionsTab({ token }) {
  const [questions, setQuestions] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setCategories)
    fetch('/api/admin/questions', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setQuestions)
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Sorular ({questions.length})</h2>
      <p className="text-muted-foreground">Soru yönetimi için gelişmiş arayüz yakında eklenecek</p>
    </div>
  )
}

// Staff Tab (Basitleştirilmiş)
function StaffTab({ token }) {
  const [staff, setStaff] = useState([])

  useEffect(() => {
    fetch('/api/admin/staff', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setStaff)
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Personel ({staff.length})</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map(s => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell>{new Date(s.createdAt).toLocaleDateString('tr-TR')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

// Packages Tab (Basitleştirilmiş)
function PackagesTab({ token }) {
  const [packages, setPackages] = useState([])

  useEffect(() => {
    fetch('/api/admin/packages', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setPackages)
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Paketler ({packages.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map(pkg => (
          <Card key={pkg.id}>
            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
              <CardDescription>{pkg.price.toLocaleString('tr-TR')} TL</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{pkg.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Cities Tab (Basitleştirilmiş)
function CitiesTab({ token }) {
  const [cities, setCities] = useState([])

  useEffect(() => {
    fetch('/api/admin/cities', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setCities)
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">İller ({cities.length})</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İl</TableHead>
              <TableHead>Yol Ücreti</TableHead>
              <TableHead>Konaklama Ücreti</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cities.map(city => (
              <TableRow key={city.id}>
                <TableCell>{city.name}</TableCell>
                <TableCell>{city.travelCost.toLocaleString('tr-TR')} TL</TableCell>
                <TableCell>{city.accommodationCost.toLocaleString('tr-TR')} TL</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

// Messages Tab
function MessagesTab({ token }) {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    fetch('/api/admin/messages', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setMessages)
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Mesajlar ({messages.length})</h2>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map(msg => (
              <TableRow key={msg.id}>
                <TableCell>{msg.name}</TableCell>
                <TableCell>{msg.schoolName}</TableCell>
                <TableCell>{msg.phone}</TableCell>
                <TableCell>{msg.type === 'bilgi_almak' ? 'Bilgi' : 'Denetim'}</TableCell>
                <TableCell>{msg.status}</TableCell>
                <TableCell>{new Date(msg.createdAt).toLocaleDateString('tr-TR')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
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
function InspectionsTab({ token }) {
  const [inspections, setInspections] = useState([])

  useEffect(() => {
    fetch('/api/admin/inspections', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setInspections)
  }, [])

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {inspections.map(insp => (
              <TableRow key={insp.id}>
                <TableCell>{insp.schoolName}</TableCell>
                <TableCell>{insp.city?.name} / {insp.district}</TableCell>
                <TableCell>{insp.package?.name}</TableCell>
                <TableCell>{insp.inspector?.name || 'Atanmadı'}</TableCell>
                <TableCell>
                  {insp.status === 'completed' ? (
                    <span className="text-green-600">Tamamlandı</span>
                  ) : insp.status === 'in_progress' ? (
                    <span className="text-blue-600">Devam Ediyor</span>
                  ) : (
                    <span className="text-yellow-600">Bekliyor</span>
                  )}
                </TableCell>
                <TableCell>{new Date(insp.createdAt).toLocaleDateString('tr-TR')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

// Inspector Panel (Basitleştirilmiş)
function InspectorPanel({ token, user }) {
  const [inspections, setInspections] = useState([])

  useEffect(() => {
    fetch('/api/inspector/inspections', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setInspections)
  }, [])

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Denetim Paneli</h1>
        <p className="text-muted-foreground mb-6">Hoş geldiniz, {user.name}</p>
        
        <h2 className="text-2xl font-bold mb-4">Denetimlerim ({inspections.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inspections.map(insp => (
            <Card key={insp.id}>
              <CardHeader>
                <CardTitle>{insp.schoolName}</CardTitle>
                <CardDescription>{insp.city?.name} / {insp.district}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Paket: {insp.package?.name}</div>
                  <div>Durum: {insp.status === 'completed' ? 'Tamamlandı' : insp.status === 'in_progress' ? 'Devam Ediyor' : 'Bekliyor'}</div>
                  <div>Tarih: {new Date(insp.createdAt).toLocaleDateString('tr-TR')}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
