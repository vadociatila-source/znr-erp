// Postavke — korisnici, uloge, dozvole, tenant info, zakonske reference
import { useState, useEffect } from 'react'
import { Users, Shield, Building2, Scale, Plus, Mail } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, Badge, Alert, Spinner } from '@/components/ui/index'
import { Input } from '@/components/ui/index'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { supabase } from '@/lib/supabase'
import { useTenantStore } from '@/store/tenant.store'
import { ROLE_PERMISSIONS } from '@/types/tenant.types'
import type { UserRole } from '@/types/tenant.types'
import type { LegalReference } from '@/types/legal.types'
import toast from 'react-hot-toast'

// ── Tab tipovi ──
type SettingsTab = 'tvrtka' | 'korisnici' | 'uloge' | 'zakoni' | 'automatizacija'

const TABS: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
  { id: 'tvrtka', label: 'Tvrtka', icon: <Building2 size={16} /> },
  { id: 'korisnici', label: 'Korisnici', icon: <Users size={16} /> },
  { id: 'uloge', label: 'Uloge i dozvole', icon: <Shield size={16} /> },
  { id: 'zakoni', label: 'Zakonske reference', icon: <Scale size={16} /> },
  { id: 'automatizacija', label: 'Automatizacija', icon: <Mail size={16} /> },
]

const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Vlasnik',
  hr: 'HR',
  znr_specialist: 'ZNR stručnjak',
  delegate: 'Povjerenik',
  worker: 'Djelatnik',
}

// ── Tvrtka tab ──
function TvrtkaTab() {
  const tenant = useTenantStore(s => s.activeTenant)
  const [form, setForm] = useState({
    name: tenant?.name ?? '',
    oib: tenant?.oib ?? '',
    industry: tenant?.industry ?? '',
    city: tenant?.city ?? '',
    address: tenant?.address ?? '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!tenant) return
    setSaving(true)
    const { error } = await supabase
      .from('tenants')
      .update({
        name: form.name.trim(),
        oib: form.oib.trim() || null,
        industry: form.industry.trim() || null,
        city: form.city.trim() || null,
        address: form.address.trim() || null,
      })
      .eq('id', tenant.id)
    setSaving(false)
    if (error) toast.error(error.message)
    else toast.success('Podaci tvrtke ažurirani')
  }

  return (
    <Card padding="lg">
      <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Podaci o tvrtki</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <Input label="Naziv tvrtke" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Input label="OIB" value={form.oib}
          onChange={e => setForm(f => ({ ...f, oib: e.target.value }))} />
        <Input label="Djelatnost" value={form.industry}
          onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} />
        <Input label="Grad" value={form.city}
          onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
        <Input label="Adresa" value={form.address}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <Button onClick={handleSave} isLoading={saving}>Spremi</Button>
        <div className="text-xs text-[var(--hint)]">
          Plan: <Badge variant="info">{tenant?.plan}</Badge> |
          Status: <Badge variant={tenant?.status === 'active' ? 'success' : 'warning'}>{tenant?.status}</Badge> |
          Trial do: {tenant?.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString('hr-HR') : '—'}
        </div>
      </div>
    </Card>
  )
}

// ── Korisnici tab ──
type TenantMemberRow = {
  id: string; user_id: string; role: string; is_external_specialist: boolean; created_at: string
  user_email: string
}

type PendingInvite = {
  id: string; email: string; role: string; expires_at: string; created_at: string
}

