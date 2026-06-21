'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createBrowserClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<{ id: string; order_number: string; total_amount: number; status: string; created_at: string; user: { email: string } | null }[]>([])
  const supabase = createBrowserClient()

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('id, order_number, total_amount, status, created_at, user:profiles(email)').order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    if (error) toast.error('Failed to update status')
    else { toast.success('Status updated'); fetchOrders() }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': case 'completed': return 'bg-green-500/10 text-green-500'
      case 'pending': return 'bg-yellow-500/10 text-yellow-500'
      case 'processing': return 'bg-blue-500/10 text-blue-500'
      case 'cancelled': return 'bg-red-500/10 text-red-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div>
      <div className="mb-8"><h1 className="text-3xl font-bold">Orders</h1><p className="text-muted-foreground">{orders.length} orders</p></div>

      <Card>
        <CardHeader><CardTitle>All Orders</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead><tr className="border-b"><th className="text-left py-3 px-4">Order</th><th className="text-left py-3 px-4">Customer</th><th className="text-left py-3 px-4">Total</th><th className="text-left py-3 px-4">Status</th><th className="text-left py-3 px-4">Date</th><th className="text-left py-3 px-4">Actions</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-mono text-sm">{order.order_number}</td>
                  <td className="py-3 px-4">{order.user?.email || '-'}</td>
                  <td className="py-3 px-4 font-semibold">${order.total_amount}</td>
                  <td className="py-3 px-4"><Badge className={getStatusColor(order.status)}>{order.status}</Badge></td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <select className="text-sm border rounded px-2 py-1" value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
