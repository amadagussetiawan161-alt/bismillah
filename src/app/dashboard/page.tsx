'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { createBrowserClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Package, Key, Download, Gift, Bell, ArrowRight, Receipt, CreditCard, TrendingUp, Clock, CheckCircle, AlertCircle, ExternalLink, ShoppingBag, Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
}

interface License {
  id: string
  license_key: string
  status: string
  expires_at: string | null
  product: { name: string } | null
  product_id: string
  products: { name: string } | null
}

interface Product {
  id: string
  product: { name: string; image_url: string | null } | null
  product_id: string
  products: { name: string; image_url: string | null } | null
}

interface AffiliateStats {
  referrals_count: number
  total_earnings: number
  pending_earnings: number
  paid_earnings: number
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ products: 0, orders: 0, licenses: 0, activeLicenses: 0, transactions: 0, notifications: 0 })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [licenses, setLicenses] = useState<License[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(null)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)

  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      setLoading(true)

      // Fetch counts
      const [productsData, ordersData, licensesData, transactionsData, notificationsData] = await Promise.all([
        supabase.from('user_products').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('licenses').select('id, status', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).is('read_at', null),
      ])

      const activeLicenses = (licensesData.data || []).filter((l: any) => l.status === 'active').length

      setStats({
        products: productsData.count || 0,
        orders: ordersData.count || 0,
        licenses: licensesData.count || 0,
        activeLicenses,
        transactions: transactionsData.count || 0,
        notifications: notificationsData.count || 0,
      })

      // Fetch recent orders
      const { data: orders } = await supabase.from('orders').select('id, order_number, status, total_amount, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
      setRecentOrders((orders as Order[]) || [])

      // Fetch licenses
      const { data: licenseData } = await supabase.from('licenses').select('id, license_key, status, expires_at, product_id, products(name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
      setLicenses((licenseData as License[]) || [])

      // Fetch products
      const { data: productData } = await supabase.from('user_products').select('id, product_id, products(name, image_url)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6)
      setProducts((productData as Product[]) || [])

      // Fetch affiliate stats
      const { data: affiliateData } = await supabase.from('affiliates').select('id').eq('user_id', user.id).single()
      if (affiliateData) {
        const { data: referrals } = await supabase.from('referrals').select('status, commission_amount').eq('affiliate_id', affiliateData.id)
        if (referrals) {
          const totalEarnings = referrals.reduce((sum: number, r: any) => sum + Number(r.commission_amount || 0), 0)
          const pendingEarnings = referrals.filter((r: any) => r.status === 'pending').reduce((sum: number, r: any) => sum + Number(r.commission_amount || 0), 0)
          const paidEarnings = referrals.filter((r: any) => r.status === 'paid').reduce((sum: number, r: any) => sum + Number(r.commission_amount || 0), 0)
          setAffiliateStats({
            referrals_count: referrals.length,
            total_earnings: totalEarnings,
            pending_earnings: pendingEarnings,
            paid_earnings: paidEarnings,
          })
        }
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'expired': case 'cancelled': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      paid: 'default',
      active: 'default',
      pending: 'secondary',
      expired: 'destructive',
      cancelled: 'destructive',
    }
    return <Badge variant={variants[status] || 'outline'} className="text-xs">{status}</Badge>
  }

  const cards = [
    { icon: Package, label: 'My Orders', value: stats.orders, href: '/dashboard/orders', desc: 'View order history', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Key, label: 'Active Licenses', value: stats.activeLicenses, href: '/dashboard/licenses', desc: `${stats.licenses} total licenses`, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: Download, label: 'Downloads', value: stats.products, href: '/dashboard/downloads', desc: 'Download products', color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: Gift, label: 'Affiliate', value: affiliateStats?.referrals_count || 0, href: '/dashboard/affiliate', desc: affiliateStats ? `$${affiliateStats.total_earnings.toFixed(2)} earned` : 'Join affiliate program', color: 'text-orange-500', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Member Dashboard</h1>
        <p className="text-muted-foreground">Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! Here's your account overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className="hover:shadow-md transition-all cursor-pointer border-muted/60">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-3xl font-bold mt-1">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${card.bg}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Recent Orders
              </CardTitle>
              <CardDescription>Your latest purchases</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/orders">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No orders yet</p>
                <Button size="sm" className="mt-3" asChild>
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link key={order.id} href={`/dashboard/orders`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-medium">{order.order_number || `Order #${order.id.slice(0, 8)}`}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">${Number(order.total_amount).toFixed(2)}</span>
                      {getStatusBadge(order.status)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Licenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              My Licenses
            </CardTitle>
            <CardDescription>{stats.activeLicenses} active, {stats.licenses - stats.activeLicenses} expired</CardDescription>
          </CardHeader>
          <CardContent>
            {licenses.length === 0 ? (
              <p className="text-muted-foreground text-center py-6 text-sm">No licenses found</p>
            ) : (
              <div className="space-y-3">
                {licenses.map((license) => {
                  const productName = license.products?.name || license.product?.name || 'Unknown Product'
                  const isExpiringSoon = license.expires_at && new Date(license.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  return (
                    <div key={license.id} className="flex items-start justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{productName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{license.license_key?.slice(0, 16)}...</p>
                        {license.expires_at && (
                          <p className={`text-xs mt-1 ${isExpiringSoon ? 'text-orange-500' : 'text-muted-foreground'}`}>
                            Expires: {new Date(license.expires_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(license.status)}
                    </div>
                  )
                })}
              </div>
            )}
            <Button variant="outline" size="sm" className="w-full mt-4" asChild>
              <Link href="/dashboard/licenses">Manage Licenses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Products Owned */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Products Owned
            </CardTitle>
            <CardDescription>{stats.products} digital products ready to download</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/downloads">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No products purchased yet</p>
              <Button size="sm" className="mt-3" asChild>
                <Link href="/products">Explore Products</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {products.map((p) => {
                const product = p.products || p.product
                return (
                  <Link key={p.id} href={`/products/${p.product_id}`} className="group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
                      {product?.image_url ? (
                        <img src={product.image_url} alt={product?.name || 'Product'} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-medium truncate group-hover:text-primary transition-colors">{product?.name || 'Unknown'}</p>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Affiliate Stats (if applicable) */}
      {affiliateStats && (
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <TrendingUp className="h-5 w-5" />
              Affiliate Performance
            </CardTitle>
            <CardDescription>Your earnings as an affiliate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold text-orange-600">${affiliateStats.total_earnings.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">${affiliateStats.pending_earnings.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid Out</p>
                <p className="text-2xl font-bold text-green-600">${affiliateStats.paid_earnings.toFixed(2)}</p>
              </div>
            </div>
            <Button variant="outline" className="mt-4 border-orange-300" asChild>
              <Link href="/dashboard/affiliate">View Affiliate Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle><CardDescription>Get things done faster</CardDescription></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="justify-between" asChild><Link href="/products">Browse Products <ArrowRight className="h-4 w-4" /></Link></Button>
          <Button variant="outline" className="justify-between" asChild><Link href="/dashboard/orders">My Orders <ArrowRight className="h-4 w-4" /></Link></Button>
          <Button variant="outline" className="justify-between" asChild><Link href="/dashboard/licenses">My Licenses <ArrowRight className="h-4 w-4" /></Link></Button>
          <Button variant="outline" className="justify-between" asChild><Link href="/dashboard/settings">Account Settings <ArrowRight className="h-4 w-4" /></Link></Button>
        </CardContent>
      </Card>
    </div>
  )
}
