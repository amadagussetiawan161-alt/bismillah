'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Package, Key, Download, Gift, Bell, ArrowRight, Receipt, CreditCard } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({ products: 0, orders: 0, licenses: 0, transactions: 0, referrals: 0, notifications: 0 })
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [products, orders, licenses, transactions, referrals, notifications] = await Promise.all([
        supabase.from('user_products').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('licenses').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('referrals').select('id', { count: 'exact', head: true }).eq('affiliate_id', user.id),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).is('read_at', null),
      ])
      setStats({ products: products.count || 0, orders: orders.count || 0, licenses: licenses.count || 0, transactions: transactions.count || 0, referrals: referrals.count || 0, notifications: notifications.count || 0 })
    }
    fetchData()
  }, [])

  const cards = [
    { icon: Package, label: 'My Orders', value: stats.orders, href: '/dashboard/orders', desc: 'View order history', color: 'text-blue-500' },
    { icon: Key, label: 'Active Licenses', value: stats.licenses, href: '/dashboard/licenses', desc: 'Manage your licenses', color: 'text-purple-500' },
    { icon: Download, label: 'Downloads', value: stats.products, href: '/dashboard/downloads', desc: 'Download purchased products', color: 'text-green-500' },
    { icon: Gift, label: 'Affiliate Earnings', value: stats.referrals, href: '/dashboard/referrals', desc: 'Track affiliate referrals', color: 'text-orange-500' },
  ]

  return (
    <div>
      <div className="mb-8"><h1 className="text-3xl font-bold">Member Dashboard</h1><p className="text-muted-foreground">Welcome back! Here is an overview of your account.</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle><CardDescription>Get things done faster</CardDescription></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-between" asChild><Link href="/products">Browse Products <ArrowRight className="h-4 w-4" /></Link></Button>
          <Button variant="outline" className="justify-between" asChild><Link href="/dashboard/orders">My Orders <ArrowRight className="h-4 w-4" /></Link></Button>
          <Button variant="outline" className="justify-between" asChild><Link href="/dashboard/settings">Account Settings <ArrowRight className="h-4 w-4" /></Link></Button>
        </CardContent>
      </Card>
    </div>
  )
}
