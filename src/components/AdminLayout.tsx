'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useI18n } from '@/components/LanguageProvider'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderOpen,
  Flag,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  userEmail?: string
  userName?: string
}

export default function AdminLayout({ children, userEmail, userName }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { messages } = useI18n()
  const t = messages.admin.layout

  const nav = [
    { label: t.nav.dashboard, href: '/admin/dashboard', icon: LayoutDashboard },
    { label: t.nav.lawyers, href: '/admin/lawyers', icon: Briefcase },
    { label: t.nav.immigrants, href: '/admin/immigrants', icon: Users },
    { label: t.nav.cases, href: '/admin/cases', icon: FolderOpen },
    { label: t.nav.flags, href: '/admin/flags', icon: Flag },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900 leading-tight">{t.title}</div>
          <div className="text-xs text-slate-400">{t.subtitle}</div>
        </div>
      </div>

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

      <div className="px-3 pb-4 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {userName?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">{userName || 'Admin'}</div>
            <div className="text-xs text-slate-400 truncate">{userEmail}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors mt-1"
        >
          <LogOut className="w-4 h-4" />
          {t.logout}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden lg:flex lg:flex-shrink-0 w-60 bg-white border-r border-slate-200 flex-col">
        {sidebarContent}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center text-white text-xs font-bold">
            {userName?.charAt(0).toUpperCase() || 'A'}
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
