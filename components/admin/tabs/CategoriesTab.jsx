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

export function CategoriesTab({ token }) {
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

