'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function HaberDetayPage({ slug }) {
  const router = useRouter()
  const [news, setNews] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/news/${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error || !data.id) {
          setError(true)
          return
        }
        setNews(data)
      })
      .catch(() => setError(true))
  }, [slug])

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground mb-4">Haber bulunamadı.</p>
        <Button asChild>
          <Link href="/haberler">Haberlere dön</Link>
        </Button>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" onClick={() => router.push('/haberler')} className="mb-6">
          ← Geri Dön
        </Button>

        {news.imageUrl && (
          <img src={news.imageUrl} alt={news.title} className="w-full h-96 object-cover rounded-lg mb-8" />
        )}

        <h1 className="text-4xl font-bold mb-4">{news.title}</h1>

        <div className="flex items-center gap-4 text-muted-foreground mb-8">
          <span>
            {new Date(news.createdAt).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="whitespace-pre-wrap">{news.content}</p>
        </div>

        {news.keywords && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="font-semibold mb-2">Etiketler:</h3>
            <div className="flex flex-wrap gap-2">
              {news.keywords.split(',').map((keyword, i) => (
                <Badge key={i} variant="secondary">
                  {keyword.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
