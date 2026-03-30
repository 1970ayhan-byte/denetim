'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast as sonnerToast } from 'sonner'
import { useAuth } from '@/components/providers/AuthProvider'
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function GirisPage() {
  const router = useRouter()
  const { login, user, hydrated } = useAuth()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!hydrated) return
    if (user) {
      router.replace(user.role === 'admin' ? '/admin' : '/denetci')
    }
  }, [hydrated, user, router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })
      const result = await response.json()
      if (result.token) {
        login(result.token, result.user)
        sonnerToast.success('Giriş başarılı')
        router.push(result.user.role === 'admin' ? '/admin' : '/denetci')
      } else {
        sonnerToast.error(result.error || 'Giriş başarısız')
      }
    } catch {
      sonnerToast.error('Bağlantı hatası')
    } finally {
      setSubmitting(false)
    }
  }

  if (!hydrated || user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-zinc-100">
        <Loader2 className="h-10 w-10 animate-spin text-amber-600" aria-hidden />
        <span className="sr-only">Yükleniyor</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside
        className={cn(
          'relative flex flex-col justify-between overflow-hidden px-6 py-8 sm:px-10 sm:py-10 lg:w-[min(100%,28rem)] lg:flex-none lg:px-12 lg:py-14 xl:w-[32rem]',
          'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white',
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 shadow-lg shadow-amber-900/40 ring-1 ring-white/20">
            <ShieldCheck className="h-8 w-8 text-white" strokeWidth={2.25} aria-hidden />
          </div>
          <h1 className="mt-8 text-2xl font-bold tracking-tight sm:text-3xl">
            Sarımeşe Danışmanlık
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-300 sm:text-base">
            Denetçi ve yönetici hesapları bu sayfadan giriş yapar. Kurumsal anaokulu denetim süreçlerinizi
            güvenle yönetin.
          </p>
        </div>
        <p className="relative mt-10 text-xs text-zinc-500 lg:mt-0">
          © {new Date().getFullYear()} Sarımeşe Danışmanlık
        </p>
      </aside>

      <main className="relative flex flex-1 flex-col items-center justify-center bg-zinc-100 px-4 py-10 sm:px-8">
        <Link
          href="/"
          className={cn(
            'absolute left-4 top-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600',
            'transition-colors hover:bg-white hover:text-zinc-900 sm:left-6 sm:top-6',
            'touch-manipulation min-h-[44px]',
          )}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Ana siteye dön
        </Link>

        <div className="w-full max-w-md pt-10 sm:pt-6">
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xl shadow-zinc-900/10 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Personel girişi
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Telefon numaranız ve şifrenizle oturum açın.
            </p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-phone" className="text-zinc-800">
                  Telefon
                </Label>
                <Input
                  id="login-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="username"
                  placeholder="05xx xxx xx xx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="h-11 text-base sm:h-12 sm:text-[15px]"
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-zinc-800">
                  Şifre
                </Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 text-base sm:h-12 sm:text-[15px]"
                  disabled={submitting}
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-xl text-base font-semibold bg-amber-600 hover:bg-amber-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                    Giriş yapılıyor
                  </>
                ) : (
                  'Giriş yap'
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
