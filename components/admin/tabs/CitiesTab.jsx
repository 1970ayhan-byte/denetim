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

export function CitiesTab({ token }) {
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

