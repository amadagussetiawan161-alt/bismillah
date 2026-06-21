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
import { Search, ChevronLeft, ChevronRight, Loader as Loader2, Users as Users2 } from 'lucide-react'

export default function AffiliatesManagementPage() {
  const [loading, setLoading] = useState(true)
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalAffiliates, setTotalAffiliates] = useState(0)

  const perPage = 10
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    fetchAffiliates()
  }, [currentPage])

  const fetchAffiliates = async () => {
    setLoading(true)
    const { data, count, error } = await supabase
      .from('affiliates')
      .select('id, status, created_at, profiles(email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((currentPage - 1) * perPage, currentPage * perPage - 1)

    if (error) {
      toast.error('Gagal memuat data affiliate')
      setLoading(false)
      return
    }

    setAffiliates(data || [])
    setTotalAffiliates(count || 0)
    setLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Affiliates</h1>
        <p className="text-slate-500 mt-1">Kelola program afiliasi</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Affiliate</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Bergabung</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                    </td>
                  </tr>
                ) : affiliates.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-slate-500">
                      <Users2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      Tidak ada affiliate
                    </td>
                  </tr>
                ) : (
                  affiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-900">{affiliate.profiles?.[0]?.email || affiliate.id.slice(0, 8)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={affiliate.status === 'active' ? 'success' : 'secondary'}>
                          {affiliate.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-600">{formatDateTime(affiliate.created_at)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
