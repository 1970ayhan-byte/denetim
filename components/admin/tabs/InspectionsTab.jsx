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

export function InspectionsTab({ token }) {
  const [inspections, setInspections] = useState([])
  const [selectedInspection, setSelectedInspection] = useState(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [fullReportData, setFullReportData] = useState(null)
  const [editingAnswer, setEditingAnswer] = useState(null)
  const [editNote, setEditNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadInspections()
  }, [])

  const loadInspections = async () => {
    const response = await fetch('/api/admin/inspections', { 
      headers: { Authorization: `Bearer ${token}` } 
    })
    const data = await response.json()
    if (!response.ok) {
      sonnerToast.error(data.error || 'Denetimler yüklenemedi')
      setInspections([])
      return
    }
    setInspections(Array.isArray(data) ? data : [])
  }

  const viewReport = async (inspection) => {
    const response = await fetch(`/api/admin/inspection/${inspection.id}/report`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    setFullReportData(data)
    setSelectedInspection(inspection)
    setShowDetailDialog(true)
  }

  const startEditNote = (answer) => {
    setEditingAnswer(answer)
    setEditNote(answer.note || '')
    setShowEditDialog(true)
  }

  const saveNote = async () => {
    if (!editingAnswer) return
    setSavingNote(true)
    try {
      await fetch(`/api/admin/inspection/${selectedInspection.id}/answer/${editingAnswer.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ note: editNote })
      })
      
      // Update local state
      setFullReportData(prev => ({
        ...prev,
        inspection: {
          ...prev.inspection,
          answers: prev.inspection.answers.map(a => 
            a.id === editingAnswer.id ? { ...a, note: editNote } : a
          )
        }
      }))
      
      sonnerToast.success('Not güncellendi')
      setShowEditDialog(false)
      setEditingAnswer(null)
    } catch (error) {
      sonnerToast.error('Güncelleme hatası')
    } finally {
      setSavingNote(false)
    }
  }

  // Türkçe karakterleri koruyarak PDF oluştur
  const downloadPDF = async () => {
    if (!fullReportData) return
    setGeneratingPDF(true)
    
    try {
      const html2pdf = (await import('html2pdf.js')).default
      
      const inspection = fullReportData.inspection
      
      // Tarih formatlama
      const reportDate = new Date(inspection.completedAt || inspection.createdAt)
      const formattedDate = reportDate.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
      
      const issueAnswers = (inspection.answers || []).filter(a => a.answer !== 'uygun')
      
      // HTML içeriği oluştur - Türkçe karakterler için sistem fontları kullanılıyor
      // Arial ve Helvetica Türkçe karakterleri destekler
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
          <style>
            * { 
              font-family: Arial, Helvetica, 'Segoe UI', Tahoma, sans-serif;
              -webkit-font-smoothing: antialiased;
              box-sizing: border-box;
            }
            body { 
              padding: 20px; 
              color: #333; 
              font-size: 12px; 
              line-height: 1.5;
            }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 15px; }
            .header h1 { color: #1e40af; margin: 0 0 5px 0; font-size: 22px; font-weight: bold; }
            .header p { margin: 3px 0; color: #666; font-size: 11px; }
            .info-box { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
            .info-box h3 { margin: 0 0 10px 0; color: #1e40af; font-size: 14px; font-weight: bold; }
            .info-grid { display: flex; flex-wrap: wrap; gap: 8px; }
            .info-item { font-size: 11px; width: 48%; }
            .info-item strong { color: #1e40af; font-weight: bold; }
            .intro-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b; }
            .intro-box p { margin: 0 0 10px 0; font-size: 11px; }
            .intro-box .support { color: #92400e; font-style: italic; }
            .section-title { color: #dc2626; font-size: 16px; font-weight: bold; margin: 20px 0 15px 0; }
            .issue-card { background: #fff; border: 1px solid #e5e7eb; border-left: 4px solid #dc2626; border-radius: 8px; padding: 15px; margin-bottom: 15px; page-break-inside: avoid; }
            .issue-title { color: #dc2626; font-weight: bold; font-size: 13px; margin-bottom: 10px; }
            .issue-number { background: #fee2e2; color: #dc2626; border-radius: 50%; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; margin-right: 8px; }
            .regulation-box { background: #eff6ff; padding: 10px; border-radius: 6px; margin: 10px 0; font-size: 11px; }
            .regulation-box strong { color: #1e40af; font-weight: bold; }
            .note-box { background: #f3f4f6; padding: 10px; border-radius: 6px; margin: 10px 0; font-size: 11px; }
            .penalty-box { background: #fef2f2; border: 1px solid #fecaca; padding: 8px 12px; border-radius: 6px; margin-top: 10px; font-size: 11px; }
            .penalty-box strong { color: #991b1b; font-weight: bold; }
            .success-box { background: #dcfce7; padding: 30px; border-radius: 8px; text-align: center; color: #166534; }
            .success-box h3 { margin: 0; font-size: 16px; font-weight: bold; }
            .legal-box { background: #fefce8; border: 1px solid #fde047; padding: 15px; border-radius: 8px; margin-top: 25px; font-size: 10px; }
            .legal-box strong { color: #854d0e; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 9px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DENETİM RAPORU</h1>
            <p><strong>SARIMEŞE DANIŞMANLIK</strong></p>
            <p>Eğitim ve Bilişim Teknolojileri Sanayi Ticaret Ltd. Şti.</p>
          </div>
          
          <div class="info-box">
            <h3>KURUM BİLGİLERİ</h3>
            <div class="info-grid">
              <div class="info-item"><strong>Okul Adı:</strong> ${inspection.schoolName || ''}</div>
              <div class="info-item"><strong>İl / İlçe:</strong> ${inspection.city?.name || ''} / ${inspection.district || ''}</div>
              <div class="info-item"><strong>Paket:</strong> ${inspection.package?.name || ''}</div>
              <div class="info-item"><strong>Danışman:</strong> ${inspection.inspector?.name || 'Belirtilmemiş'}</div>
              <div class="info-item"><strong>Rapor Tarihi:</strong> ${formattedDate}</div>
            </div>
          </div>
          
          <div class="intro-box">
            <p><strong>${formattedDate}</strong> tarihinde <strong>${inspection.schoolName || ''}</strong> kurumu yetkilisi <strong>${inspection.schoolContact || 'kurum yetkilisi'}</strong> talebi üzerine yapılan özel denetleme hizmetimiz çerçevesinde aşağıda belirtilen detaylar tespit edilmiştir.</p>
            <p class="support">Eksiklerin en kısa sürede giderilmesi noktasında danışmanlık almak isterseniz sizlere destek olmaktan mutluluk duyarız.</p>
          </div>
          
          ${issueAnswers.length > 0 ? `
            <div class="section-title">TESPİT EDİLEN EKSİKLER</div>
            ${issueAnswers.map((answer, index) => `
              <div class="issue-card">
                <div class="issue-title">
                  <span class="issue-number">${index + 1}</span>
                  ${answer.question?.question || ''}
                </div>
                ${answer.question?.regulationText ? `
                  <div class="regulation-box">
                    <strong>Yönetmelik:</strong><br/>
                    ${answer.question.regulationText}
                  </div>
                ` : ''}
                ${answer.note ? `
                  <div class="note-box">
                    <strong>Not:</strong><br/>
                    ${answer.note}
                  </div>
                ` : ''}
                ${answer.question?.penaltyType ? `
                  <div class="penalty-box">
                    <strong>Ceza:</strong> ${answer.question.penaltyType}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          ` : `
            <div class="success-box">
              <h3>Tüm kontroller uygun bulunmuştur!</h3>
            </div>
          `}
          
          <div class="legal-box">
            <strong>HUKUKİ UYARI:</strong>
            <p style="margin: 8px 0 0 0;">Bu rapor yalnızca öneri niteliğindedir ve kurumun yasal sorumluluklarını ortadan kaldırmaz. Raporun yasal bir değeri bulunmamaktadır. Sadece bilgilendirme amaçlıdır.</p>
            <p style="margin: 8px 0 0 0;"><strong>SARIMEŞE DANIŞMANLIK</strong></p>
          </div>
          
          <div class="footer">
            <p>Oluşturulma: ${new Date().toLocaleString('tr-TR')} | SARIMEŞE DANIŞMANLIK</p>
          </div>
        </body>
        </html>
      `
      
      // HTML'den PDF oluştur
      const element = document.createElement('div')
      element.innerHTML = htmlContent
      element.style.width = '210mm' // A4 width
      document.body.appendChild(element)
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `denetim_raporu_${(inspection.schoolName || 'rapor').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          logging: false,
          windowWidth: 794 // A4 width in pixels at 96 DPI
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }
      
      await html2pdf().set(opt).from(element).save()
      
      document.body.removeChild(element)
      sonnerToast.success('PDF rapor indirildi')
    } catch (error) {
      console.error('PDF Error:', error)
      sonnerToast.error('PDF oluşturma hatası')
    } finally {
      setGeneratingPDF(false)
    }
  }

  const filteredInspections = filterStatus === 'all' 
    ? inspections 
    : inspections.filter(i => i.status === filterStatus)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Denetimler ({inspections.length})</h2>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Durum Filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="pending">Bekleyenler</SelectItem>
            <SelectItem value="in_progress">Devam Edenler</SelectItem>
            <SelectItem value="completed">Tamamlananlar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Okul</TableHead>
              <TableHead>İl/İlçe</TableHead>
              <TableHead>Paket</TableHead>
              <TableHead>Danışman</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInspections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {filterStatus === 'all' ? 'Henüz denetim yok' : 'Bu durumda denetim yok'}
                </TableCell>
              </TableRow>
            ) : (
              filteredInspections.map(insp => (
                <TableRow key={insp.id}>
                  <TableCell className="font-medium">{insp.schoolName}</TableCell>
                  <TableCell>{insp.city?.name} / {insp.district}</TableCell>
                  <TableCell>{insp.package?.name}</TableCell>
                  <TableCell>{insp.inspector?.name || <span className="text-muted-foreground">Atanmadı</span>}</TableCell>
                  <TableCell>
                    {insp.status === 'completed' ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Tamamlandı
                      </Badge>
                    ) : insp.status === 'in_progress' ? (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3 mr-1" /> Devam Ediyor
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" /> Bekliyor
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(insp.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {insp.status === 'completed' ? (
                      <Button size="sm" variant="default" onClick={() => viewReport(insp)}>
                        <Eye className="h-3 w-3 mr-1" /> Rapor
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        <Clock className="h-3 w-3 mr-1" /> Bekliyor
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Report Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Denetim Raporu</DialogTitle>
            <DialogDescription>
              {selectedInspection?.schoolName} - {fullReportData?.generatedAt}
            </DialogDescription>
          </DialogHeader>
          
          {fullReportData && (
            <div className="space-y-6">
              {/* Kurum Bilgileri */}
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Kurum Bilgileri</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Okul:</span> <strong>{fullReportData.inspection.schoolName}</strong></div>
                  <div><span className="text-muted-foreground">İl / İlçe:</span> <strong>{fullReportData.inspection.city?.name} / {fullReportData.inspection.district}</strong></div>
                  <div><span className="text-muted-foreground">Paket:</span> <strong>{fullReportData.inspection.package?.name}</strong></div>
                  <div><span className="text-muted-foreground">Danışman:</span> <strong>{fullReportData.inspection.inspector?.name || 'Belirtilmemiş'}</strong></div>
                  <div><span className="text-muted-foreground">Rapor Tarihi:</span> <strong>{fullReportData.generatedAt}</strong></div>
                </div>
              </div>

              {/* Giriş Metni - Highlight Box */}
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg">
                <p className="text-sm leading-relaxed">
                  <strong>{fullReportData.generatedAt}</strong> tarihinde <strong>{fullReportData.inspection.schoolName}</strong> kurumu yetkilisi{' '}
                  <strong>{fullReportData.inspection.schoolContact || 'kurum yetkilisi'}</strong> talebi üzerine yapılan özel denetleme hizmetimiz 
                  çerçevesinde aşağıda belirtilen detaylar tespit edilmiştir.
                </p>
                <p className="text-sm mt-3 text-amber-800">
                  Eksiklerin en kısa sürede giderilmesi noktasında danışmanlık almak isterseniz sizlere destek olmaktan mutluluk duyarız.
                </p>
              </div>

              {/* Tespit Edilen Eksikler */}
              <div>
                <h3 className="font-bold text-lg mb-4 text-red-800">Tespit Edilen Eksikler</h3>
                {fullReportData.inspection.answers?.filter(a => a.answer !== 'uygun').length === 0 ? (
                  <Card className="p-8 text-center bg-green-50">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <p className="text-lg font-semibold text-green-700">Tüm kontroller uygun bulunmuştur! 🎉</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {fullReportData.inspection.answers?.filter(a => a.answer !== 'uygun').map((answer, index) => (
                      <Card key={answer.id} className="overflow-hidden border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Kırmızı Başlık */}
                            <div className="flex items-start justify-between gap-4">
                              <h4 className="font-bold text-red-700 text-base flex items-center gap-2">
                                <span className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">{index + 1}</span>
                                {answer.question?.question}
                              </h4>
                              <Button size="sm" variant="ghost" onClick={() => startEditNote(answer)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {/* Yönetmelik */}
                            {answer.question?.regulationText && (
                              <div className="flex items-start gap-2 bg-blue-50 p-3 rounded text-sm">
                                <span className="text-blue-600">📜</span>
                                <div>
                                  <strong className="text-blue-900">Yönetmelik:</strong>
                                  <p className="text-blue-800 mt-1">{answer.question.regulationText}</p>
                                </div>
                              </div>
                            )}
                            
                            {/* Not */}
                            {answer.note && (
                              <div className="flex items-start gap-2 bg-gray-50 p-3 rounded text-sm">
                                <span>🗒️</span>
                                <div>
                                  <strong>Not:</strong>
                                  <p className="mt-1">{answer.note}</p>
                                </div>
                              </div>
                            )}
                            
                            {/* Ceza */}
                            {answer.question?.penaltyType && (
                              <div className="bg-red-50 border border-red-200 p-3 rounded text-sm">
                                <strong className="text-red-900">Ceza:</strong>
                                <span className="text-red-800 ml-2 capitalize">{answer.question.penaltyType}</span>
                              </div>
                            )}
                            
                            {/* Fotoğraflar */}
                            {answer.photos && JSON.parse(answer.photos || '[]').length > 0 && (
                              <div className="grid grid-cols-4 gap-2 mt-2">
                                {JSON.parse(answer.photos).map((photo, i) => (
                                  <img key={i} src={photo} alt={`Foto ${i + 1}`} className="w-full aspect-square object-cover rounded" />
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Hukuki Uyarı */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm">
                <strong>⚠️ HUKUKİ UYARI:</strong>
                <p className="mt-2">
                  Bu rapor yalnızca öneri niteliğindedir ve kurumun yasal sorumluluklarını ortadan kaldırmaz.
                  Raporun yasal bir değeri bulunmamaktadır. Sadece bilgilendirme amaçlıdır.
                </p>
                <p className="mt-2 font-semibold">{fullReportData.company}</p>
              </div>

              {/* PDF İndir Butonu */}
              <div className="flex gap-4">
                <Button onClick={downloadPDF} className="flex-1" size="lg" disabled={generatingPDF}>
                  {generatingPDF ? (
                    <>Oluşturuluyor...</>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" /> PDF Olarak İndir</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notu Düzenle</DialogTitle>
            <DialogDescription>
              {editingAnswer?.question?.question?.substring(0, 100)}...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Danışman Notu</Label>
              <Textarea 
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Eksiklik hakkında detaylı not yazın..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                İptal
              </Button>
              <Button onClick={saveNote} disabled={savingNote} className="flex-1">
                {savingNote ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

