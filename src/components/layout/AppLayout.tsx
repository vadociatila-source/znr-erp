// AppLayout — glavni layout s bočnom navigacijom
// Prikazan je za sve authenticated + tenant rute

import { Link, useLocation } from 'wouter'
import { clsx } from 'clsx'
import {
  LayoutDashboard, Users, BookOpen, Heart, Wrench, Wind,
  Shield, AlertTriangle, FlameKindling, FileText, Bell,
  BarChart3, LogOut, ChevronRight, Building2
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useTenantStore } from '@/store/tenant.store'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  moduleCode: string
  badge?: number  // alarm count
}

const NAV_ITEMS: NavItem[] = [
  // Akcijski centar — uvijek prvi
  { href: '/akcijski-centar', label: 'Akcijski centar', icon: <Bell size={18} />, moduleCode: 'M11' },

  // Moduli po prioritetu MVP
  { href: '/radnici',             label: 'Djelatnici',           icon: <Users size={18} />,           moduleCode: 'M01' },
  { href: '/radna-mjesta',        label: 'Radna mjesta',        icon: <Building2 size={18} />,        moduleCode: 'M02' },
  { href: '/osposobljavanja',     label: 'Osposobljavanja',     icon: <BookOpen size={18} />,         moduleCode: 'M03' },
  { href: '/zdravstveni-pregledi',label: 'Zdravstveni pregledi',icon: <Heart size={18} />,            moduleCode: 'M04' },
  { href: '/radna-oprema',        label: 'Radna oprema',        icon: <Wrench size={18} />,           moduleCode: 'M05' },
  { href: '/radni-okolis',        label: 'Radni okoliš',        icon: <Wind size={18} />,             moduleCode: 'M06' },
  { href: '/ozo',                 label: 'OZO',                 icon: <Shield size={18} />,           moduleCode: 'M07' },
  { href: '/ozljede',             label: 'Ozljede na radu',     icon: <AlertTriangle size={18} />,   moduleCode: 'M08' },
  { href: '/evakuacija',          label: 'Evakuacija',          icon: <FlameKindling size={18} />,    moduleCode: 'M09' },
  { href: '/sds',                 label: 'SDS listovi',         icon: <FileText size={18} />,         moduleCode: 'M10' },
  { href: '/izvjesca',            label: 'Izvješća',            icon: <BarChart3 size={18} />,        moduleCode: 'M12' },
]

interface SidebarItemProps {
  item: NavItem
  isActive: boolean
}

function SidebarItem({ item, isActive }: SidebarItemProps) {
  return (
    <Link
      href={item.href}
      className={clsx(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
        'group relative',
        isActive
          ? 'bg-brand-600 text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      <span className={clsx(
        'shrink-0',
        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
      )}>
        {item.icon}
      </span>
      <span className="flex-1 font-medium">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className={clsx(
          'text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center',
          isActive ? 'bg-white text-brand-600' : 'bg-red-500 text-white'
        )}>
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  const [location] = useLocation()
  const { signOut } = useAuthStore()
  const { activeTenant, clearTenant } = useTenantStore()

  const handleSignOut = async () => {
    clearTenant()
    await signOut()
  }

  return (
    <aside className="flex flex-col w-64 h-screen bg-white border-r border-slate-200 shrink-0">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-100">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <Shield size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">ZNR ERP</p>
          <p className="text-xs text-slate-500 truncate max-w-[140px]">
            {activeTenant?.name ?? 'Učitavanje...'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {/* Dashboard */}
        <Link
          href="/"
          className={clsx(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-3',
            location === '/'
              ? 'bg-brand-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <LayoutDashboard size={18} />
          <span className="font-medium">Dashboard</span>
        </Link>

        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">
          ZNR Moduli
        </div>

        {NAV_ITEMS.map(item => (
          <SidebarItem
            key={item.href}
            item={item}
            isActive={location.startsWith(item.href)}
          />
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-100 p-3">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut size={16} />
          <span>Odjava</span>
        </button>
      </div>
    </aside>
  )
}

// ── AppLayout wrapper ──────────────────────────────────────────────────────

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  breadcrumb?: Array<{ label: string; href?: string }>
  actions?: React.ReactNode
}

export function AppLayout({ children, title, breadcrumb, actions }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Page header */}
        {(title || breadcrumb || actions) && (
          <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
            {breadcrumb && breadcrumb.length > 0 && (
              <nav className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                {breadcrumb.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight size={12} />}
                    {crumb.href
                      ? <Link href={crumb.href} className="hover:text-slate-900">{crumb.label}</Link>
                      : <span>{crumb.label}</span>
                    }
                  </span>
                ))}
              </nav>
            )}
            <div className="flex items-center justify-between">
              {title && <h1 className="text-xl font-semibold text-slate-900">{title}</h1>}
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </header>
        )}

        {/* Page content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
