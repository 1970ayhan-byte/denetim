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

export function PaymentsTab({ token }) {
  const [payments, setPayments] = useState([])

  useEffect(() => {
    fetch('/api/admin/payments', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setPayments)
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Ödemeler ({payments.length})</h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Okul</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>İl</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map(payment => (
              <TableRow key={payment.id}>
                <TableCell>{payment.schoolName}</TableCell>
                <TableCell>{payment.package?.name}</TableCell>
                <TableCell>{payment.city?.name}</TableCell>
                <TableCell>{payment.amount.toLocaleString('tr-TR')} TL</TableCell>
                <TableCell>
                  {payment.status === 'completed' ? (
                    <span className="text-green-600 font-medium">Tamamlandı</span>
                  ) : (
                    <span className="text-yellow-600">Bekliyor</span>
                  )}
                </TableCell>
                <TableCell>{new Date(payment.createdAt).toLocaleDateString('tr-TR')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

