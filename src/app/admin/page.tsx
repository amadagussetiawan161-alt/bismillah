'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createBrowserClient } from '@/lib/supabase/client'
import {
  Users, ShoppingCart, DollarSign, Package, Clock, UserPlus, FileText,
  TrendingUp, TrendingDown, Eye, CreditCard, Key, Users2, Activity,
  ArrowRight, Sparkles, AlertCircle, CheckCircle, XCircle, BarChart3,
  LineChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import {
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'

interface ActivityItem {
  id: string
  type: 'order' | 'user' | 'license' | 'affiliate'
  title: string
  description: string
  time: string
  status?: string
}

interface ChartData {
  date: string
  revenue: number
  orders: number
  users: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    revenueToday: 0,
    revenueMonth: 0,
    revenueTotal: 0,
    revenueChange: 0,
    ordersToday: 0,
    ordersPending: 0,
    ordersCompleted: 0,
    ordersChange: 0,
    productsActive: 0,
    productsDraft: 0,
    usersNew: 0,
    usersTotal: 0,
    usersChange: 0,
    affiliatesActive: 0,
    affiliatesPending: 0,
    licensesActive: 0,
    licensesExpired: 0,
    recentActivity: [] as ActivityItem[],
    chartData: [] as ChartData[],
    topProducts: [] as { name: string; sales: number; revenue: number }[],
    trafficSources: [] as { name: string; value: number; color: string }[],
  })
  const [period, setPeriod] = useState<'7d' | '30d' | '12m'>('30d')
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    setLoading(true)
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    let periodStart: Date
    switch (period) {
      case '7d': periodStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); break
      case '30d': periodStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); break
      case '12m': periodStart = new Date(now.getFullYear() - 1, now.getMonth(), 1); break
    }

    const [users, orders, products, licenses, affiliates, orderItems] = await Promise.all([
      supabase.from('profiles').select('id, created_at, role'),
      supabase.from('orders').select('id, total_amount, status, created_at'),
      supabase.from('products').select('id, status, name, sales_count'),
      supabase.from('licenses').select('id, status, expires_at'),
      supabase.from('affiliates').select('id, status'),
      supabase.from('order_items').select('product_id, quantity, price, products(name)'),
    ])

    // Calculate revenue
    const revenueToday = orders.data?.filter(o => o.status === 'paid' && new Date(o.created_at) >= todayStart)
      .reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0) || 0
    const revenueMonth = orders.data?.filter(o => o.status === 'paid' && new Date(o.created_at) >= monthStart)
      .reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0) || 0
    const revenuePrevMonth = orders.data?.filter(o => o.status === 'paid' && new Date(o.created_at) >= prevMonthStart && new Date(o.created_at) < monthStart)
      .reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0) || 0
    const revenueTotal = orders.data?.filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0) || 0
    const revenueChange = revenuePrevMonth > 0 ? ((revenueMonth - revenuePrevMonth) / revenuePrevMonth) * 100 : 0

    // Orders
    const ordersToday = orders.data?.filter(o => new Date(o.created_at) >= todayStart).length || 0
    const ordersPending = orders.data?.filter(o => o.status === 'pending').length || 0
    const ordersCompleted = orders.data?.filter(o => o.status === 'paid').length || 0
    const prevOrdersCount = orders.data?.filter(o => {
      const d = new Date(o.created_at)
      return d >= prevMonthStart && d < monthStart
    }).length || 0
    const ordersChange = prevOrdersCount > 0 ? ((ordersCompleted - prevOrdersCount) / prevOrdersCount) * 100 : 0

    // Products
    const productsActive = products.data?.filter(p => p.status === 'active').length || 0
    const productsDraft = products.data?.filter(p => p.status === 'draft' || p.status === 'coming_soon').length || 0

    // Users
    const usersNew = users.data?.filter(u => new Date(u.created_at) >= periodStart).length || 0
    const usersTotal = users.data?.length || 0
    const prevUsersCount = users.data?.filter(u => {
      const d = new Date(u.created_at)
      return d >= prevMonthStart && d < monthStart
    }).length || 0
    const usersChange = prevUsersCount > 0 ? ((usersNew - prevUsersCount) / prevUsersCount) * 100 : 0

    // Affiliates
    const affiliatesActive = affiliates.data?.filter(a => a.status === 'active').length || 0
    const affiliatesPending = affiliates.data?.filter(a => a.status === 'pending').length || 0

    // Licenses
    const nowTime = new Date()
    const licensesActive = licenses.data?.filter(l => l.status === 'active' && (!l.expires_at || new Date(l.expires_at) > nowTime)).length || 0
    const licensesExpired = licenses.data?.filter(l => l.status === 'expired' || (l.expires_at && new Date(l.expires_at) <= nowTime)).length || 0

    // Generate chart data
    const chartMap = new Map<string, { revenue: number; orders: number; users: number }>()

    // Initialize all dates in period
    for (let i = 0; i < (period === '7d' ? 7 : period === '30d' ? 30 : 12); i++) {
      const date = new Date()
      if (period === '12m') {
        date.setMonth(date.getMonth() - i)
        const key = date.toLocaleDateString('en-US', { month: 'short' })
        chartMap.set(key, { revenue: 0, orders: 0, users: 0 })
      } else {
        date.setDate(date.getDate() - i)
        const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        chartMap.set(key, { revenue: 0, orders: 0, users: 0 })
      }
    }

    // Fill with actual data
    orders.data?.filter(o => new Date(o.created_at) >= periodStart).forEach(o => {
      const date = new Date(o.created_at)
      const key = period === '12m'
        ? date.toLocaleDateString('en-US', { month: 'short' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const existing = chartMap.get(key) || { revenue: 0, orders: 0, users: 0 }
      if (o.status === 'paid') existing.revenue += parseFloat(o.total_amount || '0')
      existing.orders++
      chartMap.set(key, { ...existing })
    })

    users.data?.filter(u => new Date(u.created_at) >= periodStart).forEach(u => {
      const date = new Date(u.created_at)
      const key = period === '12m'
        ? date.toLocaleDateString('en-US', { month: 'short' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const existing = chartMap.get(key) || { revenue: 0, orders: 0, users: 0 }
      existing.users++
      chartMap.set(key, { ...existing })
    })

    const chartData = Array.from(chartMap.entries()).map(([date, data]) => ({
      date,
      ...data
    })).reverse()

    // Top products
    const productSales = new Map<string, { sales: number; revenue: number }>()
    orderItems.data?.forEach((item: any) => {
      const name = item.products?.name || 'Unknown'
      const existing = productSales.get(name) || { sales: 0, revenue: 0 }
      existing.sales += item.quantity || 1
      existing.revenue += parseFloat(item.price || '0')
      productSales.set(name, { ...existing })
    })

    const topProducts = Array.from(productSales.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Traffic sources (placeholder data)
    const trafficSources = [
      { name: 'Direct', value: 42, color: '#3b82f6' },
      { name: 'Google', value: 28, color: '#22c55e' },
      { name: 'Social Media', value: 18, color: '#f59e0b' },
      { name: 'Referral', value: 12, color: '#8b5cf6' },
    ]

    // Build recent activity
    const recentActivity: ActivityItem[] = []
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

    recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    setStats({
      revenueToday,
      revenueMonth,
      revenueTotal,
      revenueChange,
      ordersToday,
      ordersPending,
      ordersCompleted,
      ordersChange,
      productsActive,
      productsDraft,
      usersNew,
      usersTotal,
      usersChange,
      affiliatesActive,
      affiliatesPending,
      licensesActive,
      licensesExpired,
      recentActivity: recentActivity.slice(0, 8),
      chartData,
      topProducts,
      trafficSources,
    })
    setLoading(false)
  }

  const kpis = [
    {
      section: 'Revenue',
      cards: [
        { icon: DollarSign, label: 'Today', value: `$${stats.revenueToday.toFixed(2)}`, color: 'bg-emerald-500' },
        { icon: DollarSign, label: 'This Month', value: `$${stats.revenueMonth.toFixed(2)}`, color: 'bg-emerald-600', change: stats.revenueChange },
        { icon: DollarSign, label: 'Total Revenue', value: `$${stats.revenueTotal.toFixed(2)}`, color: 'bg-emerald-700' },
      ]
    },
    {
      section: 'Orders',
      cards: [
        { icon: ShoppingCart, label: 'Today', value: stats.ordersToday, color: 'bg-blue-500' },
        { icon: Clock, label: 'Pending', value: stats.ordersPending, color: 'bg-amber-500' },
        { icon: CheckCircle, label: 'Completed', value: stats.ordersCompleted, color: 'bg-green-500', change: stats.ordersChange },
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
        { icon: UserPlus, label: 'New', value: stats.usersNew, color: 'bg-cyan-500', change: stats.usersChange },
        { icon: Users, label: 'Total', value: stats.usersTotal, color: 'bg-cyan-600' },
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
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(['7d', '30d', '12m'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${period === p ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            Updated: {new Date().toLocaleTimeString()}
          </div>
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
                      {card.change !== undefined && (
                        <div className={`flex items-center gap-1 mt-1 text-xs ${card.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {card.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(card.change).toFixed(1)}%
                        </div>
                      )}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="#dcfce7" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.trafficSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.trafficSources.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {stats.trafficSources.map((source) => (
                <div key={source.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="text-sm">{source.name}</span>
                  <span className="text-sm text-muted-foreground ml-auto">{source.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Top Products by Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topProducts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No product data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${product.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
