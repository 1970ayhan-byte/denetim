'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Download, Edit2 } from 'lucide-react'
import { toast as sonnerToast } from 'sonner'
import { downloadInspectionReportPdf } from '@/lib/inspectionReportPdf'

export function InspectionReportContent({
  fullReportData,
  token,
  inspectionId,
  onReportRefresh,
}) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingAnswer, setEditingAnswer] = useState(null)
  const [editNote, setEditNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  const startEditNote = (answer) => {
    setEditingAnswer(answer)
    setEditNote(answer.note || '')
    setShowEditDialog(true)
  }

  const saveNote = async () => {
    if (!editingAnswer || !inspectionId) return
    setSavingNote(true)
    try {
      const res = await fetch(`/api/admin/inspection/${inspectionId}/answer/${editingAnswer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note: editNote }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        sonnerToast.error(err.error || 'Güncellenemedi')
        return
      }
      sonnerToast.success('Not güncellendi')
      setShowEditDialog(false)
      setEditingAnswer(null)
      await onReportRefresh?.()
    } catch {
      sonnerToast.error('Güncelleme hatası')
    } finally {
      setSavingNote(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!fullReportData) return
    setGeneratingPDF(true)
    try {
      await downloadInspectionReportPdf(fullReportData)
    } finally {
      setGeneratingPDF(false)
    }
  }

  if (!fullReportData) return null

  return (
    <>
      <div className="space-y-6">
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Kurum Bilgileri</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Okul:</span>{' '}
              <strong>{fullReportData.inspection.schoolName}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">İl / İlçe:</span>{' '}
              <strong>
                {fullReportData.inspection.city?.name} / {fullReportData.inspection.district}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Paket:</span>{' '}
              <strong>{fullReportData.inspection.package?.name}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Danışman:</span>{' '}
              <strong>{fullReportData.inspection.inspector?.name || 'Belirtilmemiş'}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Rapor Tarihi:</span>{' '}
              <strong>{fullReportData.generatedAt}</strong>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg">
          <p className="text-sm leading-relaxed">
            <strong>{fullReportData.generatedAt}</strong> tarihinde{' '}
            <strong>{fullReportData.inspection.schoolName}</strong> kurumu yetkilisi{' '}
            <strong>{fullReportData.inspection.schoolContact || 'kurum yetkilisi'}</strong> talebi üzerine
            yapılan özel denetleme hizmetimiz çerçevesinde aşağıda belirtilen detaylar tespit edilmiştir.
          </p>
          <p className="text-sm mt-3 text-amber-800">
            Eksiklerin en kısa sürede giderilmesi noktasında danışmanlık almak isterseniz sizlere destek
            olmaktan mutluluk duyarız.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4 text-red-800">Tespit Edilen Eksikler</h3>
          {fullReportData.inspection.answers?.filter((a) => a.answer !== 'uygun').length === 0 ? (
            <Card className="p-8 text-center bg-green-50">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-lg font-semibold text-green-700">Tüm kontroller uygun bulunmuştur!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {fullReportData.inspection.answers
                ?.filter((a) => a.answer !== 'uygun')
                .map((answer, index) => (
                  <Card key={answer.id} className="overflow-hidden border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-bold text-red-700 text-base flex items-center gap-2">
                            <span className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">
                              {index + 1}
                            </span>
                            {answer.question?.question}
                          </h4>
                          <Button size="sm" variant="ghost" onClick={() => startEditNote(answer)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {answer.question?.regulationText && (
                          <div className="flex items-start gap-2 bg-blue-50 p-3 rounded text-sm">
                            <span className="text-blue-600">📜</span>
                            <div>
                              <strong className="text-blue-900">Yönetmelik:</strong>
                              <p className="text-blue-800 mt-1">{answer.question.regulationText}</p>
                            </div>
                          </div>
                        )}

                        {answer.note && (
                          <div className="flex items-start gap-2 bg-gray-50 p-3 rounded text-sm">
                            <span>🗒️</span>
                            <div>
                              <strong>Not:</strong>
                              <p className="mt-1">{answer.note}</p>
                            </div>
                          </div>
                        )}

                        {answer.question?.penaltyType && (
                          <div className="bg-red-50 border border-red-200 p-3 rounded text-sm">
                            <strong className="text-red-900">Ceza:</strong>
                            <span className="text-red-800 ml-2 capitalize">{answer.question.penaltyType}</span>
                          </div>
                        )}

                        {answer.photos && JSON.parse(answer.photos || '[]').length > 0 && (
                          <div className="grid grid-cols-4 gap-2 mt-2">
                            {JSON.parse(answer.photos).map((photo, i) => (
                              <img
                                key={i}
                                src={photo}
                                alt={`Foto ${i + 1}`}
                                className="w-full aspect-square object-cover rounded"
                              />
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

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm">
          <strong>⚠️ HUKUKİ UYARI:</strong>
          <p className="mt-2">
            Bu rapor yalnızca öneri niteliğindedir ve kurumun yasal sorumluluklarını ortadan kaldırmaz. Raporun
            yasal bir değeri bulunmamaktadır. Sadece bilgilendirme amaçlıdır.
          </p>
          <p className="mt-2 font-semibold">{fullReportData.company}</p>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleDownloadPdf} className="flex-1" size="lg" disabled={generatingPDF}>
            {generatingPDF ? (
              <>Oluşturuluyor...</>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" /> PDF Olarak İndir
              </>
            )}
          </Button>
        </div>
      </div>

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
    </>
  )
}
