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

export function NewsManagementTab({ token }) {
  const [news, setNews] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    keywords: '',
    published: true
  })

  const loadNews = async () => {
    const response = await fetch('/api/admin/news', { headers: { Authorization: `Bearer ${token}` } })
    setNews(await response.json())
  }

  useEffect(() => {
    loadNews()
  }, [])

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      sonnerToast.error('Başlık ve içerik zorunludur')
      return
    }

    const url = editItem ? `/api/admin/news/${editItem.id}` : '/api/admin/news'
    const method = editItem ? 'PUT' : 'POST'
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    })
    
    sonnerToast.success(editItem ? 'Haber güncellendi' : 'Haber eklendi')
    setShowDialog(false)
    setEditItem(null)
    setFormData({ title: '', content: '', imageUrl: '', keywords: '', published: true })
    loadNews()
  }

  const handleDelete = async (id) => {
    if (!confirm('Bu haberi silmek istediğinizden emin misiniz?')) return
    await fetch(`/api/admin/news/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    sonnerToast.success('Haber silindi')
    loadNews()
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setFormData({
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl || '',
      keywords: item.keywords || '',
      published: item.published
    })
    setShowDialog(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Haberler ({news.length})</h2>
        <Button onClick={() => {
          setEditItem(null)
          setFormData({ title: '', content: '', imageUrl: '', keywords: '', published: true })
          setShowDialog(true)
        }}>
          <Plus className="h-4 w-4 mr-2" /> Yeni Haber
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map(item => (
          <Card key={item.id}>
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded-t-lg" />
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                {item.published && <Badge>Yayında</Badge>}
              </div>
              <CardDescription>
                {new Date(item.createdAt).toLocaleDateString('tr-TR')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{item.content}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="flex-1">
                  <Edit2 className="h-3 w-3 mr-1" /> Düzenle
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Haber Düzenle' : 'Yeni Haber Ekle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Başlık *</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Haber başlığı"
              />
            </div>
            <div>
              <Label>İçerik *</Label>
              <Textarea 
                rows={8}
                value={formData.content} 
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Haber içeriği..."
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
              <Label>SEO Anahtar Kelimeleri</Label>
              <Input 
                value={formData.keywords} 
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                placeholder="meb, denetim, yangın (virgülle ayırın)"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({...formData, published: e.target.checked})}
                className="h-4 w-4"
              />
              <Label htmlFor="published">Yayınla (Web sitesinde göster)</Label>
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

