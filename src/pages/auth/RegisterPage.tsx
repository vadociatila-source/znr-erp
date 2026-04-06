import { useState } from 'react'
import { useLocation } from 'wouter'
import { Shield, Mail, Lock, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/index'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [, navigate] = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.fullName.trim()) e.fullName = 'Ime i prezime je obavezno'
    if (!form.email.includes('@')) e.email = 'Unesite ispravnu email adresu'
    if (form.password.length < 8) e.password = 'Lozinka mora imati najmanje 8 znakova'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Lozinke se ne podudaraju'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.fullName } },
      })
      if (error) throw error
      toast.success('Račun kreiran! Provjeri email za potvrdu.')
      navigate('/login')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Greška pri registraciji'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[var(--mg-500)] rounded-[12px] flex items-center justify-center shadow-2xl">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">ZNR ERP</h1>
            <p className="text-sm text-[var(--muted)]">Registracija</p>
          </div>
        </div>

        <div className="bg-[var(--surf)] rounded-[12px] border border-[var(--border)]  p-6">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-1">Novi račun</h2>
          <p className="text-sm text-[var(--muted)] mb-6">Kreirajte račun za vašu tvrtku</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Ime i prezime" type="text" value={form.fullName}
              onChange={update('fullName')} placeholder="Ivo Horvat"
              leftAddon={<User size={16} />} required error={errors.fullName} />
            <Input label="Email adresa" type="email" value={form.email}
              onChange={update('email')} placeholder="vas@email.hr"
              leftAddon={<Mail size={16} />} required error={errors.email} />
            <Input label="Lozinka" type="password" value={form.password}
              onChange={update('password')} placeholder="Minimum 8 znakova"
              leftAddon={<Lock size={16} />} required error={errors.password} />
            <Input label="Potvrda lozinke" type="password" value={form.confirmPassword}
              onChange={update('confirmPassword')} placeholder="Ponovi lozinku"
              leftAddon={<Lock size={16} />} required error={errors.confirmPassword} />

            <Button type="submit" className="w-full mt-2" isLoading={isLoading} size="lg">
              Registriraj se
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-[var(--border-s)] text-center">
            <p className="text-sm text-[var(--muted)]">
              Već imaš račun?{' '}
              <a href="/login" className="text-[var(--mg-500)] hover:underline font-medium">Prijava</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
