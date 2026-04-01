'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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

export function DashboardTab({ token }) {
  const [period, setPeriod] = useState('1m')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exportDateRange, setExportDateRange] = useState({ start: '', end: '' })
  const [exportData, setExportData] = useState(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadStats()
  }, [period])

  const loadStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/stats?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      sonnerToast.error('İstatistikler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const exportPDF = async () => {
    if (!exportDateRange.start || !exportDateRange.end) {
      sonnerToast.error('Tarih aralığı seçin')
      return
    }
    
    setExporting(true)
    try {
      const response = await fetch(
        `/api/admin/inspections/export?startDate=${exportDateRange.start}&endDate=${exportDateRange.end}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await response.json()
      
      // Generate PDF
      const html2pdf = (await import('html2pdf.js')).default
      
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
          <style>
            * { 
              font-family: Arial, Helvetica, 'Segoe UI', Tahoma, sans-serif;
              box-sizing: border-box;
            }
            body { padding: 20px; color: #333; font-size: 11px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
            .header h1 { color: #1e40af; margin: 0 0 5px 0; font-size: 20px; font-weight: bold; }
            .header p { margin: 3px 0; color: #666; font-size: 10px; }
            .date-range { background: #f0f9ff; padding: 10px; border-radius: 6px; margin-bottom: 20px; text-align: center; border: 1px solid #bfdbfe; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #1e40af; color: white; padding: 10px 8px; text-align: left; font-size: 10px; font-weight: bold; }
            td { padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
            tr:nth-child(even) { background: #f9fafb; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 9px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DENETİM LİSTESİ RAPORU</h1>
            <p><strong>SARIMEŞE DANIŞMANLIK</strong></p>
            <p>Eğitim ve Bilişim Teknolojileri Sanayi Ticaret Ltd. Şti.</p>
          </div>
          
          <div class="date-range">
            <strong>Tarih Aralığı:</strong> ${new Date(exportDateRange.start).toLocaleDateString('tr-TR')} - ${new Date(exportDateRange.end).toLocaleDateString('tr-TR')}
            <br><strong>Toplam Kayıt:</strong> ${data.length}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Okul Adı</th>
                <th>Yetkili</th>
                <th>Telefon</th>
                <th>İl</th>
                <th>İlçe</th>
                <th>Denetim Tarihi</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((insp, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${insp.schoolName || ''}</td>
                  <td>${insp.schoolContact || '-'}</td>
                  <td>${insp.schoolPhone || '-'}</td>
                  <td>${insp.city?.name || '-'}</td>
                  <td>${insp.district || '-'}</td>
                  <td>${new Date(insp.createdAt).toLocaleDateString('tr-TR')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Oluşturulma: ${new Date().toLocaleString('tr-TR')} | SARIMEŞE DANIŞMANLIK</p>
          </div>
        </body>
        </html>
      `
      
      const element = document.createElement('div')
      element.innerHTML = htmlContent
      element.style.width = '297mm' // A4 landscape width
      document.body.appendChild(element)
      
      await html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `denetim_listesi_${exportDateRange.start}_${exportDateRange.end}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false, windowWidth: 1122 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      }).from(element).save()
      
      document.body.removeChild(element)
      sonnerToast.success('PDF rapor indirildi')
    } catch (error) {
      sonnerToast.error('Export hatası')
    } finally {
      setExporting(false)
    }
  }

  // Dynamic import for Recharts
  const [RechartsComponents, setRechartsComponents] = useState(null)
  
  useEffect(() => {
    import('recharts').then(module => {
      setRechartsComponents({
        LineChart: module.LineChart,
        Line: module.Line,
        XAxis: module.XAxis,
        YAxis: module.YAxis,
        CartesianGrid: module.CartesianGrid,
        Tooltip: module.Tooltip,
        Legend: module.Legend,
        ResponsiveContainer: module.ResponsiveContainer
      })
    })
  }, [])

  const periodOptions = [
    { value: '1m', label: 'Aylık' },
    { value: '3m', label: '3 Aylık' },
    { value: '6m', label: '6 Aylık' },
    { value: '1y', label: 'Yıllık' },
    { value: '2y', label: '2 Yıllık' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📊 Raporlama & İstatistikler</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/messages" className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white h-full transition-opacity hover:opacity-95 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Gelen Mesajlar</p>
                    <p className="text-4xl font-bold mt-2">{stats.totals.messages}</p>
                    <p className="text-blue-100/90 text-xs mt-3 max-w-[14rem] leading-snug">
                      Web sitesi İletişim formundan gelen talepler Mesajlar sayfasında listelenir. Tıklayın →
                    </p>
                  </div>
                  <MessageSquare className="h-12 w-12 opacity-50 shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Tamamlanan Denetimler</p>
                  <p className="text-4xl font-bold mt-2">{stats.totals.inspections}</p>
                </div>
                <ClipboardList className="h-12 w-12 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Toplam Ciro</p>
                  <p className="text-4xl font-bold mt-2">₺{stats.totals.revenue.toLocaleString('tr-TR')}</p>
                </div>
                <CreditCard className="h-12 w-12 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      {stats && RechartsComponents && (
        <Card>
          <CardHeader>
            <CardTitle>Zaman Bazlı Değişim</CardTitle>
            <CardDescription>Mesajlar, denetimler ve ciro trendi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <RechartsComponents.ResponsiveContainer width="100%" height="100%">
                <RechartsComponents.LineChart data={stats.chartData}>
                  <RechartsComponents.CartesianGrid strokeDasharray="3 3" />
                  <RechartsComponents.XAxis dataKey="month" />
                  <RechartsComponents.YAxis yAxisId="left" />
                  <RechartsComponents.YAxis yAxisId="right" orientation="right" />
                  <RechartsComponents.Tooltip />
                  <RechartsComponents.Legend />
                  <RechartsComponents.Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="mesajlar" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Mesajlar"
                  />
                  <RechartsComponents.Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="denetimler" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Denetimler"
                  />
                  <RechartsComponents.Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="ciro" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    name="Ciro (₺)"
                  />
                </RechartsComponents.LineChart>
              </RechartsComponents.ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>📥 Denetim Listesi PDF Export</CardTitle>
          <CardDescription>Belirli tarih aralığındaki denetimleri PDF olarak indirin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Başlangıç Tarihi</Label>
              <Input 
                type="date" 
                value={exportDateRange.start}
                onChange={(e) => setExportDateRange({ ...exportDateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Bitiş Tarihi</Label>
              <Input 
                type="date" 
                value={exportDateRange.end}
                onChange={(e) => setExportDateRange({ ...exportDateRange, end: e.target.value })}
              />
            </div>
            <Button onClick={exportPDF} disabled={exporting}>
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Hazırlanıyor...' : 'PDF İndir'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      )}
    </div>
  )
}

