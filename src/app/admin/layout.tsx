'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loader as Loader2, LayoutDashboard, Users, LogOut, Menu, X, Search, Bell, Sparkles } from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
  { icon: Users, label: 'User Management', href: '/admin/users' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkAuth = async () => {
      try {
        const { createBrowserSupabaseClient } = await import('@/lib/supabase/client')
        const supabase = createBrowserSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/auth/login'); return }
        setUser({ email: user.email || '' })
        setLoading(false)
      } catch {
        router.push('/auth/login')
      }
    }
    checkAuth()
  }, [mounted, router])

  const handleLogout = async () => {
    try {
      const { createBrowserSupabaseClient } = await import('@/lib/supabase/client')
      const supabase = createBrowserSupabaseClient()
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch {
      router.push('/auth/login')
    }
  }

  if (!mounted || loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  const isActive = (href: string) => pathname === href || (href !== '/admin' && pathname.startsWith(href))

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed top-0 left-0 z-50 h-full w-[240px] bg-white border-r transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center"><Sparkles className="h-4 w-4 text-white" /></div>
              <span className="font-semibold text-slate-900">Admin Panel</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-2 hover:bg-slate-100 rounded-lg"><X className="h-5 w-5 text-slate-500" /></button>
          </div>
          <nav className="flex-1 p-4 space-y-0.5">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${isActive(item.href) ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                <item.icon className={`h-4 w-4 ${isActive(item.href) ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 mb-2">
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">{user?.email?.charAt(0).toUpperCase()}</span>
              </div>
              <p className="text-sm font-medium text-slate-900 truncate">{user?.email?.split('@')[0]}</p>
            </div>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Keluar</Button>
          </div>
        </div>
      </aside>
      <div className="lg:pl-[240px]">
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur border-b">
          <div className="h-full px-4 lg:px-8 flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"><Menu className="h-5 w-5 text-slate-600" /></button>
            <div className="hidden sm:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Cari..." className="w-full pl-10 h-10 bg-slate-50 rounded-xl border-0 focus:ring-2 focus:ring-blue-600 text-sm" />
              </div>
            </div>
            <button className="ml-auto p-2 hover:bg-slate-100 rounded-lg"><Bell className="h-5 w-5 text-slate-600" /></button>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
