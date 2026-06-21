'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'
import { Search, ChevronLeft, ChevronRight, Plus, Loader as Loader2, FolderOpen, LocationEdit as Edit, Trash2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  is_active: boolean
  created_at: string
}

export default function CategoriesManagementPage() {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCategories, setTotalCategories] = useState(0)

  const perPage = 10
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    fetchCategories()
  }, [currentPage, searchQuery])

  const fetchCategories = async () => {
    setLoading(true)
    let query = supabase
      .from('categories')
      .select('*', { count: 'exact' })

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`)
    }

    const from = (currentPage - 1) * perPage
    const to = from + perPage - 1
    const { data, count, error } = await query.order('name').range(from, to)

    if (error) {
      toast.error('Gagal memuat data kategori')
      setLoading(false)
      return
    }

    setCategories(data || [])
    setTotalCategories(count || 0)
    setLoading(false)
  }

  const totalPages = Math.ceil(totalCategories / perPage)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
          <p className="text-slate-500 mt-1">Kelola kategori produk</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Tambah Kategori
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari kategori..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Nama</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Slug</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Dibuat</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500">
                      <FolderOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      Tidak ada kategori
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-sm text-slate-900">{category.name}</p>
                          <p className="text-xs text-slate-500">{category.description || '-'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-600">{category.slug}</span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={category.is_active ? 'success' : 'secondary'}>
                          {category.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-600">{formatDateTime(category.created_at)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
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
