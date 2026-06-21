'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { formatRelativeTime, formatDate } from '@/lib/utils'
import { Users, UserCheck, Shield, Key, CircleAlert as AlertCircle, UserPlus, Activity, Mail } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  role: string
  created_at: string
  updated_at: string
}

interface Stats {
  totalUsers: number
  activeUsers: number
  adminUsers: number
  activeLicenses: number
  expiredLicenses: number
  newUsersToday: number
  newUsersWeek: number
}

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    activeLicenses: 0,
    expiredLicenses: 0,
    newUsersToday: 0,
    newUsersWeek: 0,
  })
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const supabase = createBrowserSupabaseClient()
    setLoading(true)

    try {
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const [profilesResult, licensesResult] = await Promise.all([
        supabase.from('profiles').select('id, email, role, created_at, updated_at'),
        supabase.from('licenses').select('id, status, expires_at'),
      ])

      const profiles = profilesResult.data || []
      const licenses = licensesResult.data || []

      // Calculate stats
      const totalUsers = profiles.length
      const adminUsers = profiles.filter((p: any) => p.role === 'admin').length
      const newUsersToday = profiles.filter((p: any) => new Date(p.created_at) >= todayStart).length
      const newUsersWeek = profiles.filter((p: any) => new Date(p.created_at) >= weekStart).length
      const activeUsers = profiles.length

      const nowTime = new Date()
      const activeLicenses = licenses.filter((l: any) =>
        l.status === 'active' && (!l.expires_at || new Date(l.expires_at) > nowTime)
      ).length
      const expiredLicenses = licenses.filter((l: any) =>
        l.status === 'expired' || (l.expires_at && new Date(l.expires_at) <= nowTime)
      ).length

      setStats({
        totalUsers,
        activeUsers,
        adminUsers,
        activeLicenses,
        expiredLicenses,
        newUsersToday,
        newUsersWeek,
      })

      // Get recent users
      const recent = profiles
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
      setRecentUsers(recent as UserProfile[])

      // Build recent activities
      const activities: any[] = []
      recent.slice(0, 3).forEach((user: any) => {
        activities.push({
          id: user.id,
          type: 'user',
          title: 'Pengguna baru terdaftar',
          description: user.email,
          time: user.created_at,
          status: 'success',
        })
      })

      licenses.slice(0, 2).forEach((l: any) => {
        if (l.status === 'active') {
          activities.push({
            id: l.id,
            type: 'license',
            title: 'Lisensi diaktivasi',
            description: l.status,
            time: new Date().toISOString(),
            status: 'success',
          })
        }
      })

      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      setRecentActivities(activities.slice(0, 6))
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Selamat pagi'
    if (hour < 18) return 'Selamat siang'
    return 'Selamat malam'
  }

  const statCards = [
    {
      title: 'Total Pengguna',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      href: '/admin/users'
    },
    {
      title: 'Pengguna Aktif',
      value: stats.activeUsers,
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-600',
      href: '/admin/users?filter=active'
    },
    {
      title: 'Admin',
      value: stats.adminUsers,
      icon: Shield,
      color: 'bg-violet-50 text-violet-600',
      href: '/admin/users?role=admin'
    },
    {
      title: 'Lisensi Aktif',
      value: stats.activeLicenses,
      icon: Key,
      color: 'bg-amber-50 text-amber-600',
      href: '/admin/users'
    },
    {
      title: 'Lisensi Kedaluwarsa',
      value: stats.expiredLicenses,
      icon: AlertCircle,
      color: 'bg-red-50 text-red-600',
      href: '/admin/users?filter=expired'
    },
    {
      title: 'Pengguna Baru (Hari Ini)',
      value: stats.newUsersToday,
      icon: UserPlus,
      color: 'bg-cyan-50 text-cyan-600',
      href: '/admin/users?filter=new'
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{getGreeting()}, Admin</h1>
        <p className="text-slate-500 mt-1">Ringkasan sistem Anda hari ini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{stat.title}</p>
                    <p className="text-xl font-semibold text-slate-900 mt-0.5">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pengguna Terbaru</CardTitle>
            <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-700">
              Lihat Semua
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">Memuat...</div>
            ) : recentUsers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                Belum ada pengguna
              </div>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900">{user.email}</p>
                        <p className="text-xs text-slate-500">{formatRelativeTime(user.created_at)}</p>
                      </div>
                    </div>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Admin' : 'Member'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-slate-400 text-sm">Memuat...</div>
            ) : recentActivities.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                <Activity className="h-10 w-10 mx-auto mb-2 opacity-30" />
                Belum ada aktivitas
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id + activity.type} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'success' ? 'bg-emerald-50 text-emerald-600' :
                      activity.status === 'warning' ? 'bg-amber-50 text-amber-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {activity.type === 'user' && <Users className="h-4 w-4" />}
                      {activity.type === 'license' && <Key className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                      <p className="text-xs text-slate-500 truncate">{activity.description}</p>
                    </div>
                    <p className="text-xs text-slate-400 whitespace-nowrap">
                      {formatRelativeTime(activity.time)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <UserPlus className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Kelola Pengguna</p>
                  <p className="text-xs text-slate-500">Lihat semua pengguna</p>
                </div>
              </Button>
            </Link>
            <Link href="/admin/users?role=admin">
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <Shield className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Admin Baru</p>
                  <p className="text-xs text-slate-500">Tambah admin</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
