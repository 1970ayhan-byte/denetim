'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, BookOpen, GripVertical } from 'lucide-react'
import { toast as sonnerToast } from 'sonner'
import { cn } from '@/lib/utils'

function SortableQuestionRow({ item, index, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm transition-shadow',
        isDragging && 'z-10 border-amber-300 shadow-md ring-2 ring-amber-200/60',
      )}
    >
      <button
        type="button"
        className="mt-0.5 flex h-9 w-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100 active:cursor-grabbing"
        aria-label="Sürükleyerek sırayı değiştir"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md bg-zinc-100 px-1.5 text-xs font-semibold tabular-nums text-zinc-700">
            {index + 1}
          </span>
          {item.penaltyType && item.penaltyType !== 'none' && (
            <Badge variant="destructive" className="text-xs">
              {item.penaltyType}
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium leading-snug text-zinc-900">{item.question}</p>
        {item.regulationText ? (
          <p className="line-clamp-2 text-xs text-zinc-500">{item.regulationText}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-start">
        <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => onEdit(item)}>
          <Edit2 className="h-3.5 w-3.5 sm:mr-1" />
          <span className="hidden sm:inline">Düzenle</span>
        </Button>
        <Button size="sm" variant="destructive" className="h-8 px-2" onClick={() => onDelete(item.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export function QuestionsTab({ token }) {
  const [questions, setQuestions] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [localQuestions, setLocalQuestions] = useState([])
  const [showDialog, setShowDialog] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({
    categoryId: '',
    question: '',
    regulationText: '',
    imageUrl: '',
    penaltyType: 'none',
  })

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [categories],
  )

  const questionsByCategory = useMemo(() => {
    const map = new Map()
    for (const c of categories) map.set(c.id, [])
    for (const q of questions) {
      if (!map.has(q.categoryId)) map.set(q.categoryId, [])
      map.get(q.categoryId).push(q)
    }
    for (const [, list] of map) {
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    }
    return map
  }, [questions, categories])

  const serverListForCategory = useMemo(() => {
    if (!selectedCategoryId) return []
    return [...(questionsByCategory.get(selectedCategoryId) || [])]
  }, [selectedCategoryId, questionsByCategory])

  const loadQuestions = useCallback(async () => {
    const response = await fetch('/api/admin/questions', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    if (!response.ok) {
      sonnerToast.error(data.error || 'Sorular yüklenemedi')
      setQuestions([])
      return
    }
    setQuestions(Array.isArray(data) ? data : [])
  }, [token])

  useEffect(() => {
    fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : [])
      })
    loadQuestions()
  }, [token, loadQuestions])

  useEffect(() => {
    setLocalQuestions(serverListForCategory)
  }, [serverListForCategory])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const persistReorder = async (categoryId, orderedIds) => {
    const res = await fetch('/api/admin/questions/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ categoryId, orderedIds }),
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      sonnerToast.error(payload.error || 'Sıra kaydedilemedi')
      await loadQuestions()
      return
    }
    await loadQuestions()
  }

  const handleDragEnd = (event) => {
    if (!selectedCategoryId) return
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = localQuestions.findIndex((q) => q.id === active.id)
    const newIndex = localQuestions.findIndex((q) => q.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(localQuestions, oldIndex, newIndex)
    setLocalQuestions(next)
    void persistReorder(
      selectedCategoryId,
      next.map((q) => q.id),
    )
  }

  const handleSave = async () => {
    if (!formData.categoryId || !formData.question) {
      sonnerToast.error('Kategori ve soru zorunludur')
      return
    }

    const url = editItem ? `/api/admin/questions/${editItem.id}` : '/api/admin/questions'
    const method = editItem ? 'PUT' : 'POST'
    const sameCatCount = questions.filter((x) => x.categoryId === formData.categoryId).length
    const body = editItem
      ? { ...formData }
      : { ...formData, order: sameCatCount }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      sonnerToast.error(payload.error || 'İşlem başarısız')
      return
    }
    sonnerToast.success(editItem ? 'Güncellendi' : 'Eklendi')
    setShowDialog(false)
    setEditItem(null)
    setFormData({
      categoryId: selectedCategoryId || '',
      question: '',
      regulationText: '',
      imageUrl: '',
      penaltyType: 'none',
    })
    loadQuestions()
  }

  const handleDelete = async (id) => {
    if (!confirm('Silmek istediğinizden emin misiniz?')) return
    const res = await fetch(`/api/admin/questions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      sonnerToast.error(payload.error || 'Silinemedi')
      return
    }
    sonnerToast.success('Silindi')
    loadQuestions()
  }

  const handleEdit = (item) => {
    setEditItem(item)
    setFormData({
      categoryId: item.categoryId,
      question: item.question,
      regulationText: item.regulationText || '',
      imageUrl: item.imageUrl || '',
      penaltyType: item.penaltyType || 'none',
    })
    setShowDialog(true)
  }

  const openNewQuestion = () => {
    setEditItem(null)
    setFormData({
      categoryId: selectedCategoryId || '',
      question: '',
      regulationText: '',
      imageUrl: '',
      penaltyType: 'none',
    })
    setShowDialog(true)
  }

  const activeCategoryName = sortedCategories.find((c) => c.id === selectedCategoryId)?.name

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Denetim soruları</h2>
        <p className="mt-1 max-w-2xl text-sm text-zinc-600">
          Kategori seçin; sorular dikey listede görünür. Sırayı değiştirmek için sol tutamacı
          sürükleyip bırakın. Yeni soru eklemek için önce bir kategori seçmelisiniz.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <Card className="h-fit border-zinc-200 shadow-sm">
          <CardContent className="p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Kategoriler
            </p>
            <div className="flex max-h-[min(72vh,560px)] flex-col gap-1.5 overflow-y-auto pr-1">
              {sortedCategories.map((cat) => {
                const count = (questionsByCategory.get(cat.id) || []).length
                const active = selectedCategoryId === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors',
                      active
                        ? 'border-amber-400 bg-amber-50 text-amber-950 shadow-sm'
                        : 'border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50',
                    )}
                  >
                    <span className="min-w-0 truncate">{cat.name}</span>
                    <Badge variant="secondary" className="shrink-0 tabular-nums">
                      {count}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[320px] border-zinc-200 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
            {!selectedCategoryId ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center text-zinc-500">
                <BookOpen className="h-12 w-12 opacity-35" aria-hidden />
                <p className="max-w-sm text-sm">
                  Soldan bir kategori seçerek bu başlıktaki soruları listeleyin ve sıralayın.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 border-b border-zinc-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900">{activeCategoryName}</h3>
                    <p className="text-xs text-zinc-500">
                      {localQuestions.length} soru · Tutamacı sürükleyerek sırayı değiştirin
                    </p>
                  </div>
                  <Button onClick={openNewQuestion} className="shrink-0">
                    <Plus className="mr-2 h-4 w-4" /> Yeni soru
                  </Button>
                </div>

                {localQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <p className="text-sm text-zinc-500">Bu kategoride henüz soru yok.</p>
                    <Button size="sm" onClick={openNewQuestion}>
                      <Plus className="mr-2 h-4 w-4" /> İlk soruyu ekle
                    </Button>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={localQuestions.map((q) => q.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <ul className="flex list-none flex-col gap-2.5 p-0">
                        {localQuestions.map((q, i) => (
                          <li key={q.id}>
                            <SortableQuestionRow
                              item={q}
                              index={i}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                            />
                          </li>
                        ))}
                      </ul>
                    </SortableContext>
                  </DndContext>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Soru düzenle' : 'Yeni soru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Kategori *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {sortedCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Denetim sorusu *</Label>
              <Textarea
                rows={3}
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Örn: Yangın söndürme tüplerinin periyodik kontrolleri yapılmış mı?"
              />
            </div>
            <div>
              <Label>Yönetmelik açıklaması</Label>
              <Textarea
                rows={3}
                value={formData.regulationText}
                onChange={(e) => setFormData({ ...formData, regulationText: e.target.value })}
                placeholder="İlgili yönetmelik maddesi"
              />
            </div>
            <div>
              <Label>Görsel URL</Label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Ceza gerekliliği</Label>
              <Select
                value={formData.penaltyType}
                onValueChange={(val) => setFormData({ ...formData, penaltyType: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok</SelectItem>
                  <SelectItem value="idari_para_cezasi">İdari para cezası</SelectItem>
                  <SelectItem value="uyarı">Uyarı</SelectItem>
                  <SelectItem value="kınama">Kınama</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full">
              Kaydet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
