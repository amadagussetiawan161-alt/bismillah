'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Package, CreditCard, Key, Gift, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({ products: 0, subscriptions: 0, licenses: 0, referrals: 0 })
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [products, subscriptions, licenses, referrals] = await Promise.all([
        supabase.from('user_products').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('licenses').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('referrals').select('id', { count: 'exact', head: true }).eq('referrer_id', user.id),
      ])
      setStats({ products: products.count || 0, subscriptions: subscriptions.count || 0, licenses: licenses.count || 0, referrals: referrals.count || 0 })
    }
    fetchData()
  }, [])

  const quickActions = [
    { icon: Package, label: 'My Products', value: stats.products, href: '/dashboard/products', desc: 'View purchased products' },
    { icon: CreditCard, label: 'Subscriptions', value: stats.subscriptions, href: '/dashboard/subscriptions', desc: 'Manage subscriptions' },
    { icon: Key, label: 'Licenses', value: stats.licenses, href: '/dashboard/licenses', desc: 'View your licenses' },
    { icon: Gift, label: 'Referrals', value: stats.referrals, href: '/dashboard/referrals', desc: 'Track your referrals' },
  ]

  return (
    <div>
      <div className="mb-8"><h1 className="text-3xl font-bold">Dashboard</h1><p className="text-muted-foreground">Welcome back! Here is an overview of your account.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickActions.map((action) => (
          <Card key={action.label}>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-sm font-medium">{action.label}</CardTitle><action.icon className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{action.value}</div><p className="text-xs text-muted-foreground">{action.desc}</p></CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle><CardDescription>Get things done faster</CardDescription></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-between" asChild><Link href="/products">Browse Products <ArrowRight className="h-4 w-4" /></Link></Button>
          <Button variant="outline" className="justify-between" asChild><Link href="/dashboard/settings">Account Settings <ArrowRight className="h-4 w-4" /></Link></Button>
          <Button variant="outline" className="justify-between" asChild><Link href="/dashboard/referrals">Invite Friends <ArrowRight className="h-4 w-4" /></Link></Button>
        </CardContent>
      </Card>
    </div>
  )
}
