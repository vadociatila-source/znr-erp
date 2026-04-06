// Sprint 002 — Onboarding wizard
// Novi korisnik kreira tvrtku (tenant) nakon registracije.
// Atomski: tenant + owner membership kroz RPC create_tenant_with_owner
// (SECURITY DEFINER, definiran u supabase/migrations/005_onboarding_rpc.sql)
//
// [ZAK] Tenant podaci potrebni za zakonsku evidenciju:
//  - OIB (za identifikaciju pri prijavi HZZO-u — čl. 62 ZZnR)
//  - employee_count (prag 50+ aktivira Odbor ZNR — čl. 70 ZZnR)
//  - industry (određuje posebne uvjete rada — PR-03 NN 5/84)

import { useState } from 'react'
import { useLocation } from 'wouter'
import { Shield, Building2, Hash, Users, Briefcase, MapPin, ArrowRight, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth.store'
import { useTenantStore } from '@/store/tenant.store'
import { Button } from '@/components/ui/Button'
import { Input, Card, Alert } from '@/components/ui/index'
import type { Tenant } from '@/types/tenant.types'

// ── Djelatnosti (NKD grubi presjek — proširiti kasnije) ─────────
const INDUSTRIES = [
  'Građevinarstvo',
  'Prerađivačka industrija',
  'Trgovina',
  'Ugostiteljstvo i turizam',
  'Transport i skladištenje',
  'Zdravstvo',
  'Obrazovanje',
  'IT i telekomunikacije',
  'Financijske usluge',
  'Javna uprava',
  'Poljoprivreda i šumarstvo',
  'Ostalo',
]

type WizardForm = {
  name: string
  oib: string
  industry: string
  employeeCount: string // string u formi, parse na submit
  city: string
  address: string
}

const EMPTY_FORM: WizardForm = {
  name: '',
  oib: '',
  industry: '',
  employeeCount: '',
  city: '',
  address: '',
}

export default function OnboardingPage() {
  const [, navigate] = useLocation()
  const user = useAuthStore(s => s.user)
  const loadTenant = useTenantStore(s => s.loadTenant)

  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<WizardForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof WizardForm, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const update = (field: keyof WizardForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(f => ({ ...f, [field]: e.target.value }))
      if (errors[field]) setErrors(er => ({ ...er, [field]: undefined }))
    }

  // ── Validation ───────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const e: Partial<Record<keyof WizardForm, string>> = {}
    if (!form.name.trim()) e.name = 'Naziv tvrtke je obavezan'
    if (form.oib.trim() && !/^[0-9]{11}$/.test(form.oib.trim())) {
      e.oib = 'OIB mora imati točno 11 znamenki'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = (): boolean => {
    const e: Partial<Record<keyof WizardForm, string>> = {}
    const count = Number(form.employeeCount)
    if (form.employeeCount.trim() === '' || Number.isNaN(count) || count < 0) {
      e.employeeCount = 'Unesite broj zaposlenika (0 ili više)'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ───────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!validateStep2()) return
    if (!user?.id) {
      setServerError('Niste prijavljeni. Prijavite se ponovo.')
      return
    }

    setSubmitting(true)
    setServerError(null)
    try {
      const { data, error } = await supabase.rpc('create_tenant_with_owner', {
        p_name: form.name.trim(),
        p_oib: form.oib.trim() || undefined,
        p_industry: form.industry || undefined,
        p_employee_count: Number(form.employeeCount),
        p_city: form.city.trim() || undefined,
        p_address: form.address.trim() || undefined,
      })

      if (error) throw error
      const tenant = data as Tenant | null
      if (!tenant) throw new Error('RPC nije vratio tenant')

      // Osvježi tenant store kako bi TenantRoute propustio dalje
      await loadTenant(user.id)
      toast.success(`Tvrtka "${tenant.name}" uspješno kreirana`)
      navigate('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Greška pri kreiranju tvrtke'
      setServerError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ── UI ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ZNR ERP</h1>
            <p className="text-sm text-slate-500">Postavljanje tvrtke</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map(n => (
            <div
              key={n}
              className={`h-1.5 w-16 rounded-full transition-colors ${
                step >= (n as 1 | 2) ? 'bg-brand-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        <Card padding="lg">
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Podaci o tvrtki</h2>
              <p className="text-sm text-slate-500 mb-6">
                Osnovne informacije potrebne za zakonsku evidenciju ZNR.
              </p>

              <div className="space-y-4">
                <Input
                  label="Naziv tvrtke"
                  value={form.name}
                  onChange={update('name')}
                  placeholder="npr. Primjer d.o.o."
                  leftAddon={<Building2 size={16} />}
                  required
                  error={errors.name}
                />

                <Input
                  label="OIB"
                  value={form.oib}
                  onChange={update('oib')}
                  placeholder="12345678901"
                  leftAddon={<Hash size={16} />}
                  maxLength={11}
                  inputMode="numeric"
                  error={errors.oib}
                  hint="11 znamenki — potreban za prijavu ozljede HZZO-u (čl. 62 ZZnR)"
                />

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Djelatnost</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <Briefcase size={16} />
                    </div>
                    <select
                      value={form.industry}
                      onChange={update('industry')}
                      className="w-full rounded-lg border border-slate-300 bg-white text-sm pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    >
                      <option value="">-- Odaberi --</option>
                      {INDUSTRIES.map(i => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <span />
                <Button
                  type="button"
                  onClick={() => validateStep1() && setStep(2)}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Dalje
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Veličina i lokacija</h2>
              <p className="text-sm text-slate-500 mb-6">
                Prag 50+ zaposlenika aktivira obvezu Odbora ZNR (čl. 70 ZZnR).
              </p>

              <div className="space-y-4">
                <Input
                  label="Broj zaposlenika"
                  type="number"
                  min={0}
                  value={form.employeeCount}
                  onChange={update('employeeCount')}
                  placeholder="npr. 12"
                  leftAddon={<Users size={16} />}
                  required
                  error={errors.employeeCount}
                  hint="Određuje plan pretplate (micro / small / medium / large)"
                />

                <Input
                  label="Grad"
                  value={form.city}
                  onChange={update('city')}
                  placeholder="npr. Zagreb"
                  leftAddon={<MapPin size={16} />}
                />

                <Input
                  label="Adresa"
                  value={form.address}
                  onChange={update('address')}
                  placeholder="Ulica i broj"
                  leftAddon={<MapPin size={16} />}
                />
              </div>

              {serverError && (
                <div className="mt-4">
                  <Alert variant="danger" title="Greška">{serverError}</Alert>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  leftIcon={<ArrowLeft size={16} />}
                  disabled={submitting}
                >
                  Natrag
                </Button>
                <Button
                  type="button"
                  onClick={handleCreate}
                  isLoading={submitting}
                >
                  Kreiraj tvrtku
                </Button>
              </div>
            </>
          )}
        </Card>

        <p className="text-center text-xs text-slate-400 mt-4">
          Prijavljeni kao: <span className="font-medium">{user?.email ?? '—'}</span>
        </p>
      </div>
    </div>
  )
}
