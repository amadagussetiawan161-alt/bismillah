'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Search, ChevronLeft, ChevronRight, MoreVertical, Eye, Shield, ShieldOff, UserX, UserCheck, Trash2, Key, Loader2, Users } from 'lucide-react'

interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  license?: {
    id: string
    status: string
    expires_at: string | null
    products: { name: string }[] | null
  }
}

export default function UserManagementPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const perPage = 10

  useEffect(() => {
    fetchUsers()
  }, [currentPage, roleFilter, searchQuery])

  const fetchUsers = async () => {
    const supabase = createBrowserSupabaseClient()
    setLoading(true)

    try {
      let query = supabase.from('profiles').select('id, user_id, email, full_name, role, created_at', { count: 'exact' })

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter)
      }

      if (searchQuery) {
        query = query.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
      }

      const from = (currentPage - 1) * perPage
      const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + perPage - 1)

      if (error) throw error

      // Fetch licenses
      const userIds = (data || []).map(u => u.user_id)
      const { data: licenses } = await supabase
        .from('licenses')
        .select('id, user_id, status, expires_at, products(name)')
        .in('user_id', userIds)

      const usersWithLicenses = (data || []).map(user => ({
        ...user,
        license: licenses?.find(l => l.user_id === user.user_id) as UserProfile['license'],
      }))

      setUsers(usersWithLicenses)
      setTotalUsers(count || 0)
    } catch {
      toast.error('Gagal memuat data pengguna')
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalUsers / perPage)

  const handleAction = async (action: string, user: UserProfile) => {
    const supabase = createBrowserSupabaseClient()
    setActionLoading(user.id)
    setActionMenuOpen(null)

    switch (action) {
      case 'make_admin':
        const adminResult = await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id)
        if (adminResult.error) toast.error('Gagal mengubah role admin')
        else { toast.success(`${user.email} sekarang adalah admin`); fetchUsers() }
        break
      case 'remove_admin':
        const removeResult = await supabase.from('profiles').update({ role: 'member' }).eq('id', user.id)
        if (removeResult.error) toast.error('Gagal menghapus role admin')
        else { toast.success(`${user.email} bukan admin lagi`); fetchUsers() }
        break
      case 'suspend_license':
        if (user.license) {
          const suspendResult = await supabase.from('licenses').update({ status: 'suspended' }).eq('id', user.license.id)
          if (suspendResult.error) toast.error('Gagal menangguhkan lisensi')
          else { toast.success('Lisensi ditangguhkan'); fetchUsers() }
        }
        break
      case 'activate_license':
        if (user.license) {
          const activateResult = await supabase.from('licenses').update({ status: 'active' }).eq('id', user.license.id)
          if (activateResult.error) toast.error('Gagal mengaktivasi lisensi')
          else { toast.success('Lisensi diaktivasi'); fetchUsers() }
        }
        break
      case 'delete':
        if (confirm(`Hapus ${user.email}?`)) {
          const deleteResult = await supabase.from('profiles').delete().eq('id', user.id)
          if (deleteResult.error) toast.error('Gagal menghapus')
          else { toast.success('Pengguna dihapus'); fetchUsers() }
        }
        break
    }

    setActionLoading(null)
  }

  const getLicenseStatusBadge = (user: UserProfile) => {
    if (!user.license) return <Badge variant="secondary">Tidak ada lisensi</Badge>
    const isExpired = user.license.expires_at && new Date(user.license.expires_at) < new Date()
    if (user.license.status === 'suspended') return <Badge variant="warning">Ditangguhkan</Badge>
    if (user.license.status === 'expired' || isExpired) return <Badge variant="error">Kedaluwarsa</Badge>
    if (user.license.status === 'active') return <Badge variant="success">Aktif</Badge>
    return <Badge variant="secondary">{user.license.status}</Badge>
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
        <p className="text-slate-500 mt-1">Kelola semua pengguna platform</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari pengguna..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-40">
              <Select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1) }}>
                <option value="all">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
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
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Pengguna</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Nama</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Role</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Lisensi</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Kedaluwarsa</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" /></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-500"><Users className="h-10 w-10 mx-auto mb-2 opacity-30" />Tidak ada pengguna</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">{user.email?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-900">{user.email}</p>
                            <p className="text-xs text-slate-500">{user.user_id?.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6"><span className="text-sm text-slate-900">{user.full_name || '-'}</span></td>
                      <td className="py-4 px-6">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role === 'admin' ? 'Admin' : 'Member'}</Badge>
                      </td>
                      <td className="py-4 px-6">{getLicenseStatusBadge(user)}</td>
                      <td className="py-4 px-6"><span className="text-sm text-slate-600">{user.license?.expires_at ? formatDate(user.license.expires_at) : '-'}</span></td>
                      <td className="py-4 px-6">
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                            className="p-2 hover:bg-slate-100 rounded-lg"
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <MoreVertical className="h-4 w-4 text-slate-400" />}
                          </button>
                          {actionMenuOpen === user.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActionMenuOpen(null)} />
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border py-1 z-50">
                                <button onClick={() => { setActionMenuOpen(null) }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"><Eye className="h-4 w-4" /> Lihat Detail</button>
                                <button onClick={() => handleAction('make_admin', user)} disabled={user.role === 'admin'} className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 ${user.role === 'admin' ? 'opacity-50' : ''}`}><Shield className="h-4 w-4" /> Jadikan Admin</button>
                                <button onClick={() => handleAction('remove_admin', user)} disabled={user.role !== 'admin'} className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 ${user.role !== 'admin' ? 'opacity-50' : ''}`}><ShieldOff className="h-4 w-4" /> Hapus Admin</button>
                                <div className="border-t my-1" />
                                {user.license && user.license.status !== 'suspended' && (
                                  <button onClick={() => handleAction('suspend_license', user)} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-amber-600"><UserX className="h-4 w-4" /> Tangguhkan Lisensi</button>
                                )}
                                {user.license && user.license.status === 'suspended' && (
                                  <button onClick={() => handleAction('activate_license', user)} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-emerald-600"><UserCheck className="h-4 w-4" /> Aktivasi Lisensi</button>
                                )}
                                <div className="border-t my-1" />
                                <button onClick={() => handleAction('delete', user)} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"><Trash2 className="h-4 w-4" /> Hapus Pengguna</button>
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalUsers)} dari {totalUsers} pengguna
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="flex items-center px-3 text-sm text-slate-600">Halaman {currentPage} dari {totalPages || 1}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
