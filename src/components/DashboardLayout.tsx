'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useI18n } from '@/components/LanguageProvider'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Briefcase,
  Inbox,
  LogOut,
  Menu,
  X,
  Bell,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'lawyer' | 'immigrant'
  userEmail?: string
  userName?: string
}

export default function DashboardLayout({ children, role, userEmail, userName }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { messages } = useI18n()

  const lawyerNav: NavItem[] = [
    { label: messages.dashboardLayout.nav.lawyer.dashboard, href: '/lawyer/dashboard', icon: LayoutDashboard },
    { label: messages.dashboardLayout.nav.lawyer.immigrants, href: '/lawyer/immigrants', icon: Users },
    { label: messages.dashboardLayout.nav.lawyer.requests, href: '/lawyer/requests', icon: Inbox },
    { label: messages.dashboardLayout.nav.lawyer.documents, href: '/lawyer/documents', icon: FileText },
    { label: messages.dashboardLayout.nav.lawyer.settings, href: '/lawyer/settings', icon: Settings },
  ]

  const immigrantNav: NavItem[] = [
    { label: messages.dashboardLayout.nav.immigrant.dashboard, href: '/immigrant/dashboard', icon: LayoutDashboard },
    { label: messages.dashboardLayout.nav.immigrant.lawyers, href: '/immigrant/lawyers', icon: Briefcase },
    { label: messages.dashboardLayout.nav.immigrant.documents, href: '/immigrant/documents', icon: FileText },
    { label: messages.dashboardLayout.nav.immigrant.case, href: '/immigrant/my-case', icon: FileText },
    { label: messages.dashboardLayout.nav.immigrant.settings, href: '/immigrant/settings', icon: Settings },
  ]

  const nav = role === 'lawyer' ? lawyerNav : immigrantNav

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-6 bg-spain-red rounded-sm" />
          <div className="w-2.5 h-6 bg-spain-yellow rounded-sm" />
          <div className="w-2.5 h-6 bg-spain-red rounded-sm" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900 leading-tight">Inm. Platform</div>
          <div className="text-xs text-slate-400">
            {role === 'lawyer'
              ? messages.dashboardLayout.lawyerPortal
              : messages.dashboardLayout.immigrantPortal}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className={cn('w-4 h-4', active ? 'text-brand-600' : 'text-slate-400')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 group cursor-pointer">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
            role === 'lawyer' ? 'bg-brand-700' : 'bg-emerald-600'
          )}>
            {userName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">
              {userName || messages.dashboardLayout.userFallback}
            </div>
            <div className="text-xs text-slate-400 truncate">{userEmail}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors mt-1"
        >
          <LogOut className="w-4 h-4" />
          {messages.dashboardLayout.logout}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0 w-60 bg-white border-r border-slate-200 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 lg:flex-initial" />

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold',
              role === 'lawyer' ? 'bg-brand-700' : 'bg-emerald-600'
            )}>
              {userName?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
