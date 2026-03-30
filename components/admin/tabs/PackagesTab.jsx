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

export function PackagesTab({ token }) {
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
              <Label>Paket İçeriği (denetim kapsamı)</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Her satır, &quot;Sorular&quot; sekmesindeki bir <strong>kategori adı</strong> ile birebir aynı olmalıdır.
                Denetçi yalnızca burada yazan kategorilere ait soruları görür.
              </p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input 
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    placeholder="Örn: MEB Evrak Kontrolü"
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

