import { useState } from 'react'
import { useLocation } from 'wouter'
import { Shield, Mail, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/index'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [, navigate] = useLocation()
  const { signIn, isLoading } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signIn(email, password)
      toast.success('Dobrodošli!')
      navigate('/')
    } catch {
      setError('Pogrešan email ili lozinka. Pokušaj ponovo.')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[var(--mg-500)] rounded-[12px] flex items-center justify-center shadow-2xl">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">ZNR ERP</h1>
            <p className="text-sm text-[var(--muted)]">Zaštita na radu — digitalno</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[var(--surf)] rounded-[12px] border border-[var(--border)]  p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-1">Prijava</h2>
          <p className="text-sm text-[var(--muted)] mb-6">Unesite vaše podatke za pristup</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email adresa"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vas@email.hr"
              leftAddon={<Mail size={16} />}
              required
              autoComplete="email"
            />

            <Input
              label="Lozinka"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              leftAddon={<Lock size={16} />}
              required
              autoComplete="current-password"
              error={error}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              size="lg"
            >
              Prijava
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-[var(--border-s)] text-center">
            <p className="text-sm text-[var(--muted)]">
              Nemaš račun?{' '}
              <a href="/register" className="text-[var(--mg-500)] hover:underline font-medium">
                Registriraj se
              </a>
            </p>
          </div>
        </div>

        {/* Legal footer */}
        <p className="text-center text-xs text-[var(--hint)] mt-4">
          Sustav za upravljanje zaštitom na radu sukladan{' '}
          <span className="font-medium">ZZnR (NN 71/14)</span>
        </p>
      </div>
    </div>
  )
}
