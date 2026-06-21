'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings as SettingsIcon } from 'lucide-react'

export default function SettingsManagementPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Pengaturan platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Umum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nama Platform</label>
            <Input defaultValue="SaaS Platform" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Admin</label>
            <Input defaultValue="admin@admin.com" />
          </div>
          <Button>Simpan Pengaturan</Button>
        </CardContent>
      </Card>
    </div>
  )
}
