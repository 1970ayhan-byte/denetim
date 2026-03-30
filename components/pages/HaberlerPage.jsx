'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'

export function HaberlerPage() {
  const router = useRouter()
  const [news, setNews] = useState([])
  const [currentPageNum, setCurrentPageNum] = useState(1)
  const itemsPerPage = 15

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then(setNews)
  }, [])

  const totalPages = Math.ceil(news.length / itemsPerPage)
  const startIndex = (currentPageNum - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentNews = news.slice(startIndex, endIndex)

  const openArticle = (item) => {
    if (item.slug) router.push(`/haberler/${item.slug}`)
  }

  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Bizden Haberler</h1>
        <p className="text-center text-muted-foreground mb-12">Son gelişmeler ve duyurular</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {currentNews.map((item) => (
            <Card
              key={item.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => openArticle(item)}
            >
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded-t-lg" />
              )}
              <CardHeader>
                <CardTitle className="text-xl line-clamp-2">{item.title}</CardTitle>
                <CardDescription>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
                <Button variant="link" className="p-0 mt-2" asChild>
                  <Link href={item.slug ? `/haberler/${item.slug}` : '#'} onClick={(e) => e.stopPropagation()}>
                    Devamını Oku <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
              disabled={currentPageNum === 1}
            >
              Önceki
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPageNum === page ? 'default' : 'outline'}
                onClick={() => setCurrentPageNum(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => setCurrentPageNum((p) => Math.min(totalPages, p + 1))}
              disabled={currentPageNum === totalPages}
            >
              Sonraki
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
