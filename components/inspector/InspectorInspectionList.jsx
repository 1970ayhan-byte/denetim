'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
} from 'lucide-react'
import { toast as sonnerToast } from 'sonner'
import { fetchInspectorInspections } from './inspectorApi'

export function InspectorInspectionList({ token, user }) {
  const [inspections, setInspections] = useState([])

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
    loadInspections()
  }, [loadInspections])

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
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Denetim Paneli</h1>
          <p className="text-muted-foreground">Hoş geldiniz, {user.name}</p>
        </div>

        <h2 className="text-2xl font-bold mb-6">Denetimlerim ({inspections.length})</h2>

        {inspections.length === 0 ? (
          <Card className="p-12 text-center">
            <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Henüz atanmış denetim yok</h3>
            <p className="text-muted-foreground">Yönetici size denetim atadığında buradan görebileceksiniz</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inspections.map((insp) => (
              <Card key={insp.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{insp.schoolName}</CardTitle>
                      <CardDescription>
                        {insp.city?.name} / {insp.district}
                      </CardDescription>
                    </div>
                    {insp.status === 'completed' && (
                      <Badge variant="success" className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Tamamlandı
                      </Badge>
                    )}
                    {insp.status === 'in_progress' && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3 mr-1" /> Devam Ediyor
                      </Badge>
                    )}
                    {insp.status === 'pending' && <Badge variant="secondary">Bekliyor</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{insp.package?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(insp.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {insp.payment?.status === 'completed' ? (
                      <div className="pt-4 border-t">
                        {insp.status === 'pending' && (
                          <Button className="w-full" asChild>
                            <Link href={`/denetci/denetim/${insp.id}`}>
                              <Zap className="h-4 w-4 mr-2" />
                              Denetimi Başlat
                            </Link>
                          </Button>
                        )}
                        {insp.status === 'in_progress' && (
                          <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                            <Link href={`/denetci/denetim/${insp.id}?devam=1`}>
                              <ChevronRight className="h-4 w-4 mr-2" />
                              Denetime Devam Et
                            </Link>
                          </Button>
                        )}
                        {insp.status === 'completed' && (
                          <div className="space-y-2">
                            <Button className="w-full" variant="outline" disabled>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Tamamlandı
                            </Button>
                            {isEditable(insp.completedAt) && (
                              <div>
                                <Button
                                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                                  asChild
                                >
                                  <Link href={`/denetci/denetim/${insp.id}/duzenle`}>
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Düzenle
                                  </Link>
                                </Button>
                                <p className="text-xs text-center text-amber-600 mt-1">
                                  ⏱️ {getRemainingTime(insp.completedAt)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="pt-4 border-t">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-800 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Ödeme bekleniyor
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
