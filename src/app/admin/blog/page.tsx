'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'

export default function BlogManagementPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Blog</h1>
          <p className="text-slate-500 mt-1">Kelola artikel blog</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Tambah Artikel
        </Button>
      </div>

      <Card>
        <CardContent className="py-12 text-center text-slate-500">
          <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
          Tidak ada artikel
        </CardContent>
      </Card>
    </div>
  )
}
