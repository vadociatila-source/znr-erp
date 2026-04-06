// Wouter router — sve rute aplikacije
// Wouter je minimalistički router (< 2kb), savršen za naš stack

import { Switch, Route, Redirect } from 'wouter'
import { useAuthStore } from '@/store/auth.store'
import { useTenantStore } from '@/store/tenant.store'

// Lazy imports (code splitting po modulu)
import { lazy, Suspense } from 'react'

const LoginPage       = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage    = lazy(() => import('@/pages/auth/RegisterPage'))
const OnboardingPage  = lazy(() => import('@/pages/onboarding/OnboardingPage'))
const DashboardPage   = lazy(() => import('@/pages/dashboard/DashboardPage'))

// Moduli (učitavaju se na zahtjev)
const RadniciPage      = lazy(() => import('@/modules/M01-radnici/pages/RadniciPage'))
const RadnikFormPage   = lazy(() => import('@/modules/M01-radnici/pages/RadnikFormPage'))
const RadnikProfilPage = lazy(() => import('@/modules/M01-radnici/pages/RadnikProfilPage'))
const TrainingFormPage    = lazy(() => import('@/modules/M03-osposobljavanja/pages/TrainingFormPage'))
const HealthCheckFormPage = lazy(() => import('@/modules/M04-zdravstveni-pregledi/pages/HealthCheckFormPage'))
const EquipmentFormPage   = lazy(() => import('@/modules/M05-radna-oprema/pages/EquipmentFormPage'))
const RadnaMjestaPage     = lazy(() => import('@/modules/M02-radna-mjesta/pages/RadnaMjestaPage'))
const PositionFormPage    = lazy(() => import('@/modules/M02-radna-mjesta/pages/PositionFormPage'))
const OzljededPage        = lazy(() => import('@/modules/M08-ozljede/pages/OzljededPage'))
const IncidentFormPage    = lazy(() => import('@/modules/M08-ozljede/pages/IncidentFormPage'))
const OsposobljavanjaPage = lazy(() => import('@/modules/M03-osposobljavanja/pages/OsposobljavanjaPage'))
const ZdravstveniPreglediPage = lazy(() => import('@/modules/M04-zdravstveni-pregledi/pages/ZdravstveniPreglediPage'))
const RadnaOpremaPage = lazy(() => import('@/modules/M05-radna-oprema/pages/RadnaOpremaPage'))
const AkcijskiCentarPage = lazy(() => import('@/modules/M11-akcijski-centar/pages/AkcijskiCentarPage'))
const RadniOkolisPage    = lazy(() => import('@/modules/M06-radni-okolis/pages/RadniOkolisPage'))
const OzoPage            = lazy(() => import('@/modules/M07-ozo/pages/OzoPage'))
const EvakuacijaPage     = lazy(() => import('@/modules/M09-evakuacija/pages/EvakuacijaPage'))
const SdsPage            = lazy(() => import('@/modules/M10-sds/pages/SdsPage'))
const IzvjescaPage       = lazy(() => import('@/modules/M12-izvjesca/pages/IzvjescaPage'))
const SpecijalistDashboardPage = lazy(() => import('@/modules/M11-akcijski-centar/pages/SpecijalistDashboardPage'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user)
  if (!user) return <Redirect to="/login" />
  return <>{children}</>
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const hasAttemptedLoad = useTenantStore(s => s.hasAttemptedLoad)
  const isLoading = useTenantStore(s => s.isLoading)
  const activeTenant = useTenantStore(s => s.activeTenant)

  if (!hasAttemptedLoad || isLoading) return <LoadingFallback />
  if (activeTenant) return <Redirect to="/" />
  return <>{children}</>
}

function TenantRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user)
  const activeTenant = useTenantStore(s => s.activeTenant)
  const hasAttemptedLoad = useTenantStore(s => s.hasAttemptedLoad)
  const isLoading = useTenantStore(s => s.isLoading)

  if (!user) return <Redirect to="/login" />

  // Čekaj da loadTenant završi prvi pokušaj prije nego donosimo odluku.
  // Bez ovog čeka, prvi render vidi activeTenant=null (jer loadTenant
  // radi u useEffect nakon mounta) i odmah šalje na /onboarding čak i ako
  // user ima tenant u bazi.
  if (!hasAttemptedLoad || isLoading) return <LoadingFallback />

  if (!activeTenant) return <Redirect to="/onboarding" />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* Public rute */}
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />

        {/* Protected — treba auth, ali ne tenant.
            Ako user već ima tenant, ne puštamo ga na onboarding nego ga
            vraćamo na dashboard (prevents stuck-on-onboarding loop). */}
        <Route path="/onboarding">
          <ProtectedRoute>
            <OnboardingGuard>
              <OnboardingPage />
            </OnboardingGuard>
          </ProtectedRoute>
        </Route>

        {/* Tenant rute — treba auth + aktivan tenant */}
        <Route path="/">
          <TenantRoute>
            <DashboardPage />
          </TenantRoute>
        </Route>

        <Route path="/akcijski-centar">
          <TenantRoute><AkcijskiCentarPage /></TenantRoute>
        </Route>

        {/* M04 Zdravstveni pregledi — dodaj za djelatnika */}
        <Route path="/radnici/:workerId/pregledi/novo">
          <TenantRoute><HealthCheckFormPage /></TenantRoute>
        </Route>

        {/* M03 Osposobljavanja — dodaj za djelatnika */}
        <Route path="/radnici/:workerId/osposobljavanja/novo">
          <TenantRoute><TrainingFormPage /></TenantRoute>
        </Route>

        {/* M01 Radnici — /novi MORA biti PRIJE /:id (wouter match order) */}
        <Route path="/radnici/novi">
          <TenantRoute><RadnikFormPage /></TenantRoute>
        </Route>
        <Route path="/radnici/:id/uredi">
          <TenantRoute><RadnikFormPage /></TenantRoute>
        </Route>
        <Route path="/radnici/:id">
          <TenantRoute><RadnikProfilPage /></TenantRoute>
        </Route>
        <Route path="/radnici">
          <TenantRoute><RadniciPage /></TenantRoute>
        </Route>

        <Route path="/osposobljavanja">
          <TenantRoute><OsposobljavanjaPage /></TenantRoute>
        </Route>

        <Route path="/zdravstveni-pregledi">
          <TenantRoute><ZdravstveniPreglediPage /></TenantRoute>
        </Route>

        {/* M02 Radna mjesta */}
        <Route path="/radna-mjesta/novo">
          <TenantRoute><PositionFormPage /></TenantRoute>
        </Route>
        <Route path="/radna-mjesta">
          <TenantRoute><RadnaMjestaPage /></TenantRoute>
        </Route>

        <Route path="/radna-oprema/novo">
          <TenantRoute><EquipmentFormPage /></TenantRoute>
        </Route>
        <Route path="/radna-oprema">
          <TenantRoute><RadnaOpremaPage /></TenantRoute>
        </Route>

        {/* ZNR Stručnjak dashboard */}
        <Route path="/strucnjak">
          <ProtectedRoute><SpecijalistDashboardPage /></ProtectedRoute>
        </Route>

        {/* M06, M07, M09, M10, M12 */}
        <Route path="/radni-okolis">
          <TenantRoute><RadniOkolisPage /></TenantRoute>
        </Route>
        <Route path="/ozo">
          <TenantRoute><OzoPage /></TenantRoute>
        </Route>
        <Route path="/evakuacija">
          <TenantRoute><EvakuacijaPage /></TenantRoute>
        </Route>
        <Route path="/sds">
          <TenantRoute><SdsPage /></TenantRoute>
        </Route>
        <Route path="/izvjesca">
          <TenantRoute><IzvjescaPage /></TenantRoute>
        </Route>

        {/* M08 Ozljede */}
        <Route path="/ozljede/novo">
          <TenantRoute><IncidentFormPage /></TenantRoute>
        </Route>
        <Route path="/ozljede">
          <TenantRoute><OzljededPage /></TenantRoute>
        </Route>

        {/* 404 */}
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </Suspense>
  )
}
