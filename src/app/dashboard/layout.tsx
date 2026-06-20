'use client'

import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, LayoutDashboard, Package, CreditCard, Key, Gift, Bell, Settings, LogOut, Menu, X } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { redirect('/auth/login'); return }
      setUser({ id: user.id, email: user.email || '' })
      setLoading(false)
    }
    checkAuth()
  }, [])

  const handleLogout = async () => { await supabase.auth.signOut(); redirect('/auth/login') }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Package, label: 'Products', href: '/dashboard/products' },
    { icon: CreditCard, label: 'Subscriptions', href: '/dashboard/subscriptions' },
    { icon: Key, label: 'Licenses', href: '/dashboard/licenses' },
    { icon: Gift, label: 'Referrals', href: '/dashboard/referrals' },
    { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-md shadow">{sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-background border-r transition-transform duration-200 ease-in-out`}>
          <div className="flex flex-col h-full">
            <div className="p-6"><Link href="/" className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"><span className="font-bold text-primary-foreground">S</span></div><span className="font-semibold">SaaS Platform</span></Link></div>
            <nav className="flex-1 px-4 space-y-1">{menuItems.map((item) => (<Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors"><item.icon className="h-4 w-4" />{item.label}</Link>))}</nav>
            <div className="p-4 border-t"><div className="text-xs text-muted-foreground mb-2">{user?.email}</div><Button variant="outline" className="w-full justify-start" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" /> Sign Out</Button></div>
          </div>
        </aside>
        <main className="flex-1 min-h-screen"><div className="p-6 lg:p-8">{children}</div></main>
      </div>
    </div>
  )
}
