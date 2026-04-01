'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { MapPin, Phone } from 'lucide-react'
import { toast as sonnerToast } from 'sonner'
import { trackFormSubmit } from '@/lib/tracking'

export function IletisimPage() {
  const [formData, setFormData] = useState({
    name: '',
    schoolName: '',
    phone: '',
    type: 'bilgi_almak',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    trackFormSubmit('contact', { type: formData.type })
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
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
                  <p className="text-sm text-muted-foreground">
                    EĞİTİM VE BİLİŞİM TEKNOLOJİLERİ SANAYİ TİCARET LTD ŞTİ
                  </p>
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
                  />
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
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Kurum Adı</Label>
                    <Input
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Telefon *</Label>
                    <Input
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Talep Türü</Label>
                    <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bilgi_almak">Bilgi almak istiyorum</SelectItem>
                        <SelectItem value="denetim_yaptirmak">Denetleme yapılmasını istiyorum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Gönder
                  </Button>
                </form>
                <p className="text-sm text-muted-foreground mt-4 border-t pt-4">
                  Formu gönderdiğinizde talebiniz bize ulaşır; ekibimiz en kısa sürede sizinle iletişime geçer.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
