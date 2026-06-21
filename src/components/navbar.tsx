'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Menu, X, ShoppingCart, User, LogOut, LayoutDashboard, Package, Globe } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user ? { id: user.id, email: user.email || '' } : null)
      if (user) {
        const { count } = await supabase.from('cart_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
        setCartCount(count || 0)
      }
    }
    getUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => getUser())
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/products', label: 'Produk' },
    { href: '/categories', label: 'Kategori' },
    { href: '/pricing', label: 'Harga' },
    { href: '/contact', label: 'Kontak' },
  ]

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="font-bold text-white text-sm">S</span>
            </div>
            <span className="font-semibold text-slate-900 hidden sm:inline">SaaS Platform</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${isActive(link.href) ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/dashboard" className="hidden sm:inline-flex">
                  <Button variant="ghost" size="sm"><LayoutDashboard className="h-4 w-4 mr-2" />Dashboard</Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hidden sm:inline-flex">
                  <Button variant="ghost" size="sm">Masuk</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Daftar</Button>
                </Link>
              </>
            )}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`px-4 py-2 text-sm font-medium rounded-lg ${isActive(link.href) ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}>
                  {link.label}
                </Link>
              ))}
              {!user && <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600">Masuk</Link>}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
