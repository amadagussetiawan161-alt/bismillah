'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { Search, ChevronLeft, ChevronRight, Loader as Loader2, ShoppingCart, Eye, MoveVertical as MoreVertical } from 'lucide-react'

interface Order {
  id: string
  user_id: string
  order_number: string
  status: string
  total_amount: number
  created_at: string
  profiles: { email: string }[] | null
}

export default function OrdersManagementPage() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  const perPage = 10
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter, searchQuery])

  const fetchOrders = async () => {
    setLoading(true)
    let query = supabase
      .from('orders')
      .select('id, user_id, order_number, status, total_amount, created_at, profiles(email)', { count: 'exact' })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    if (searchQuery) {
      query = query.or(`order_number.ilike.%${searchQuery}%`)
    }

    const from = (currentPage - 1) * perPage
    const to = from + perPage - 1
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to)

    if (error) {
      toast.error('Gagal memuat data pesanan')
      setLoading(false)
      return
    }

    setOrders(data || [])
    setTotalOrders(count || 0)
    setLoading(false)
  }

  const totalPages = Math.ceil(totalOrders / perPage)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="success">Dibayar</Badge>
      case 'pending': return <Badge variant="warning">Menunggu</Badge>
      case 'cancelled': return <Badge variant="error">Dibatalkan</Badge>
      case 'refunded': return <Badge variant="secondary">Dikembalikan</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
        <p className="text-slate-500 mt-1">Kelola semua pesanan</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari pesanan..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="all">Semua Status</option>
                <option value="paid">Dibayar</option>
                <option value="pending">Menunggu</option>
                <option value="cancelled">Dibatalkan</option>
                <option value="refunded">Dikembalikan</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Pesanan</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Pengguna</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Total</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500">
                      <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      Tidak ada pesanan
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-sm text-slate-900">{order.order_number || order.id.slice(0, 8)}</p>
                          <p className="text-xs text-slate-500">{order.id.slice(0, 8)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-600">{order.profiles?.[0]?.email || '-'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(order.total_amount || 0)}</span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-600">{formatDateTime(order.created_at)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalOrders)} dari {totalOrders} pesanan
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-3 text-sm text-slate-600">
                {currentPage} / {totalPages || 1}
              </span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
