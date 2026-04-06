// Sprint 011 — ZNR stručnjak multi-klijent dashboard
// Stručnjak vidi sve klijente s alarm indikatorima i može prebacivati između njih.

import { useState, useEffect } from 'react'
import { Building2, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, Badge, Spinner, Alert } from '@/components/ui/index'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth.store'
import { useTenantStore } from '@/store/tenant.store'
import type { ZnrSpecialistClient } from '@/types/tenant.types'

export default function SpecijalistDashboardPage() {
  const user = useAuthStore(s => s.user)
  const { switchTenant, activeTenant } = useTenantStore()
  const [clients, setClients] = useState<ZnrSpecialistClient[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    supabase
      .from('znr_specialist_clients')
      .select('*')
      .eq('specialist_user_id', user.id)
      .order('tenant_name')
      .then(({ data }) => {
        setClients((data ?? []) as unknown as ZnrSpecialistClient[])
        setIsLoading(false)
      })
  }, [user?.id])

  if (isLoading) {
    return <AppLayout title="Moji klijenti"><div className="flex justify-center py-12"><Spinner size="lg" /></div></AppLayout>
  }

  const activeClients = clients.filter(c => c.status === 'active')
  const pendingClients = clients.filter(c => c.status === 'pending')

  return (
    <AppLayout
      title="ZNR Stručnjak — Moji klijenti"
      breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Moji klijenti' }]}
    >
      {pendingClients.length > 0 && (
        <Alert variant="info" title="Pozivnice na čekanju" className="mb-6">
          Imate {pendingClients.length} pozivnica za prihvaćanje.
        </Alert>
      )}

      {activeClients.length === 0 && pendingClients.length === 0 && (
        <div className="text-center py-12 text-[var(--muted)]">
          <Building2 size={48} className="mx-auto mb-3 text-[var(--hint)]" />
          <p className="text-lg font-medium">Nemate klijenata</p>
          <p className="text-sm mt-1">Klijent vas mora pozvati iz svog ZNR ERP sustava.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(client => (
          <Card key={client.id} padding="lg" className={
            activeTenant?.id === client.tenant_id ? 'ring-2 ring-brand-500' : ''
          }>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-[var(--text)]">{client.tenant_name}</h3>
                <Badge variant={client.status === 'active' ? 'success' : 'info'} size="sm">
                  {client.status === 'active' ? 'Aktivan' : 'Na čekanju'}
                </Badge>
              </div>
              <Building2 size={20} className="text-[var(--hint)]" />
            </div>

            {client.status === 'active' && (
              <>
                <div className="flex items-center gap-4 text-sm mt-3">
                  {(client.critical_count ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-[var(--crit-acc)]">
                      <AlertTriangle size={14} /> {client.critical_count}
                    </span>
                  )}
                  {(client.urgent_count ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-[var(--warn-acc)]">
                      <Clock size={14} /> {client.urgent_count}
                    </span>
                  )}
                  {!client.critical_count && !client.urgent_count && (
                    <span className="flex items-center gap-1 text-[var(--ok-acc)]">
                      <CheckCircle size={14} /> Uredno
                    </span>
                  )}
                </div>

                <Button
                  variant={activeTenant?.id === client.tenant_id ? 'secondary' : 'primary'}
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => switchTenant(client.tenant_id)}
                >
                  {activeTenant?.id === client.tenant_id ? 'Aktivni klijent' : 'Prebaci se'}
                </Button>
              </>
            )}

            {client.status === 'pending' && (
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-4"
                onClick={async () => {
                  const rpc = supabase.rpc as unknown as (
                    fn: string, args: Record<string, unknown>
                  ) => Promise<{ error: { message: string } | null }>
                  const { error } = await rpc('accept_specialist_invite', { p_invite_id: client.id })
                  if (!error) {
                    setClients(cs => cs.map(c => c.id === client.id ? { ...c, status: 'active' as const } : c))
                  }
                }}
              >
                Prihvati pozivnicu
              </Button>
            )}
          </Card>
        ))}
      </div>
    </AppLayout>
  )
}
