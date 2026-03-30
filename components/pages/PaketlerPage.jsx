'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, CreditCard, Package, Phone, Users } from 'lucide-react'
import { toast as sonnerToast } from 'sonner'

export function PaketlerPage() {
  const router = useRouter()

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
              onClick={() => router.push('/iletisim')}
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
