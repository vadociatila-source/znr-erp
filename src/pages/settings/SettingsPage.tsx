// Postavke — korisnici, uloge, dozvole, tenant info, zakonske reference
import { useState, useEffect } from 'react'
import { Users, Shield, Building2, Scale, Plus } from 'lucide-react'
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
type SettingsTab = 'tvrtka' | 'korisnici' | 'uloge' | 'zakoni'

const TABS: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
  { id: 'tvrtka', label: 'Tvrtka', icon: <Building2 size={16} /> },
  { id: 'korisnici', label: 'Korisnici', icon: <Users size={16} /> },
  { id: 'uloge', label: 'Uloge i dozvole', icon: <Shield size={16} /> },
  { id: 'zakoni', label: 'Zakonske reference', icon: <Scale size={16} /> },
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
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Podaci o tvrtki</h3>
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
        <div className="text-xs text-slate-400">
          Plan: <Badge variant="info">{tenant?.plan}</Badge> |
          Status: <Badge variant={tenant?.status === 'active' ? 'success' : 'warning'}>{tenant?.status}</Badge> |
          Trial do: {tenant?.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString('hr-HR') : '—'}
        </div>
      </div>
    </Card>
  )
}

// ── Korisnici tab ──
type TenantUserRow = {
  id: string; user_id: string; role: string; is_external_specialist: boolean; created_at: string
  user_email?: string
}

function KorisniciTab() {
  const tenant = useTenantStore(s => s.activeTenant)
  const [users, setUsers] = useState<TenantUserRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<string>('hr')
  const [inviting] = useState(false)

  useEffect(() => {
    if (!tenant) return
    supabase
      .from('tenant_users')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('created_at')
      .then(({ data }) => {
        setUsers((data ?? []) as TenantUserRow[])
        setIsLoading(false)
      })
  }, [tenant?.id])

  const handleInvite = async () => {
    // Za sad: placeholder — pravi invite flow zahtijeva Supabase Edge Function
    // za slanje email pozivnice. Ovdje samo dodajemo u tenant_users ako user postoji.
    toast.error('Email pozivnice zahtijevaju Resend integraciju (Faza 2). Korisnik se mora sam registrirati.')
    setShowInvite(false)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('tenant_users')
      .update({ role: newRole })
      .eq('user_id', userId)
      .eq('tenant_id', tenant?.id ?? '')
    if (error) toast.error(error.message)
    else {
      setUsers(us => us.map(u => u.user_id === userId ? { ...u, role: newRole } : u))
      toast.success('Uloga ažurirana')
    }
  }

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>

  return (
    <>
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Korisnici ({users.length})</h3>
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setShowInvite(true)}>
            Pozovi korisnika
          </Button>
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>User ID</Table.HeaderCell>
              <Table.HeaderCell>Uloga</Table.HeaderCell>
              <Table.HeaderCell>Vanjski stručnjak</Table.HeaderCell>
              <Table.HeaderCell>Dodano</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users.map(u => (
              <Table.Row key={u.id}>
                <Table.Cell>
                  <span className="font-mono text-xs">{u.user_id.slice(0, 8)}...</span>
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
                  <span className="text-xs text-slate-500">
                    {new Date(u.created_at).toLocaleDateString('hr-HR')}
                  </span>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card>

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
            Korisnik mora imati ZNR ERP račun. Ako nema, mora se prvo registrirati.
          </Alert>
        </div>
      </Modal>
    </>
  )
}

// ── Uloge i dozvole tab ──
function UlogeTab() {
  return (
    <Card padding="lg">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Uloge i dozvole</h3>
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
                <span className="font-medium text-slate-900">{ROLE_LABELS[role]}</span>
                <p className="text-xs text-slate-400">{role}</p>
              </Table.Cell>
              <Table.Cell>{perms.canEdit ? <Badge variant="success">Da</Badge> : <Badge>Ne</Badge>}</Table.Cell>
              <Table.Cell>{perms.canDelete ? <Badge variant="success">Da</Badge> : <Badge>Ne</Badge>}</Table.Cell>
              <Table.Cell>{perms.canManageUsers ? <Badge variant="success">Da</Badge> : <Badge>Ne</Badge>}</Table.Cell>
              <Table.Cell>{perms.canViewAll ? <Badge variant="success">Da</Badge> : <Badge>Ne</Badge>}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <p className="text-xs text-slate-400 mt-4">
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
        <h3 className="text-sm font-semibold text-slate-900">Zakonske reference ({refs.length})</h3>
        <p className="text-xs text-slate-400">Globalna tablica — ZZnR vrijedi za sve HR tvrtke</p>
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
                  {r.deadline_description && <span className="block text-slate-400">{r.deadline_description}</span>}
                </span>
              </Table.Cell>
              <Table.Cell><span className="text-xs text-slate-400">{r.nn_number ?? '—'}</span></Table.Cell>
              <Table.Cell>
                <div className="flex gap-1 flex-wrap">
                  {r.module_codes.map(m => <Badge key={m} size="sm">{m}</Badge>)}
                </div>
              </Table.Cell>
              <Table.Cell>
                <span className="text-xs text-slate-400">
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

// ── Main ──
export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('tvrtka')

  return (
    <AppLayout
      title="Postavke"
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Postavke' }]}
    >
      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
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
    </AppLayout>
  )
}
