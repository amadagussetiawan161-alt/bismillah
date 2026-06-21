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
import { Search, ChevronLeft, ChevronRight, Loader as Loader2, CreditCard } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  status: string
  payment_method: string | null
  created_at: string
  profiles: { email: string }[] | null
}

export default function PaymentsManagementPage() {
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPayments, setTotalPayments] = useState(0)

  const perPage = 10
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    fetchPayments()
  }, [currentPage, statusFilter, searchQuery])

  const fetchPayments = async () => {
    setLoading(true)
    const { data, count, error } = await supabase
      .from('payments')
      .select('id, amount, status, payment_method, created_at, profiles(email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((currentPage - 1) * perPage, currentPage * perPage - 1)

    if (error) {
      toast.error('Gagal memuat data pembayaran')
      setLoading(false)
      return
    }

    setPayments(data || [])
    setTotalPayments(count || 0)
    setLoading(false)
  }

  const totalPages = Math.ceil(totalPayments / perPage)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="success">Dibayar</Badge>
      case 'pending': return <Badge variant="warning">Menunggu</Badge>
      case 'failed': return <Badge variant="error">Gagal</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Payments</h1>
        <p className="text-slate-500 mt-1">Kelola semua pembayaran</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari pembayaran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Semua Status</option>
                <option value="paid">Dibayar</option>
                <option value="pending">Menunggu</option>
                <option value="failed">Gagal</option>
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
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Pembayaran</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Pengguna</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Jumlah</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Metode</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      Tidak ada pembayaran
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium text-slate-900">{payment.id.slice(0, 8)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-600">{payment.profiles?.[0]?.email || '-'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(payment.amount || 0)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-600">{payment.payment_method || '-'}</span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-600">{formatDateTime(payment.created_at)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">Total: {totalPayments} pembayaran</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-3 text-sm text-slate-600">Halaman {currentPage}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
