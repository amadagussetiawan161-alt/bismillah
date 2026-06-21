'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/lib/supabase/client'
import {
  Users, ShoppingCart, DollarSign, Package, Clock, UserPlus, FileText,
  TrendingUp, TrendingDown, Eye, CreditCard, Key, Users2, Activity,
  ArrowRight, Sparkles, AlertCircle, CheckCircle, XCircle
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'order' | 'user' | 'license' | 'affiliate'
  title: string
  description: string
  time: string
  status?: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    revenueToday: 0,
    revenueMonth: 0,
    revenueTotal: 0,
    ordersToday: 0,
    ordersPending: 0,
    ordersCompleted: 0,
    productsActive: 0,
    productsDraft: 0,
    usersNew: 0,
    usersTotal: 0,
    affiliatesActive: 0,
    affiliatesPending: 0,
    licensesActive: 0,
    licensesExpired: 0,
    recentActivity: [] as ActivityItem[],
  })
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchStats = async () => {
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      const [
        users,
        orders,
        products,
        licenses,
        affiliates,
      ] = await Promise.all([
        supabase.from('profiles').select('id, created_at, role'),
        supabase.from('orders').select('id, total_amount, status, created_at'),
        supabase.from('products').select('id, status'),
        supabase.from('licenses').select('id, status, expires_at'),
        supabase.from('affiliates').select('id, status'),
      ])

      // Calculate revenue
      const revenueToday = orders.data?.filter(o => o.status === 'paid' && new Date(o.created_at) >= todayStart)
        .reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0) || 0
      const revenueMonth = orders.data?.filter(o => o.status === 'paid' && new Date(o.created_at) >= monthStart)
        .reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0) || 0
      const revenueTotal = orders.data?.filter(o => o.status === 'paid')
        .reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0) || 0

      // Orders
      const ordersToday = orders.data?.filter(o => new Date(o.created_at) >= todayStart).length || 0
      const ordersPending = orders.data?.filter(o => o.status === 'pending').length || 0
      const ordersCompleted = orders.data?.filter(o => o.status === 'paid').length || 0

      // Products
      const productsActive = products.data?.filter(p => p.status === 'active').length || 0
      const productsDraft = products.data?.filter(p => p.status === 'draft' || p.status === 'coming_soon').length || 0

      // Users
      const usersNew = users.data?.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length || 0
      const usersTotal = users.count || 0

      // Affiliates
      const affiliatesActive = affiliates.data?.filter(a => a.status === 'active').length || 0
      const affiliatesPending = affiliates.data?.filter(a => a.status === 'pending').length || 0

      // Licenses
      const now_time = new Date()
      const licensesActive = licenses.data?.filter(l => l.status === 'active' && (!l.expires_at || new Date(l.expires_at) > now_time)).length || 0
      const licensesExpired = licenses.data?.filter(l => l.status === 'expired' || (l.expires_at && new Date(l.expires_at) <= now_time)).length || 0

      // Build recent activity
      const recentActivity: ActivityItem[] = []

      // Recent orders
      const recentOrders = orders.data?.filter(o => o.status === 'paid')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3) || []
      recentOrders.forEach(o => {
        recentActivity.push({
          id: o.id,
          type: 'order',
          title: 'New Order',
          description: `$${parseFloat(o.total_amount || '0').toFixed(2)} received`,
          time: o.created_at,
          status: 'completed',
        })
      })

      // Recent users
      const recentUsers = users.data?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3) || []
      recentUsers.forEach(u => {
        recentActivity.push({
          id: u.id,
          type: 'user',
          title: 'New User',
          description: 'User registered',
          time: u.created_at,
        })
      })

      // Recent licenses
      const recentLicenses = licenses.data?.filter(l => l.status === 'active')
        .sort((a, b) => new Date(a.id).getTime() - new Date(b.id).getTime())
        .slice(0, 2) || []
      recentLicenses.forEach(l => {
        recentActivity.push({
          id: l.id,
          type: 'license',
          title: 'License Activated',
          description: 'New license issued',
          time: new Date().toISOString(),
        })
      })

      // Sort activity by time
      recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

      setStats({
        revenueToday,
        revenueMonth,
        revenueTotal,
        ordersToday,
        ordersPending,
        ordersCompleted,
        productsActive,
        productsDraft,
        usersNew,
        usersTotal,
        affiliatesActive,
        affiliatesPending,
        licensesActive,
        licensesExpired,
        recentActivity: recentActivity.slice(0, 8),
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  const kpis = [
    {
      section: 'Revenue',
      cards: [
        { icon: DollarSign, label: 'Today', value: `$${stats.revenueToday.toFixed(2)}`, color: 'bg-emerald-500', trend: 'up' },
        { icon: DollarSign, label: 'This Month', value: `$${stats.revenueMonth.toFixed(2)}`, color: 'bg-emerald-600', trend: 'up' },
        { icon: DollarSign, label: 'Total Revenue', value: `$${stats.revenueTotal.toFixed(2)}`, color: 'bg-emerald-700', trend: 'up' },
      ]
    },
    {
      section: 'Orders',
      cards: [
        { icon: ShoppingCart, label: 'Today', value: stats.ordersToday, color: 'bg-blue-500' },
        { icon: Clock, label: 'Pending', value: stats.ordersPending, color: 'bg-amber-500' },
        { icon: CheckCircle, label: 'Completed', value: stats.ordersCompleted, color: 'bg-green-500' },
      ]
    },
    {
      section: 'Products',
      cards: [
        { icon: Package, label: 'Active', value: stats.productsActive, color: 'bg-violet-500' },
        { icon: FileText, label: 'Draft', value: stats.productsDraft, color: 'bg-gray-500' },
      ]
    },
    {
      section: 'Users',
      cards: [
        { icon: UserPlus, label: 'New (30d)', value: stats.usersNew, color: 'bg-cyan-500' },
        { icon: Users, label: 'Total Users', value: stats.usersTotal, color: 'bg-cyan-600' },
      ]
    },
    {
      section: 'Affiliates',
      cards: [
        { icon: Users2, label: 'Active', value: stats.affiliatesActive, color: 'bg-pink-500' },
        { icon: Clock, label: 'Pending', value: stats.affiliatesPending, color: 'bg-pink-400' },
      ]
    },
    {
      section: 'Licenses',
      cards: [
        { icon: Key, label: 'Active', value: stats.licensesActive, color: 'bg-indigo-500' },
        { icon: XCircle, label: 'Expired', value: stats.licensesExpired, color: 'bg-red-500' },
      ]
    },
  ]

  const quickActions = [
    { icon: Package, label: 'Create Product', href: '/admin/products/new' },
    { icon: ShoppingCart, label: 'View Orders', href: '/admin/orders' },
    { icon: Users2, label: 'Manage Affiliates', href: '/admin/affiliates' },
    { icon: Key, label: 'Manage Licenses', href: '/admin/licenses' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your SaaS platform</p>
        </div>
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* KPI Cards by Section */}
      {kpis.map(section => (
        <div key={section.section}>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">{section.section}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {section.cards.map((card) => (
              <Card key={card.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{card.label}</p>
                      <p className="text-xl font-bold mt-1">{card.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${card.color}`}>
                      <card.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button variant="outline" className="w-full justify-start h-10">
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                  <ArrowRight className="h-3 w-3 ml-auto" />
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No recent activity
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id + activity.title} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'order' ? 'bg-green-100 text-green-600' :
                      activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'license' ? 'bg-purple-100 text-purple-600' :
                      'bg-pink-100 text-pink-600'
                    }`}>
                      {activity.type === 'order' && <DollarSign className="h-3.5 w-3.5" />}
                      {activity.type === 'user' && <UserPlus className="h-3.5 w-3.5" />}
                      {activity.type === 'license' && <Key className="h-3.5 w-3.5" />}
                      {activity.type === 'affiliate' && <Users2 className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(activity.time).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
