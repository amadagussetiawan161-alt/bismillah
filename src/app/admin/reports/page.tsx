'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartBar as BarChart3 } from 'lucide-react'

export default function ReportsManagementPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
        <p className="text-slate-500 mt-1">Laporan dan analisis</p>
      </div>

      <Card>
        <CardContent className="py-12 text-center text-slate-500">
          <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
          Fitur laporan akan segera tersedia
        </CardContent>
      </Card>
    </div>
  )
}
