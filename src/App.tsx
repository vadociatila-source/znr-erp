import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useTenantStore } from '@/store/tenant.store'
import { useLegalStore } from '@/store/legal.store'
import { AppRouter } from '@/router'

export default function App() {
  const { initialize, user, isLoading } = useAuthStore()
  const { loadTenant, activeTenant } = useTenantStore()
  const { load: loadLegal } = useLegalStore()

  useEffect(() => { initialize() }, [initialize])

  useEffect(() => {
    if (user?.id) loadTenant(user.id)
  }, [user?.id, loadTenant])

  // legal_references je globalna tablica (ZZnR vrijedi za sve HR tvrtke)
  useEffect(() => {
    if (activeTenant) loadLegal()
  }, [activeTenant, loadLegal])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
          <p className="text-sm text-slate-500">Učitavanje...</p>
        </div>
      </div>
    )
  }

  return <AppRouter />
}
