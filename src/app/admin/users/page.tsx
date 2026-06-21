'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { formatDateTime, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Search, ChevronLeft, ChevronRight, MoveVertical as MoreVertical, Eye, Shield, ShieldOff, UserX, UserCheck, Trash2, Key, Loader as Loader2, X, Mail, Calendar, Clock, Users } from 'lucide-react'

interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
  created_at: string
  updated_at: string
}

interface UserLicense {
  id: string
  user_id: string
  product_id: string
  products: { name: string }[] | null
  status: string
  expires_at: string | null
}

interface UserWithLicense extends UserProfile {
  license?: UserLicense
}

export default function UserManagementPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserWithLicense[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserWithLicense | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const perPage = 10

  useEffect(() => {
    fetchUsers()
  }, [currentPage, roleFilter, statusFilter, searchQuery])

  const fetchUsers = async () => {
    const supabase = createBrowserSupabaseClient()
    setLoading(true)

    try {
      let query = supabase.from('profiles').select('id, user_id, email, full_name, avatar_url, role, created_at, updated_at', { count: 'exact' })

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter)
      }

      if (searchQuery) {
        query = query.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
      }

      const from = (currentPage - 1) * perPage
      const to = from + perPage - 1
      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to)

      if (error) throw error

      // Fetch licenses for each user
      const userIds = (data || []).map(u => u.user_id)
      const { data: licenses } = await supabase
        .from('licenses')
        .select('id, user_id, product_id, status, expires_at, products(name)')
        .in('user_id', userIds)

      // Merge user with license info
      const usersWithLicenses: UserWithLicense[] = (data || []).map(user => {
        const userLicense = (licenses || []).find(l => l.user_id === user.user_id)
        return {
          ...user,
          license: userLicense as UserLicense | undefined,
        }
      })

      let filteredUsers = usersWithLicenses
      if (statusFilter !== 'all') {
        filteredUsers = usersWithLicenses.filter(u => {
          if (statusFilter === 'active') {
            return u.license?.status === 'active' || !u.license
          }
          if (statusFilter === 'expired') {
            return u.license?.status === 'expired' || (u.license?.expires_at && new Date(u.license.expires_at) < new Date())
          }
          if (statusFilter === 'no_license') {
            return !u.license
          }
          return true
        })
      }

      setUsers(filteredUsers)
      setTotalUsers(count || 0)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Gagal memuat data pengguna')
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalUsers / perPage)

  const handleAction = async (action: string, user: UserWithLicense) => {
    const supabase = createBrowserSupabaseClient()
    setActionLoading(user.id)
    setActionMenuOpen(null)

    switch (action) {
      case 'view':
        setSelectedUser(user)
        setShowDetail(true)
        break

      case 'make_admin':
        const adminResult = await supabase
          .from('profiles')
          .update({ role: 'admin', updated_at: new Date().toISOString() })
          .eq('id', user.id)
        if (adminResult.error) {
          toast.error('Gagal mengubah role admin')
        } else {
          toast.success(`${user.email} sekarang adalah admin`)
          fetchUsers()
        }
        break

      case 'remove_admin':
        const removeAdminResult = await supabase
          .from('profiles')
          .update({ role: 'member', updated_at: new Date().toISOString() })
          .eq('id', user.id)
        if (removeAdminResult.error) {
          toast.error('Gagal menghapus role admin')
        } else {
          toast.success(`${user.email} bukan admin lagi`)
          fetchUsers()
        }
        break

      case 'suspend':
        if (user.license) {
          const suspendResult = await supabase
            .from('licenses')
            .update({ status: 'suspended' })
            .eq('id', user.license.id)
          if (suspendResult.error) {
            toast.error('Gagal menangguhkan lisensi')
          } else {
            toast.success('Lisensi pengguna ditangguhkan')
            fetchUsers()
          }
        } else {
          toast.error('Pengguna tidak memiliki lisensi')
        }
        break

      case 'activate':
        if (user.license) {
          const activateResult = await supabase
            .from('licenses')
            .update({ status: 'active' })
            .eq('id', user.license.id)
          if (activateResult.error) {
            toast.error('Gagal mengaktivasi lisensi')
          } else {
            toast.success('Lisensi pengguna diaktivasi')
            fetchUsers()
          }
        } else {
          toast.error('Pengguna tidak memiliki lisensi')
        }
        break

      case 'delete':
        if (confirm(`Apakah Anda yakin ingin menghapus ${user.email}?`)) {
          try {
            // Delete from profiles first
            await supabase.from('profiles').delete().eq('id', user.id)
            toast.success('Pengguna berhasil dihapus')
            fetchUsers()
          } catch (error) {
            toast.error('Gagal menghapus pengguna')
          }
        }
        break
    }

    setActionLoading(null)
  }

  const getLicenseStatusBadge = (user: UserWithLicense) => {
    if (!user.license) {
      return <Badge variant="secondary">Tidak ada lisensi</Badge>
    }

    const isExpired = user.license.expires_at && new Date(user.license.expires_at) < new Date()
    const status = user.license.status

    if (status === 'suspended') {
      return <Badge variant="warning">Ditangguhkan</Badge>
    }
    if (status === 'expired' || isExpired) {
      return <Badge variant="error">Kedaluwarsa</Badge>
    }
    if (status === 'active') {
      return <Badge variant="success">Aktif</Badge>
    }
    return <Badge variant="secondary">{status}</Badge>
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
        <p className="text-slate-500 mt-1">Kelola semua pengguna platform</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari pengguna..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>

            <div className="w-full sm:w-40">
              <Select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="all">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </Select>
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
                <option value="active">Lisensi Aktif</option>
                <option value="expired">Lisensi Kedaluwarsa</option>
                <option value="no_license">Tanpa Lisensi</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Pengguna</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Status Lisensi</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Kedaluwarsa</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Terdaftar</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      Tidak ada pengguna ditemukan
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                              <span className="text-sm font-semibold text-blue-600">
                                {user.email?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-slate-900 truncate">{user.email}</p>
                            <p className="text-xs text-slate-500 truncate">{user.user_id?.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-900">{user.full_name || '-'}</span>
                      </td>

                      <td className="py-4 px-6">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'Admin' : 'Member'}
                        </Badge>
                      </td>

                      <td className="py-4 px-6">
                        {getLicenseStatusBadge(user)}
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-600">
                          {user.license?.expires_at ? formatDate(user.license.expires_at) : '-'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-600">
                          {formatDate(user.created_at)}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                            ) : (
                              <MoreVertical className="h-4 w-4 text-slate-400" />
                            )}
                          </button>

                          {actionMenuOpen === user.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setActionMenuOpen(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                                <button
                                  onClick={() => handleAction('view', user)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" /> Lihat Detail
                                </button>
                                <button
                                  onClick={() => handleAction('make_admin', user)}
                                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 ${user.role === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  disabled={user.role === 'admin'}
                                >
                                  <Shield className="h-4 w-4" /> Jadikan Admin
                                </button>
                                <button
                                  onClick={() => handleAction('remove_admin', user)}
                                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 ${user.role !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  disabled={user.role !== 'admin'}
                                >
                                  <ShieldOff className="h-4 w-4" /> Hapus Admin
                                </button>
                                <div className="border-t border-slate-100 my-1" />
                                {user.license && (
                                  <>
                                    {user.license.status !== 'suspended' && (
                                      <button
                                        onClick={() => handleAction('suspend', user)}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-amber-600"
                                      >
                                        <UserX className="h-4 w-4" /> Tangguhkan Lisensi
                                      </button>
                                    )}
                                    {user.license.status === 'suspended' && (
                                      <button
                                        onClick={() => handleAction('activate', user)}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-emerald-600"
                                      >
                                        <UserCheck className="h-4 w-4" /> Aktivasi Lisensi
                                      </button>
                                    )}
                                  </>
                                )}
                                <div className="border-t border-slate-100 my-1" />
                                <button
                                  onClick={() => handleAction('delete', user)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" /> Hapus Pengguna
                                </button>
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
              Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalUsers)} dari {totalUsers} pengguna
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

      {/* User Detail Modal */}
      {showDetail && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDetail(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Detail Pengguna</h2>
                <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-semibold text-blue-600">
                      {selectedUser.email?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{selectedUser.full_name || selectedUser.email}</p>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                  <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'} className="mt-1">
                    {selectedUser.role === 'admin' ? 'Admin' : 'Member'}
                  </Badge>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-900">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Terdaftar</p>
                    <p className="text-sm font-medium text-slate-900">{formatDateTime(selectedUser.created_at)}</p>
                  </div>
                </div>

                {/* License Info */}
                {selectedUser.license && (
                  <>
                    <div className="border-t border-slate-200 pt-4 mt-4">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">Informasi Lisensi</h3>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <Key className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Produk</p>
                        <p className="text-sm font-medium text-slate-900">
                          {selectedUser.license.products?.[0]?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      {selectedUser.license.status === 'active' ? (
                        <UserCheck className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <UserX className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-xs text-slate-500">Status Lisensi</p>
                        {getLicenseStatusBadge(selectedUser)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Kedaluwarsa</p>
                        <p className="text-sm font-medium text-slate-900">
                          {selectedUser.license.expires_at ? formatDateTime(selectedUser.license.expires_at) : 'Selamanya'}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowDetail(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
