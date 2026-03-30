'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast as sonnerToast } from 'sonner'
import { useAuth } from '@/components/providers/AuthProvider'

export function GirisPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
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
  }

  return (
    <div className="py-20">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Giriş Yap</CardTitle>
            <CardDescription>Personel ve yönetici girişi</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label>Telefon</Label>
                <Input placeholder="05xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div>
                <Label>Şifre</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">
                Giriş Yap
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
