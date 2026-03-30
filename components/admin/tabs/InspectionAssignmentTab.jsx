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
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Shield,
  FileCheck,
  Building2,
  BookOpen,
  ChevronRight,
  Users,
  Package,
  MapIcon,
  MessageSquare,
  CreditCard,
  ClipboardList,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Download,
  Camera,
  Save,
  Clock,
  Zap,
} from 'lucide-react'
import { toast as sonnerToast } from 'sonner'

export function InspectionAssignmentTab({ token }) {
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
    
    if (!formData.schoolContact || !formData.schoolPhone) {
      sonnerToast.error('Yetkili adı ve telefon zorunludur')
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
            <h4 className="font-semibold mb-3">Yetkili Bilgileri *</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Yetkili Ad Soyad *</Label>
                <Input 
                  value={formData.schoolContact}
                  onChange={(e) => setFormData({...formData, schoolContact: e.target.value})}
                  placeholder="Örn: Ayşe Yılmaz"
                />
              </div>
              <div>
                <Label>Telefon *</Label>
                <Input 
                  value={formData.schoolPhone}
                  onChange={(e) => setFormData({...formData, schoolPhone: e.target.value})}
                  placeholder="05xxxxxxxxx"
                />
              </div>
              <div>
                <Label>E-posta</Label>
                <Input 
                  value={formData.schoolEmail}
                  onChange={(e) => setFormData({...formData, schoolEmail: e.target.value})}
                  placeholder="E-posta"
                />
              </div>
              <div>
                <Label>Kontenjan</Label>
                <Input 
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  placeholder="Örn: 50"
                />
              </div>
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