function KorisniciTab() {
  const tenant = useTenantStore(s => s.activeTenant)
  const [members, setMembers] = useState<TenantMemberRow[]>([])
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<string>('hr')
  const [inviting, setInviting] = useState(false)

  const loadData = async () => {
    if (!tenant) return
    setIsLoading(true)
    const [mRes, iRes] = await Promise.all([
      supabase.from('tenant_members_v').select('*').eq('tenant_id', tenant.id).order('created_at'),
      supabase.from('tenant_invitations').select('id,email,role,expires_at,created_at')
        .eq('tenant_id', tenant.id).is('accepted_at', null).order('created_at', { ascending: false }),
    ])
    setMembers((mRes.data ?? []) as TenantMemberRow[])
    setInvites((iRes.data ?? []) as PendingInvite[])
    setIsLoading(false)
  }

  useEffect(() => { loadData() }, [tenant?.id])

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast.error('Unesite ispravnu email adresu')
      return
    }
    setInviting(true)
    const { data, error } = await supabase.rpc('invite_user_by_email', {
      p_email: inviteEmail.trim(),
      p_role: inviteRole,
    })
    setInviting(false)
    if (error) {
      toast.error(error.message)
      return
    }
    const status = (data as { status?: string } | null)?.status
    if (status === 'added') toast.success('Korisnik dodan u tenant')
    else if (status === 'invited') toast.success('Pozivnica kreirana — korisnik se može registrirati na /register')
    setShowInvite(false)
    setInviteEmail('')
    setInviteRole('hr')
    loadData()
  }

  const handleCancelInvite = async (id: string) => {
    const { error } = await supabase.from('tenant_invitations').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      setInvites(is => is.filter(i => i.id !== id))
      toast.success('Pozivnica poništena')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('tenant_users')
      .update({ role: newRole })
      .eq('user_id', userId)
      .eq('tenant_id', tenant?.id ?? '')
    if (error) toast.error(error.message)
    else {
      setMembers(us => us.map(u => u.user_id === userId ? { ...u, role: newRole } : u))
      toast.success('Uloga ažurirana')
    }
  }

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <div className="space-y-4">
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--text)]">Korisnici ({members.length})</h3>
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowInvite(true)}>
            Pozovi korisnika
          </Button>
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Uloga</Table.HeaderCell>
              <Table.HeaderCell>Vanjski stručnjak</Table.HeaderCell>
              <Table.HeaderCell>Dodano</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {members.map(u => (
              <Table.Row key={u.id}>
                <Table.Cell>
                  <span className="text-sm text-[var(--text)]">{u.user_email}</span>
                </Table.Cell>
                <Table.Cell>
                  <Select
                    options={Object.entries(ROLE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                    value={u.role}
                    onChange={e => handleRoleChange(u.user_id, e.target.value)}
                  />
                </Table.Cell>
                <Table.Cell>
                  {u.is_external_specialist ? <Badge variant="purple">Da</Badge> : 'Ne'}
                </Table.Cell>
                <Table.Cell>
                  <span className="text-xs text-[var(--muted)]">
                    {new Date(u.created_at).toLocaleDateString('hr-HR')}
                  </span>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>

      {invites.length > 0 && (
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-[var(--text)] mb-4">
            Pozivnice na čekanju ({invites.length})
          </h3>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Uloga</Table.HeaderCell>
                <Table.HeaderCell>Istječe</Table.HeaderCell>
                <Table.HeaderCell>Akcije</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {invites.map(i => (
                <Table.Row key={i.id}>
                  <Table.Cell><span className="text-sm">{i.email}</span></Table.Cell>
                  <Table.Cell><Badge variant="info">{ROLE_LABELS[i.role as UserRole] ?? i.role}</Badge></Table.Cell>
                  <Table.Cell>
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(i.expires_at).toLocaleDateString('hr-HR')}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Button variant="ghost" size="sm" onClick={() => handleCancelInvite(i.id)}>
                      Poništi
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      )}

      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="Pozovi korisnika" size="sm"
        footer={<>
          <Button variant="outline" onClick={() => setShowInvite(false)}>Odustani</Button>
          <Button onClick={handleInvite} isLoading={inviting}>Pošalji pozivnicu</Button>
        </>}
      >
        <div className="space-y-4">
          <Input label="Email" type="email" value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)} placeholder="korisnik@email.hr" />
          <Select label="Uloga"
            options={Object.entries(ROLE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            value={inviteRole} onChange={e => setInviteRole(e.target.value)} />
          <Alert variant="info">
            Ako korisnik već ima ZNR ERP račun, odmah se dodaje u tvrtku.
            Ako nema, kreira se pozivnica (vrijedi 14 dana) — korisnik se registrira na <strong>/register</strong> s tim emailom i automatski postaje član tvrtke.
          </Alert>
        </div>
      </Modal>
    </div>
  )
}

// ── Uloge i dozvole tab ──
function UlogeTab() {
  return (
    <Card padding="lg">
      <h3 className="text-sm font-semibold text-[var(--text)] mb-4">Uloge i dozvole</h3>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Uloga</Table.HeaderCell>
            <Table.HeaderCell>Uređivanje</Table.HeaderCell>
            <Table.HeaderCell>Brisanje</Table.HeaderCell>
            <Table.HeaderCell>Upravljanje korisnicima</Table.HeaderCell>
            <Table.HeaderCell>Pregled svega</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {(Object.entries(ROLE_PERMISSIONS) as Array<[UserRole, typeof ROLE_PERMISSIONS[UserRole]]>).map(([role, perms]) => (
            <Table.Row key={role}>
              <Table.Cell>
                <span className="font-medium text-[var(--text)]">{ROLE_LABELS[role]}</span>
                <p className="text-xs text-[var(--hint)]">{role}</p>
              </Table.Cell>
              <Table.Cell>{perms.canEdit ? <Badge variant="success">Da</Badge> : <Badge>Ne</Badge>}</Table.Cell>
              <Table.Cell>{perms.canDelete ? <Badge variant="success">Da</Badge> : <Badge>Ne</Badge>}</Table.Cell>
              <Table.Cell>{perms.canManageUsers ? <Badge variant="success">Da</Badge> : <Badge>Ne</Badge>}</Table.Cell>
              <Table.Cell>{perms.canViewAll ? <Badge variant="success">Da</Badge> : <Badge>Ne</Badge>}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <p className="text-xs text-[var(--hint)] mt-4">
        Dozvole su definirane u kodu (ROLE_PERMISSIONS) i provode se kroz RLS politike u bazi.
        Za promjenu dozvola kontaktiraj administratora.
      </p>
    </Card>
  )
}

// ── Zakoni tab ──
function ZakoniTab() {
  const [refs, setRefs] = useState<LegalReference[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('legal_references')
      .select('*')
      .eq('is_active', true)
      .order('code')
      .then(({ data }) => {
        setRefs((data ?? []) as unknown as LegalReference[])
        setIsLoading(false)
      })
  }, [])

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text)]">Zakonske reference ({refs.length})</h3>
        <p className="text-xs text-[var(--hint)]">Globalna tablica — ZZnR vrijedi za sve HR tvrtke</p>
      </div>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Kod</Table.HeaderCell>
            <Table.HeaderCell>Članak</Table.HeaderCell>
            <Table.HeaderCell>Opis</Table.HeaderCell>
            <Table.HeaderCell>Rok</Table.HeaderCell>
            <Table.HeaderCell>NN</Table.HeaderCell>
            <Table.HeaderCell>Moduli</Table.HeaderCell>
            <Table.HeaderCell>Verificirano</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {refs.map(r => (
            <Table.Row key={r.id}>
              <Table.Cell><span className="font-mono text-xs">{r.code}</span></Table.Cell>
              <Table.Cell><Badge variant="info">{r.article ?? '—'}</Badge></Table.Cell>
              <Table.Cell><span className="text-xs">{r.description}</span></Table.Cell>
              <Table.Cell>
                <span className="text-xs">
                  {r.deadline_days ? `${r.deadline_days} dana` : '—'}
                  {r.deadline_description && <span className="block text-[var(--hint)]">{r.deadline_description}</span>}
                </span>
              </Table.Cell>
              <Table.Cell><span className="text-xs text-[var(--hint)]">{r.nn_number ?? '—'}</span></Table.Cell>
              <Table.Cell>
                <div className="flex gap-1 flex-wrap">
                  {r.module_codes.map(m => <Badge key={m} size="sm">{m}</Badge>)}
                </div>
              </Table.Cell>
              <Table.Cell>
                <span className="text-xs text-[var(--hint)]">
                  {r.last_verified ? new Date(r.last_verified).toLocaleDateString('hr-HR') : '—'}
                </span>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <Alert variant="info" className="mt-4">
        Zakonske reference ažurira administrator sustava kroz Supabase SQL Editor ili MCP.
        Kad se zakon promijeni, ažurira se samo ova tablica — bez deploymenta aplikacije.
        <strong className="block mt-1">CLAUDE.md Pravilo #3: NIKAD ne hard-kodiraj rokove u aplikacijski kod.</strong>
      </Alert>
    </Card>
  )
}

// ── Automatizacija tab ──
type AutoSettings = Record<string, unknown>

const AUTO_SECTIONS = [
  { key: 'health_check', title: '🩺 Zdravstveni pregledi', law: 'čl. 34 ZZnR',
    fields: ['recipient_medicine', 'recipient_hr', 'notify_worker'] },
  { key: 'fire_ext_service', title: '🧯 Vatrogasni aparati — Godišnji servis', law: 'Pr. NN 101/11 čl.7',
    fields: ['recipient_external', 'recipient_internal'] },
  { key: 'fire_ext_quarterly', title: '🧯 Vatrogasni aparati — Tromjesečni pregled', law: 'Pr. NN 101/11 čl.6',
    fields: ['recipient_internal'] },
  { key: 'fire_systems', title: '🔥 Stabilni ZOP sustavi', law: 'ZoZP čl.40 NN 92/10',
    fields: ['recipient_external', 'recipient_internal'] },
  { key: 'equipment', title: '⚙️ Radna oprema', law: 'PR-04 NN 16/16',
    fields: ['recipient_external', 'recipient_internal'] },
  { key: 'training', title: '📋 Osposobljavanja', law: 'čl. 27 ZZnR',
    fields: ['recipient_hr', 'notify_worker'] },
  { key: 'environment', title: '🌡️ Radni okoliš', law: 'PR-05',
    fields: ['recipient_external', 'recipient_internal'] },
  { key: 'ozo', title: '🦺 OZO', law: 'PR-06 NN 5/21',
    fields: ['recipient_hr', 'notify_worker'] },
  { key: 'evacuation', title: '🚨 Evakuacija', law: 'čl. 45 ZZnR',
    fields: ['recipient_internal'] },
]

function AutomatizacijaTab() {
  const tenant = useTenantStore(s => s.activeTenant)
  const [settings, setSettings] = useState<AutoSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!tenant) return
    supabase
      .from('automation_settings')
      .select('*')
      .eq('tenant_id', tenant.id)
      .single()
      .then(({ data }) => {
        setSettings((data as AutoSettings) ?? null)
        setIsLoading(false)
      })
  }, [tenant?.id])

  const handleSave = async () => {
    if (!tenant || !settings) return
    setSaving(true)
    const { error } = await supabase
      .from('automation_settings')
      .update(settings as never)
      .eq('tenant_id', tenant.id)
    setSaving(false)
    if (error) toast.error(error.message)
    else toast.success('Postavke automatizacije spremljene')
  }

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>
  if (!settings) return <Alert variant="warning">Nema postavki automatizacije za ovaj tenant.</Alert>

  const updateField = (key: string, value: unknown) => {
    setSettings(s => s ? { ...s, [key]: value } : s)
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <Alert variant="info">
        Automatizacija šalje email obavijesti i narudžbe kad se bliži rok isteka.
        Resend integracija (Faza 2) — za sad se postavke spremaju, emailovi će se slati kad se Edge Function implementira.
      </Alert>

      {AUTO_SECTIONS.map(sec => {
        const enabledKey = `${sec.key}_enabled`
        const daysKey = `${sec.key}_advance_days`
        const enabled = settings[enabledKey] as boolean

        return (
          <Card key={sec.key} padding="md">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-[var(--text)]">{sec.title}</h4>
                <p className="text-xs text-[var(--hint)]">{sec.law}</p>
              </div>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={enabled}
                  onChange={e => updateField(enabledKey, e.target.checked)}
                  className="rounded border-[var(--border)] text-[var(--mg-500)] focus:ring-[var(--border-f)]" />
                <span className="text-xs text-[var(--muted)]">{enabled ? 'Uključeno' : 'Isključeno'}</span>
              </label>
            </div>

            {enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <Input
                  label="Dana unaprijed"
                  type="number"
                  value={String(settings[daysKey] ?? 14)}
                  onChange={e => updateField(daysKey, Number(e.target.value))}
                  hint="Koliko dana prije isteka slati email"
                />
                {sec.fields.map(f => {
                  const fieldKey = `${sec.key}_${f}`
                  if (f === 'notify_worker') {
                    return (
                      <label key={fieldKey} className="inline-flex items-center gap-2 text-sm text-[var(--text)] self-end pb-2">
                        <input type="checkbox" checked={settings[fieldKey] as boolean ?? true}
                          onChange={e => updateField(fieldKey, e.target.checked)}
                          className="rounded border-[var(--border)] text-[var(--mg-500)] focus:ring-[var(--border-f)]" />
                        Pošalji i djelatniku
                      </label>
                    )
                  }
                  const label = f === 'recipient_medicine' ? 'Email medicine rada'
                    : f === 'recipient_hr' ? 'Email HR / ZNR'
                    : f === 'recipient_external' ? 'Email vanjskog izvođača'
                    : f === 'recipient_internal' ? 'Email internog odgovornog'
                    : f
                  return (
                    <Input key={fieldKey} label={label} type="email"
                      value={String(settings[fieldKey] ?? '')}
                      onChange={e => updateField(fieldKey, e.target.value)}
                      placeholder="email@primjer.hr" />
                  )
                })}
              </div>
            )}
          </Card>
        )
      })}

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} isLoading={saving}>Spremi postavke automatizacije</Button>
      </div>
    </div>
  )
}

// ── Main ──
export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('tvrtka')

  return (
    <AppLayout
      title="Postavke"
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Postavke' }]}
    >
      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)] mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id
                ? 'border-[var(--mg-500)] text-[var(--mg-500)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'tvrtka' && <TvrtkaTab />}
      {tab === 'korisnici' && <KorisniciTab />}
      {tab === 'uloge' && <UlogeTab />}
      {tab === 'zakoni' && <ZakoniTab />}
      {tab === 'automatizacija' && <AutomatizacijaTab />}
    </AppLayout>
  )
}
