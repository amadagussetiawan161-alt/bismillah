'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { formatDateTime, formatDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { Search, ChevronLeft, ChevronRight, MoveVertical as MoreVertical, Key, Loader as Loader2, X, Calendar, Clock, User, Package, Plus, ArrowUpRight, Ban, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react'

interface License {
  id: string
  user_id: string
  product_id: string
  license_key: string
  status: string
  expires_at: string | null
  created_at: string
  updated_at: string
  profiles: { email: string; full_name: string | null }[] | null
  products: { name: string; price: number }[] | null
  purchases?: { amount: number }[] | null
}

interface SelectedLicense extends License {
  user_email?: string
  user_name?: string
  product_name?: string
}

export default function LicensesManagementPage() {
  const [loading, setLoading] = useState(true)
  const [licenses, setLicenses] = useState<License[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalLicenses, setTotalLicenses] = useState(0)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const [selectedLicense, setSelectedLicense] = useState<SelectedLicense | null>(null)
  const [showExtendModal, setShowExtendModal] = useState(false)
  const [extendDays, setExtendDays] = useState(30)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const perPage = 10
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    fetchLicenses()
  }, [currentPage, statusFilter, searchQuery])

  const fetchLicenses = async () => {
    setLoading(true)
    let query = supabase
      .from('licenses')
      .select('id, user_id, product_id, license_key, status, expires_at, created_at, updated_at, profiles(email, full_name), products(name, price)', { count: 'exact' })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    if (searchQuery) {
      query = query.or(`license_key.ilike.%${searchQuery}%`)
    }

    const from = (currentPage - 1) * perPage
    const to = from + perPage - 1
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to)

    if (error) {
      toast.error('Gagal memuat data lisensi')
      setLoading(false)
      return
    }

    setLicenses(data || [])
    setTotalLicenses(count || 0)
    setLoading(false)
  }

  const totalPages = Math.ceil(totalLicenses / perPage)

  const handleAction = async (action: string, license: License) => {
    setActionLoading(license.id)
    setActionMenuOpen(null)

    switch (action) {
      case 'view':
        setSelectedLicense({
          ...license,
          user_email: license.profiles?.[0]?.email,
          user_name: license.profiles?.[0]?.full_name || undefined,
          product_name: license.products?.[0]?.name,
        })
        break

      case 'extend':
        setSelectedLicense({
          ...license,
          user_email: license.profiles?.[0]?.email,
          product_name: license.products?.[0]?.name,
        })
        setShowExtendModal(true)
        break

      case 'reactivate':
        const reactivateResult = await supabase
          .from('licenses')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', license.id)
        if (reactivateResult.error) {
          toast.error('Gagal mengaktivasi lisensi')
        } else {
          toast.success('Lisensi berhasil diaktivasi')
          fetchLicenses()
        }
        break

      case 'suspend':
        const suspendResult = await supabase
          .from('licenses')
          .update({ status: 'suspended', updated_at: new Date().toISOString() })
          .eq('id', license.id)
        if (suspendResult.error) {
          toast.error('Gagal menangguhkan lisensi')
        } else {
          toast.success('Lisensi berhasil ditangguhkan')
          fetchLicenses()
        }
        break
    }

    setActionLoading(null)
  }

  const handleExtendLicense = async () => {
    if (!selectedLicense) return

    const currentExpiry = selectedLicense.expires_at ? new Date(selectedLicense.expires_at) : new Date()
    const newExpiry = new Date(currentExpiry.getTime() + extendDays * 24 * 60 * 60 * 1000)

    const { error } = await supabase
      .from('licenses')
      .update({
        expires_at: newExpiry.toISOString(),
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedLicense.id)

    if (error) {
      toast.error('Gagal memperpanjang lisensi')
    } else {
      toast.success(`Lisensi diperpanjang ${extendDays} hari`)
      setShowExtendModal(false)
      setSelectedLicense(null)
      fetchLicenses()
    }
  }

  const getStatusBadge = (license: License) => {
    const isExpired = license.expires_at && new Date(license.expires_at) < new Date()

    if (license.status === 'suspended') {
      return <Badge variant="warning">Ditangguhkan</Badge>
    }
    if (license.status === 'expired' || isExpired) {
      return <Badge variant="error">Kedaluwarsa</Badge>
    }
    if (license.status === 'active') {
      return <Badge variant="success">Aktif</Badge>
    }
    return <Badge variant="secondary">{license.status}</Badge>
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">License Management</h1>
        <p className="text-slate-500 mt-1">Kelola semua lisensi pengguna</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari lisensi..."
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
                <option value="active">Aktif</option>
                <option value="expired">Kedaluwarsa</option>
                <option value="suspended">Ditangguhkan</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Licenses Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Lisensi</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Pengguna</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Produk</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Kedaluwarsa</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                    </td>
                  </tr>
                ) : licenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      <Key className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      Tidak ada lisensi ditemukan
                    </td>
                  </tr>
                ) : (
                  licenses.map((license) => (
                    <tr key={license.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Key className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-mono text-xs text-slate-600 truncate max-w-[200px]">
                              {license.license_key?.slice(0, 24)}...
                            </p>
                            <p className="text-xs text-slate-400">{license.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {license.profiles?.[0]?.email || '-'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {license.profiles?.[0]?.full_name || ''}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-900">
                          {license.products?.[0]?.name || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(license)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-600">
                          {license.expires_at ? formatDate(license.expires_at) : 'Selamanya'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === license.id ? null : license.id)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            disabled={actionLoading === license.id}
                          >
                            {actionLoading === license.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                            ) : (
                              <MoreVertical className="h-4 w-4 text-slate-400" />
                            )}
                          </button>

                          {actionMenuOpen === license.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActionMenuOpen(null)} />
                              <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                                <button
                                  onClick={() => handleAction('view', license)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Key className="h-4 w-4" /> Lihat Detail
                                </button>
                                <button
                                  onClick={() => handleAction('extend', license)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Plus className="h-4 w-4" /> Perpanjang Lisensi
                                </button>
                                <button
                                  onClick={() => handleAction('extend', license)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <ArrowUpRight className="h-4 w-4" /> Upgrade Lisensi
                                </button>
                                <div className="border-t border-slate-100 my-1" />
                                {license.status === 'suspended' || license.status === 'expired' ? (
                                  <button
                                    onClick={() => handleAction('reactivate', license)}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-emerald-600"
                                  >
                                    <CheckCircle className="h-4 w-4" /> Reaktivasi
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleAction('suspend', license)}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-amber-600"
                                  >
                                    <Ban className="h-4 w-4" /> Tangguhkan
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalLicenses)} dari {totalLicenses} lisensi
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1 px-3 text-sm text-slate-600">
                Halaman {currentPage} dari {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extend License Modal */}
      {showExtendModal && selectedLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowExtendModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Perpanjang Lisensi</h2>
              <button onClick={() => setShowExtendModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">Pengguna</p>
                <p className="text-sm font-medium text-slate-900">{selectedLicense.user_email}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">Produk</p>
                <p className="text-sm font-medium text-slate-900">{selectedLicense.product_name}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500">Kedaluwarsa Saat Ini</p>
                <p className="text-sm font-medium text-slate-900">
                  {selectedLicense.expires_at ? formatDateTime(selectedLicense.expires_at) : 'Selamanya'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Perpanjang (hari)
                </label>
                <Select
                  value={extendDays.toString()}
                  onChange={(e) => setExtendDays(parseInt(e.target.value))}
                >
                  <option value="30">30 hari</option>
                  <option value="90">90 hari</option>
                  <option value="180">180 hari</option>
                  <option value="365">365 hari (1 tahun)</option>
                </Select>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-slate-500">Kedaluwarsa Baru</p>
                <p className="text-sm font-medium text-blue-900">
                  {formatDate(new Date(
                    (selectedLicense.expires_at ? new Date(selectedLicense.expires_at) : new Date()).getTime() +
                    extendDays * 24 * 60 * 60 * 1000
                  ).toISOString())}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowExtendModal(false)}>
                  Batal
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleExtendLicense}>
                  Perpanjang Lisensi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* License Detail Modal */}
      {selectedLicense && !showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedLicense(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Detail Lisensi</h2>
                <button onClick={() => setSelectedLicense(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Key className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <p className="font-mono text-sm text-slate-600">{selectedLicense.license_key}</p>
                  {getStatusBadge(selectedLicense)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <User className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Pengguna</p>
                    <p className="text-sm font-medium text-slate-900">{selectedLicense.user_email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Package className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Produk</p>
                    <p className="text-sm font-medium text-slate-900">{selectedLicense.product_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Kedaluwarsa</p>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedLicense.expires_at ? formatDateTime(selectedLicense.expires_at) : 'Selamanya'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Dibuat</p>
                    <p className="text-sm font-medium text-slate-900">{formatDateTime(selectedLicense.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowExtendModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Perpanjang
                </Button>
                {selectedLicense.status === 'suspended' || selectedLicense.status === 'expired' ? (
                  <Button
                    onClick={async () => {
                      const { error } = await supabase
                        .from('licenses')
                        .update({ status: 'active', updated_at: new Date().toISOString() })
                        .eq('id', selectedLicense.id)
                      if (!error) {
                        toast.success('Lisensi berhasil diaktivasi')
                        setSelectedLicense(null)
                        fetchLicenses()
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Reaktivasi
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      const { error } = await supabase
                        .from('licenses')
                        .update({ status: 'suspended', updated_at: new Date().toISOString() })
                        .eq('id', selectedLicense.id)
                      if (!error) {
                        toast.success('Lisensi ditangguhkan')
                        setSelectedLicense(null)
                        fetchLicenses()
                      }
                    }}
                  >
                    <Ban className="h-4 w-4 mr-2" /> Tangguhkan
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
