'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createBrowserClient } from '@/lib/supabase/client'
import { Users, ShoppingCart, DollarSign, Package, Clock, UserPlus } from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0, products: 0, pendingOrders: 0, newUsers: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchStats = async () => {
      const [users, orders, products] = await Promise.all([
        supabase.from('profiles').select('id, created_at', { count: 'exact' }),
        supabase.from('orders').select('id, total_amount, status, created_at'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
      ])

      const totalRevenue = orders.data?.reduce((sum, o) => sum + (o.status === 'paid' ? parseFloat(o.total_amount) : 0), 0) || 0
      const pendingCount = orders.data?.filter(o => o.status === 'pending').length || 0
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const newUsersCount = users.data?.filter(u => new Date(u.created_at) > thirtyDaysAgo).length || 0

      setStats({
        users: users.count || 0,
        orders: orders.count || 0,
        revenue: totalRevenue,
        products: products.count || 0,
        pendingOrders: pendingCount,
        newUsers: newUsersCount,
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  const cards = [
    { icon: Users, label: 'Total Users', value: stats.users, color: 'text-blue-500' },
    { icon: ShoppingCart, label: 'Total Orders', value: stats.orders, color: 'text-green-500' },
    { icon: DollarSign, label: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, color: 'text-emerald-500' },
    { icon: Package, label: 'Total Products', value: stats.products, color: 'text-purple-500' },
    { icon: Clock, label: 'Pending Orders', value: stats.pendingOrders, color: 'text-orange-500' },
    { icon: UserPlus, label: 'New Users (30d)', value: stats.newUsers, color: 'text-cyan-500' },
  ]

  return (
    <div>
      <div className="mb-8"><h1 className="text-3xl font-bold">Admin Dashboard</h1><p className="text-muted-foreground">System overview and statistics</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{card.value}</div></CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
