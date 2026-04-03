'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/AuthProvider'
import { InspectionReportContent } from '@/components/admin/InspectionReportContent'

export default function AdminInspectionReportPage() {
  const params = useParams()
  const id = params?.id
  const { token } = useAuth()
  const [fullReportData, setFullReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadReport = useCallback(async (opts) => {
    const silent = opts?.silent
    if (!id || !token) {
      setLoading(false)
      return
    }
    if (!silent) {
      setLoading(true)
    }
    setError(null)
    try {
      const response = await fetch(`/api/admin/inspection/${id}/report`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Rapor yüklenemedi')
        setFullReportData(null)
        return
      }
      setFullReportData(data)
    } catch {
      setError('Bağlantı hatası')
      setFullReportData(null)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [id, token])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  const notCompleted = fullReportData?.inspection?.status && fullReportData.inspection.status !== 'completed'

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/inspections">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Denetimlere dön
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Denetim Raporu</h1>
      </div>

      {!token && (
        <p className="text-muted-foreground text-sm">Oturum gerekli.</p>
      )}

      {loading && token && <p className="text-muted-foreground">Yükleniyor...</p>}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm">
          {error}
        </div>
      )}

      {notCompleted && fullReportData && (
        <div
          className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
          role="status"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Bu denetim henüz tamamlanmadı.</p>
            <p className="mt-1 text-amber-900/90">
              Rapor taslağı aşağıda görüntüleniyor; tamamlanan denetimler için kullanım önerilir.
            </p>
          </div>
        </div>
      )}

      {fullReportData && !error && (
        <div>
          <p className="text-muted-foreground text-sm mb-4">
            {fullReportData.inspection?.schoolName} — {fullReportData.generatedAt}
          </p>
          <InspectionReportContent
            fullReportData={fullReportData}
            token={token}
            inspectionId={id}
            onReportRefresh={() => loadReport({ silent: true })}
          />
        </div>
      )}
    </div>
  )
}
