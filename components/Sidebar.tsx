'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, CheckCircle, Settings, LogOut, Menu, X, ShieldCheck, UserPlus, Building2, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutDashboard
}

function getNavItems(role: string): NavItem[] {
  const items: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ]

  if (role === 'admin' || role === 'doctor') {
    items.push({ href: '/patients', label: 'Patient Records', icon: FileText })
  }

  if (role === 'admin') {
    items.push({ href: '/clinics/new', label: 'Clinics', icon: Building2 })
    items.push({ href: '/doctors/new', label: 'Add Doctor', icon: UserPlus })
    items.push({ href: '/doctors', label: 'Doctors', icon: Stethoscope })
  }

  if (role === 'patient') {
    items.push({ href: '/consent', label: 'My Consents', icon: ShieldCheck })
  } else if (role === 'doctor') {
    items.push({ href: '/consent', label: 'Patient Consents', icon: CheckCircle })
  } else {
    items.push({ href: '/consent', label: 'Consent Management', icon: CheckCircle })
  }

  items.push({ href: '/settings', label: 'Settings', icon: Settings })

  return items
}

function getRoleBadge(role: string) {
  const labels: Record<string, string> = {
    admin: 'Admin',
    doctor: 'Doctor',
    patient: 'Patient',
  }
  const colors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    doctor: 'bg-blue-100 text-blue-700',
    patient: 'bg-green-100 text-green-700',
  }
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${colors[role] || 'bg-muted text-muted-foreground'}`}>
      {labels[role] || role}
    </span>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  const navItems = getNavItems(user?.role || '')

  const handleLogout = async () => {
    await logout()
  }

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">BMRMS</h1>
        <p className="text-xs text-muted-foreground mt-1">Healthcare Records</p>
        {user && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-foreground font-medium truncate">{user.name}</span>
            {getRoleBadge(user.role)}
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-3"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card min-h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 border-r border-border bg-card flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
