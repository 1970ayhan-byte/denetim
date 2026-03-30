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

export function QuestionsTab({ token }) {
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
    const data = await response.json()
    if (!response.ok) {
      sonnerToast.error(data.error || 'Sorular yüklenemedi')
      setQuestions([])
      return
    }
    setQuestions(Array.isArray(data) ? data : [])
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
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      sonnerToast.error(payload.error || 'İşlem başarısız')
      return
    }
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
    const res = await fetch(`/api/admin/questions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      sonnerToast.error(payload.error || 'Silinemedi')
      return
    }
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

