'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createBrowserClient } from '@/lib/supabase/client'
import { Loader2, Search, UserX, Shield, User } from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [search, setSearch] = useState('')
  const supabase = createBrowserClient()

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('id, user_id, email, full_name, role, created_at').order('created_at', { ascending: false })
    setUsers((data as UserProfile[]) || [])
    setLoading(false)
  }

  const changeRole = async (userId: string, newRole: string) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('user_id', userId)
    if (error) toast.error('Failed to update role')
    else { toast.success('Role updated'); fetchUsers() }
  }

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Users</h1><p className="text-muted-foreground">{users.length} registered users</p></div>
      </div>

      <Card>
        <CardHeader><CardTitle>Manage Users</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b"><th className="text-left py-3 px-4">User</th><th className="text-left py-3 px-4">Email</th><th className="text-left py-3 px-4">Role</th><th className="text-left py-3 px-4">Joined</th><th className="text-left py-3 px-4">Actions</th></tr></thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4"><div className="flex items-center gap-2"><div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center"><User className="h-4 w-4" /></div><span className="font-medium">{user.full_name || 'N/A'}</span></div></td>
                    <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4"><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge></td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {user.role !== 'admin' && <Button size="sm" variant="outline" onClick={() => changeRole(user.user_id, 'admin')}><Shield className="h-3 w-3 mr-1" />Make Admin</Button>}
                        {user.role === 'admin' && <Button size="sm" variant="outline" onClick={() => changeRole(user.user_id, 'member')}><User className="h-3 w-3 mr-1" />Make Member</Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
