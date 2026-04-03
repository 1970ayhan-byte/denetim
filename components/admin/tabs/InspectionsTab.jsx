'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, Trash2, Eye, Clock } from 'lucide-react'
import { toast as sonnerToast } from 'sonner'

export function InspectionsTab({ token }) {
  const [inspections, setInspections] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadInspections()
  }, [])

  const loadInspections = async () => {
    const response = await fetch('/api/admin/inspections', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    if (!response.ok) {
      sonnerToast.error(data.error || 'Denetimler yüklenemedi')
      setInspections([])
      return
    }
    setInspections(Array.isArray(data) ? data : [])
  }

  const handleDeleteInspection = async (insp) => {
    const ok = confirm(
      `"${insp.schoolName}" denetimini kalıcı olarak silmek istiyor musunuz? Tüm cevaplar da silinir. Bu işlem geri alınamaz.`,
    )
    if (!ok) return
    try {
      const res = await fetch(`/api/admin/inspections/${insp.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        sonnerToast.error(payload.error || 'Silinemedi')
        return
      }
      sonnerToast.success('Denetim silindi')
      loadInspections()
    } catch {
      sonnerToast.error('Silme hatası')
    }
  }

  const filteredInspections =
    filterStatus === 'all' ? inspections : inspections.filter((i) => i.status === filterStatus)

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
              filteredInspections.map((insp) => (
                <TableRow key={insp.id}>
                  <TableCell className="font-medium">{insp.schoolName}</TableCell>
                  <TableCell>
                    {insp.city?.name} / {insp.district}
                  </TableCell>
                  <TableCell>{insp.package?.name}</TableCell>
                  <TableCell>
                    {insp.inspector?.name || <span className="text-muted-foreground">Atanmadı</span>}
                  </TableCell>
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
                  <TableCell>
                    {new Date(insp.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {insp.status === 'completed' ? (
                        <Button size="sm" variant="default" asChild>
                          <Link href={`/admin/inspections/${insp.id}/report`}>
                            <Eye className="mr-1 h-3 w-3" /> Rapor
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          <Clock className="mr-1 h-3 w-3" /> Bekliyor
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteInspection(insp)}
                        aria-label="Denetimi sil"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
