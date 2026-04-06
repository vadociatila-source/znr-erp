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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ZNR ERP</h1>
            <p className="text-sm text-slate-500">Zaštita na radu — digitalno</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Prijava</h2>
          <p className="text-sm text-slate-500 mb-6">Unesite vaše podatke za pristup</p>

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

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Nemaš račun?{' '}
              <a href="/register" className="text-brand-600 hover:underline font-medium">
                Registriraj se
              </a>
            </p>
          </div>
        </div>

        {/* Legal footer */}
        <p className="text-center text-xs text-slate-400 mt-4">
          Sustav za upravljanje zaštitom na radu sukladan{' '}
          <span className="font-medium">ZZnR (NN 71/14)</span>
        </p>
      </div>
    </div>
  )
}
