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

export function MessagesTab({ token }) {
  const [messages, setMessages] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showDialog, setShowDialog] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState('')
  const [noteUpdate, setNoteUpdate] = useState('')

  const loadMessages = async () => {
    const url = filterStatus === 'all' 
      ? '/api/admin/messages' 
      : `/api/admin/messages?status=${filterStatus}`
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    setMessages(await response.json())
  }

  useEffect(() => {
    loadMessages()
  }, [filterStatus])

  const handleUpdateStatus = async () => {
    await fetch(`/api/admin/messages/${selectedMessage.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: statusUpdate, note: noteUpdate })
    })
    sonnerToast.success('Durum güncellendi')
    setShowDialog(false)
    loadMessages()
  }

  const openDialog = (msg) => {
    setSelectedMessage(msg)
    setStatusUpdate(msg.status)
    setNoteUpdate(msg.note || '')
    setShowDialog(true)
  }

  const statusColors = {
    'new': 'bg-blue-100 text-blue-800',
    'contacted': 'bg-yellow-100 text-yellow-800',
    'positive': 'bg-green-100 text-green-800',
    'negative': 'bg-red-100 text-red-800',
    'wrong': 'bg-gray-100 text-gray-800'
  }

  const statusLabels = {
    'new': 'Yeni',
    'contacted': 'Görüşüldü',
    'positive': 'Olumlu',
    'negative': 'Olumsuz',
    'wrong': 'Yanlış Mesaj'
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
        Web sitesi İletişim formundan gelen talepler burada listelenir.
      </p>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Mesajlar ({messages.length})</h2>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="new">Yeni</SelectItem>
            <SelectItem value="contacted">Görüşüldü</SelectItem>
            <SelectItem value="positive">Olumlu</SelectItem>
            <SelectItem value="negative">Olumsuz</SelectItem>
            <SelectItem value="wrong">Yanlış Mesaj</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
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
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map(msg => (
              <TableRow key={msg.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDialog(msg)}>
                <TableCell className="font-medium">{msg.name}</TableCell>
                <TableCell>{msg.schoolName || '-'}</TableCell>
                <TableCell>
                  <a href={`tel:${msg.phone}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                    {msg.phone}
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {msg.type === 'bilgi_almak' ? 'Bilgi' : 'Denetim'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[msg.status]}>
                    {statusLabels[msg.status]}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(msg.createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openDialog(msg); }}>
                    <Eye className="h-3 w-3" />
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
            <DialogTitle>Mesaj Detayı</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Ad Soyad</Label>
                <p>{selectedMessage.name}</p>
              </div>
              {selectedMessage.schoolName && (
                <div>
                  <Label className="text-sm font-semibold">Kurum</Label>
                  <p>{selectedMessage.schoolName}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-semibold">Telefon</Label>
                <p>
                  <a href={`tel:${selectedMessage.phone}`} className="text-primary hover:underline">
                    {selectedMessage.phone}
                  </a>
                </p>
              </div>
              <div>
                <Label className="text-sm font-semibold">Talep Türü</Label>
                <p>{selectedMessage.type === 'bilgi_almak' ? 'Bilgi Almak' : 'Denetim Yaptırmak'}</p>
              </div>
              <div>
                <Label>Durum</Label>
                <Select value={statusUpdate} onValueChange={setStatusUpdate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Yeni</SelectItem>
                    <SelectItem value="contacted">Görüşüldü</SelectItem>
                    <SelectItem value="positive">Olumlu</SelectItem>
                    <SelectItem value="negative">Olumsuz</SelectItem>
                    <SelectItem value="wrong">Yanlış Mesaj</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Not</Label>
                <Textarea 
                  value={noteUpdate}
                  onChange={(e) => setNoteUpdate(e.target.value)}
                  rows={3}
                  placeholder="Görüşme notları..."
                />
              </div>
              <Button onClick={handleUpdateStatus} className="w-full">
                Kaydet
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

