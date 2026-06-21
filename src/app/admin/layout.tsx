'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, LayoutDashboard, Users, Package, FolderOpen, ShoppingCart, CreditCard, Key, Users2, BarChart3, Activity, Settings, LogOut, Menu, X, FileText } from 'lucide-react'

// Paths that trigger focus mode
const FOCUS_MODE_PATHS = [
  '/admin/products/new',
]

const FOCUS_MODE_PATTERNS = [
  /\/admin\/products\/[^/]+\/edit$/,
  /\/admin\/products\/[^/]+\/builder$/,
]

function isFocusMode(pathname: string): boolean {
  return FOCUS_MODE_PATHS.some((p) => pathname === p) ||
    FOCUS_MODE_PATTERNS.some((pattern) => pattern.test(pathname))
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email: string; role: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient()

  const focusMode = isFocusMode(pathname)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
      const role = profile?.role || 'member'
      const isAdmin = role === 'admin'

      if (!isAdmin) { router.push('/dashboard'); return }

      setUser({ id: user.id, email: user.email || '', role })
      setLoading(false)
    }
    checkAuth()
  }, [])

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/auth/login') }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>

  // Focus mode - hide sidebar, full width
  if (focusMode) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    )
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: FolderOpen, label: 'Categories', href: '/admin/categories' },
    { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
    { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
    { icon: Key, label: 'Licenses', href: '/admin/licenses' },
    { icon: Users2, label: 'Affiliates', href: '/admin/affiliates' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
    { icon: Activity, label: 'Activity Logs', href: '/admin/activity-logs' },
    { icon: FileText, label: 'Blog', href: '/admin/blog' },
    { icon: Settings, label: 'Site Settings', href: '/admin/settings' },
  ]

  const isActive = (href: string) => pathname === href || (href !== '/admin' && pathname.startsWith(href))

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-md shadow">{sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-background border-r transition-transform duration-200 ease-in-out`}>
          <div className="flex flex-col h-full">
            <div className="p-6">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"><span className="font-bold text-primary-foreground">S</span></div>
                <span className="font-semibold">Admin Panel</span>
              </Link>
            </div>
            <nav className="flex-1 px-4 space-y-1">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive(item.href) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>
                  <item.icon className="h-4 w-4" />{item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t">
              <div className="text-xs text-muted-foreground mb-1">{user?.email}</div>
              <div className="text-xs text-primary font-medium mb-2">Administrator</div>
              <Button variant="outline" className="w-full justify-start" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" /> Sign Out</Button>
            </div>
          </div>
        </aside>
        <main className="flex-1 min-h-screen"><div className="p-6 lg:p-8">{children}</div></main>
      </div>
    </div>
  )
}
