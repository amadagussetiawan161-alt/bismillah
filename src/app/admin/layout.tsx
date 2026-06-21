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
  const [user, setUser] = useState<{ id: string; email: string; role: string } | null>(null)
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

        if (!user) {
          router.push('/auth/login')
          return
        }

        const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
        const role = profile?.role || 'member'

        if (role !== 'admin') {
          router.push('/dashboard')
          return
        }

        setUser({ id: user.id, email: user.email || '', role })
        setLoading(false)
      } catch (error) {
        console.error('Auth check failed:', error)
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
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Don't render anything until mounted on client
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const isActive = (href: string) => pathname === href || (href !== '/admin' && pathname.startsWith(href))

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat pagi'
    if (hour < 18) return 'Selamat siang'
    return 'Selamat malam'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-[240px] bg-white border-r border-slate-200
        transform transition-transform duration-200 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900">Admin Panel</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto p-2 hover:bg-slate-100 rounded-lg"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive(item.href)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <item.icon className={`h-4 w-4 ${isActive(item.href) ? 'text-blue-600' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50">
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-2 justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-[240px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="h-full px-4 lg:px-8 flex items-center gap-4">
            {/* Mobile Menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="h-5 w-5 text-slate-600" />
            </button>

            {/* Search */}
            <div className="hidden sm:flex flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari..."
                  className="w-full pl-10 h-10 bg-slate-50 rounded-xl border-0 focus:bg-white focus:ring-2 focus:ring-blue-600 text-sm"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
