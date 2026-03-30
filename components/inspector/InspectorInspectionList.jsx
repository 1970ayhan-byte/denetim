'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Package,
  ChevronRight,
  Edit2,
  AlertCircle,
  Zap,
  RefreshCw,
  LayoutGrid,
  CopyPlus,
} from 'lucide-react'
import { toast as sonnerToast } from 'sonner'
import { fetchInspectorInspections, postInspectorReinspect } from './inspectorApi'
import { cn } from '@/lib/utils'

const FILTERS = [
  { id: 'all', label: 'Tümü' },
  { id: 'pending', label: 'Bekleyen' },
  { id: 'in_progress', label: 'Devam eden' },
  { id: 'completed', label: 'Tamamlanan' },
]

export function InspectorInspectionList({ token, user }) {
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [duplicatingId, setDuplicatingId] = useState(null)

  const loadInspections = useCallback(async () => {
    const { ok, inspections: list, error } = await fetchInspectorInspections(token)
    if (!ok) {
      sonnerToast.error(error)
      setInspections([])
      return
    }
    setInspections(list)
  }, [token])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      await loadInspections()
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [loadInspections])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadInspections()
    setRefreshing(false)
  }

  const onReinspect = async (sourceId) => {
    const okConfirm = window.confirm(
      'Aynı okul ve paket bilgisiyle yeni bir denetim oluşturulacak; tüm soru cevapları boş başlayacak. Devam edilsin mi?',
    )
    if (!okConfirm) return
    setDuplicatingId(sourceId)
    try {
      const { ok, error } = await postInspectorReinspect(token, sourceId)
      if (!ok) {
        sonnerToast.error(error)
        return
      }
      sonnerToast.success('Yeni denetim oluşturuldu. Listede “Bekleyen” olarak görünür.')
      await loadInspections()
    } finally {
      setDuplicatingId(null)
    }
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return inspections
    return inspections.filter((i) => i.status === filter)
  }, [inspections, filter])

  const counts = useMemo(() => {
    return {
      all: inspections.length,
      pending: inspections.filter((i) => i.status === 'pending').length,
      in_progress: inspections.filter((i) => i.status === 'in_progress').length,
      completed: inspections.filter((i) => i.status === 'completed').length,
    }
  }, [inspections])

  const isEditable = (completedAt) => {
    if (!completedAt) return false
    const diffHours = (Date.now() - new Date(completedAt).getTime()) / (1000 * 60 * 60)
    return diffHours <= 6
  }

  const getRemainingTime = (completedAt) => {
    if (!completedAt) return null
    const deadline = new Date(new Date(completedAt).getTime() + 6 * 60 * 60 * 1000)
    const diffMs = deadline - Date.now()
    if (diffMs <= 0) return null
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}s ${minutes}dk kaldı`
  }

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] w-full max-w-full overflow-x-hidden bg-gradient-to-b from-zinc-50 to-zinc-100/80 pb-8 md:pb-10">
      {/* Yapışkan tablet araç çubuğu — PanelsHeader 14 (3.5rem) altında */}
      <div className="sticky top-14 z-30 w-full overflow-x-hidden border-b border-zinc-200/90 bg-white/95 shadow-sm shadow-zinc-900/5 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto w-full max-w-6xl min-w-0 px-4 sm:px-6 md:px-8 py-3 md:py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 truncate">
                Denetimlerim
              </h1>
              <p className="text-sm md:text-base text-zinc-600 mt-0.5 truncate">
                Hoş geldiniz, <span className="font-medium text-zinc-800">{user.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="default"
                className="h-11 min-w-[44px] px-4 touch-manipulation"
                onClick={onRefresh}
                disabled={refreshing || loading}
                aria-label="Listeyi yenile"
              >
                <RefreshCw className={cn('h-4 w-4 sm:mr-2', refreshing && 'animate-spin')} />
                <span className="hidden sm:inline">Yenile</span>
              </Button>
            </div>
          </div>

          <div
            className="mt-3 md:mt-4 flex min-w-0 gap-2 overflow-x-auto pb-1 snap-x snap-mandatory md:flex-wrap md:overflow-visible [scrollbar-width:thin]"
            role="tablist"
            aria-label="Denetim filtresi"
          >
            {FILTERS.map(({ id, label }) => (
              <Button
                key={id}
                type="button"
                variant={filter === id ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'h-10 min-h-[44px] shrink-0 snap-start rounded-full px-4 text-sm touch-manipulation',
                  filter === id && 'bg-amber-600 hover:bg-amber-700 shadow-sm',
                )}
                onClick={() => setFilter(id)}
                role="tab"
                aria-selected={filter === id}
              >
                {label}
                <span
                  className={cn(
                    'ml-1.5 tabular-nums rounded-md px-1.5 py-0.5 text-xs font-semibold',
                    filter === id ? 'bg-white/20' : 'bg-zinc-100 text-zinc-700',
                  )}
                >
                  {counts[id] ?? 0}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl min-w-0 px-4 sm:px-6 md:px-8 py-5 md:py-8">
        {loading ? (
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-40 min-w-0 rounded-xl border border-zinc-200 bg-white animate-pulse sm:h-44"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="rounded-2xl border-zinc-200/80 shadow-md shadow-zinc-900/5 p-10 md:p-14 text-center max-w-lg mx-auto">
            <div className="mx-auto flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-zinc-100 mb-5">
              <ClipboardList className="h-8 w-8 md:h-10 md:w-10 text-zinc-400" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-zinc-900 mb-2">
              {inspections.length === 0
                ? 'Henüz atanmış denetim yok'
                : 'Bu filtreye uygun denetim yok'}
            </h3>
            <p className="text-sm md:text-base text-zinc-600 leading-relaxed">
              {inspections.length === 0
                ? 'Yönetici size denetim atadığında buradan görebilir ve tabletten kolayca başlatabilirsiniz.'
                : 'Farklı bir filtre seçin veya listeyi yenileyin.'}
            </p>
          </Card>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4 md:mb-5 md:text-base">
              <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                <strong className="text-zinc-800 font-semibold">{filtered.length}</strong> denetim
                {filter !== 'all' && ' (filtreli)'}
              </span>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5">
              {filtered.map((insp) => (
                <Card
                  key={insp.id}
                  className={cn(
                    'w-full min-w-0 max-w-full overflow-hidden rounded-xl border-zinc-200/90 shadow-sm shadow-zinc-900/[0.04] transition-shadow',
                    'hover:border-zinc-300/90 hover:shadow-md touch-manipulation',
                  )}
                >
                  <CardContent className="p-4 sm:p-4 md:p-5">
                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-2 gap-y-2">
                      <div className="min-w-0 flex-1 basis-[min(100%,14rem)]">
                        <CardTitle className="text-base font-semibold leading-snug text-zinc-900 break-words line-clamp-2 sm:text-lg">
                          {insp.schoolName}
                        </CardTitle>
                        <CardDescription className="mt-0.5 break-words text-xs text-zinc-600 line-clamp-2 sm:text-sm">
                          {[insp.city?.name, insp.district].filter(Boolean).join(' / ') || '—'}
                        </CardDescription>
                      </div>
                      <div className="shrink-0">
                        {insp.status === 'completed' && (
                          <Badge className="h-6 gap-1 px-2 py-0 text-[11px] font-medium bg-emerald-100 text-emerald-900 border-0 sm:h-7 sm:text-xs">
                            <CheckCircle2 className="h-3 w-3 shrink-0" /> Bitti
                          </Badge>
                        )}
                        {insp.status === 'in_progress' && (
                          <Badge className="h-6 gap-1 px-2 py-0 text-[11px] font-medium bg-sky-100 text-sky-900 border-0 sm:h-7 sm:text-xs">
                            <Clock className="h-3 w-3 shrink-0" /> Devam
                          </Badge>
                        )}
                        {insp.status === 'pending' && (
                          <Badge variant="secondary" className="h-6 px-2 py-0 text-[11px] font-medium sm:h-7 sm:text-xs">
                            Bekliyor
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex min-w-0 flex-wrap gap-x-4 gap-y-1 border-t border-zinc-100 pt-3 text-xs text-zinc-600 sm:text-[13px]">
                      <span className="inline-flex min-w-0 max-w-full items-start gap-1.5">
                        <Package className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
                        <span className="min-w-0 break-words leading-snug line-clamp-2">{insp.package?.name ?? '—'}</span>
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1.5 text-zinc-500">
                        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {new Date(insp.createdAt).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2">
                      {insp.payment?.status === 'completed' ? (
                        <>
                          {insp.status === 'pending' && (
                            <Button size="sm" className="h-9 gap-1.5 rounded-lg px-3 text-sm font-medium" asChild>
                              <Link href={`/denetci/denetim/${insp.id}`}>
                                <Zap className="h-4 w-4" />
                                Başlat
                              </Link>
                            </Button>
                          )}
                          {insp.status === 'in_progress' && (
                            <Button
                              size="sm"
                              className="h-9 gap-1.5 rounded-lg bg-sky-600 px-3 text-sm font-medium hover:bg-sky-700"
                              asChild
                            >
                              <Link href={`/denetci/denetim/${insp.id}?devam=1`}>
                                <ChevronRight className="h-4 w-4" />
                                Devam et
                              </Link>
                            </Button>
                          )}
                          {insp.status === 'completed' && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 gap-1.5 rounded-lg px-3 text-sm"
                                disabled={duplicatingId === insp.id}
                                onClick={() => onReinspect(insp.id)}
                              >
                                <CopyPlus className={cn('h-4 w-4', duplicatingId === insp.id && 'animate-pulse')} />
                                {duplicatingId === insp.id ? 'Bekleyin…' : 'Yeniden denetle'}
                              </Button>
                              {isEditable(insp.completedAt) && (
                                <>
                                  <Button
                                    size="sm"
                                    className="h-9 gap-1.5 rounded-lg bg-amber-500 px-3 text-sm font-medium text-white hover:bg-amber-600"
                                    asChild
                                  >
                                    <Link href={`/denetci/denetim/${insp.id}/duzenle`}>
                                      <Edit2 className="h-4 w-4" />
                                      Düzenle
                                    </Link>
                                  </Button>
                                  {getRemainingTime(insp.completedAt) ? (
                                    <span className="w-full basis-full text-[11px] font-medium text-amber-800 sm:text-xs">
                                      {getRemainingTime(insp.completedAt)}
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <p className="flex min-w-0 items-start gap-2 text-xs leading-snug text-amber-900">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          Ödeme bekleniyor — denetim başlatılamaz.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
