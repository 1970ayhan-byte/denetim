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

export function StaffTab({ token }) {
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

