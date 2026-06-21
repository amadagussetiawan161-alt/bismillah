'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Search, ChevronLeft, ChevronRight, MoveVertical as MoreVertical, Shield, ShieldOff, UserX, UserCheck, Trash2, Loader as Loader2, Users } from 'lucide-react'

interface UserProfile {
  id: string; user_id: string; email: string; full_name: string | null; role: string; created_at: string
  license?: { id: string; status: string; expires_at: string | null; products: { name: string }[] | null }
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

  useEffect(() => { fetchUsers() }, [currentPage, roleFilter, searchQuery])

  const fetchUsers = async () => {
    const supabase = createBrowserSupabaseClient()
    setLoading(true)
    try {
      let query = supabase.from('profiles').select('id, user_id, email, full_name, role, created_at', { count: 'exact' })
      if (roleFilter !== 'all') query = query.eq('role', roleFilter)
      if (searchQuery) query = query.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
      const { data, count, error } = await query.order('created_at', { ascending: false }).range((currentPage - 1) * perPage, currentPage * perPage - 1)
      if (error) throw error
      const userIds = (data || []).map(u => u.user_id)
      const { data: licenses } = await supabase.from('licenses').select('id, user_id, status, expires_at, products(name)').in('user_id', userIds)
      const usersWithLicenses = (data || []).map(user => ({ ...user, license: licenses?.find(l => l.user_id === user.user_id) as UserProfile['license'] }))
      setUsers(usersWithLicenses)
      setTotalUsers(count || 0)
    } catch { toast.error('Gagal memuat data') } finally { setLoading(false) }
  }

  const totalPages = Math.ceil(totalUsers / perPage)

  const handleAction = async (action: string, user: UserProfile) => {
    const supabase = createBrowserSupabaseClient()
    setActionLoading(user.id)
    setActionMenuOpen(null)
    switch (action) {
      case 'make_admin': { const r = await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id); if (r.error) toast.error('Gagal'); else { toast.success('Berhasil'); fetchUsers() } break }
      case 'remove_admin': { const r = await supabase.from('profiles').update({ role: 'member' }).eq('id', user.id); if (r.error) toast.error('Gagal'); else { toast.success('Berhasil'); fetchUsers() } break }
      case 'suspend': if (user.license) { const r = await supabase.from('licenses').update({ status: 'suspended' }).eq('id', user.license.id); if (r.error) toast.error('Gagal'); else { toast.success('Berhasil'); fetchUsers() } } break
      case 'activate': if (user.license) { const r = await supabase.from('licenses').update({ status: 'active' }).eq('id', user.license.id); if (r.error) toast.error('Gagal'); else { toast.success('Berhasil'); fetchUsers() } } break
      case 'delete': if (confirm(`Hapus ${user.email}?`)) { const r = await supabase.from('profiles').delete().eq('id', user.id); if (r.error) toast.error('Gagal'); else { toast.success('Berhasil'); fetchUsers() } } break
    }
    setActionLoading(null)
  }

  const getLicenseBadge = (u: UserProfile) => {
    if (!u.license) return <Badge variant="secondary">Tidak ada lisensi</Badge>
    const exp = u.license.expires_at && new Date(u.license.expires_at) < new Date()
    if (u.license.status === 'suspended') return <Badge variant="warning">Ditangguhkan</Badge>
    if (u.license.status === 'expired' || exp) return <Badge variant="error">Kedaluwarsa</Badge>
    if (u.license.status === 'active') return <Badge variant="success">Aktif</Badge>
    return <Badge variant="secondary">{u.license.status}</Badge>
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-semibold text-slate-900">User Management</h1><p className="text-slate-500 mt-1">Kelola semua pengguna platform</p></div>
      <Card><CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Cari pengguna..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} className="pl-10" />
          </div>
          <div className="w-full sm:w-40">
            <Select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1) }}>
              <option value="all">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </Select>
          </div>
        </div>
      </CardContent></Card>
      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Pengguna</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Nama</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Role</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Lisensi</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Kedaluwarsa</th>
              <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Aksi</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" /></td></tr>
               : users.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-slate-500"><Users className="h-10 w-10 mx-auto mb-2 opacity-30" />Tidak ada pengguna</td></tr>
               : users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"><span className="text-sm font-semibold text-blue-600">{u.email?.charAt(0).toUpperCase()}</span></div>
                      <div><p className="font-medium text-sm text-slate-900">{u.email}</p><p className="text-xs text-slate-500">{u.user_id?.slice(0, 8)}</p></div>
                    </div>
                  </td>
                  <td className="py-4 px-6"><span className="text-sm text-slate-900">{u.full_name || '-'}</span></td>
                  <td className="py-4 px-6"><Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role === 'admin' ? 'Admin' : 'Member'}</Badge></td>
                  <td className="py-4 px-6">{getLicenseBadge(u)}</td>
                  <td className="py-4 px-6"><span className="text-sm text-slate-600">{u.license?.expires_at ? formatDate(u.license.expires_at) : '-'}</span></td>
                  <td className="py-4 px-6">
                    <div className="relative">
                      <button onClick={() => setActionMenuOpen(actionMenuOpen === u.id ? null : u.id)} className="p-2 hover:bg-slate-100 rounded-lg" disabled={actionLoading === u.id}>
                        {actionLoading === u.id ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <MoreVertical className="h-4 w-4 text-slate-400" />}
                      </button>
                      {actionMenuOpen === u.id && (
                        <><div className="fixed inset-0 z-40" onClick={() => setActionMenuOpen(null)} />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border py-1 z-50">
                          <button onClick={() => handleAction('make_admin', u)} disabled={u.role === 'admin'} className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 ${u.role === 'admin' ? 'opacity-50' : ''}`}><Shield className="h-4 w-4" /> Jadikan Admin</button>
                          <button onClick={() => handleAction('remove_admin', u)} disabled={u.role !== 'admin'} className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 ${u.role !== 'admin' ? 'opacity-50' : ''}`}><ShieldOff className="h-4 w-4" /> Hapus Admin</button>
                          <div className="border-t my-1" />
                          {u.license && u.license.status !== 'suspended' && <button onClick={() => handleAction('suspend', u)} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-amber-600"><UserX className="h-4 w-4" /> Tangguhkan</button>}
                          {u.license && u.license.status === 'suspended' && <button onClick={() => handleAction('activate', u)} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-emerald-600"><UserCheck className="h-4 w-4" /> Aktivasi</button>}
                          <div className="border-t my-1" />
                          <button onClick={() => handleAction('delete', u)} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"><Trash2 className="h-4 w-4" /> Hapus</button>
                        </div></>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <p className="text-sm text-slate-500">Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalUsers)} dari {totalUsers}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="flex items-center px-3 text-sm text-slate-600">Halaman {currentPage} dari {totalPages || 1}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardContent></Card>
    </div>
  )
}
