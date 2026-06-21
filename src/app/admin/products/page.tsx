'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { Search, ChevronLeft, ChevronRight, Plus, Loader as Loader2, Package, LocationEdit as Edit, MoveVertical as MoreVertical, Eye, Trash2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  status: string
  is_featured: boolean
  best_seller: boolean
  created_at: string
  category_id: string
  categories: { name: string }[] | null
}

export default function ProductsManagementPage() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

  const perPage = 10
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    fetchProducts()
  }, [currentPage, statusFilter, searchQuery])

  const fetchProducts = async () => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select('id, name, slug, price, status, is_featured, best_seller, created_at, category_id, categories(name)', { count: 'exact' })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`)
    }

    const from = (currentPage - 1) * perPage
    const to = from + perPage - 1
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to)

    if (error) {
      toast.error('Gagal memuat data produk')
      setLoading(false)
      return
    }

    setProducts(data || [])
    setTotalProducts(count || 0)
    setLoading(false)
  }

  const totalPages = Math.ceil(totalProducts / perPage)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success">Aktif</Badge>
      case 'draft': return <Badge variant="secondary">Draft</Badge>
      case 'sold_out': return <Badge variant="error">Habis</Badge>
      case 'coming_soon': return <Badge variant="warning">Segera</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">Kelola semua produk</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" /> Tambah Produk
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari produk..."
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
                <option value="draft">Draft</option>
                <option value="sold_out">Habis</option>
                <option value="coming_soon">Segera</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Produk</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Kategori</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Harga</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Dibuat</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-slate-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      Tidak ada produk
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-sm text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-500">{product.slug}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-600">
                          {product.categories?.[0]?.name || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium text-slate-900">
                          {formatCurrency(product.price)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(product.status)}
                          {product.is_featured && <Badge variant="default">Unggulan</Badge>}
                          {product.best_seller && <Badge variant="warning">Terlaris</Badge>}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-600">
                          {formatDateTime(product.created_at)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Edit className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/products/${product.id}/builder`}>
                              Builder
                            </Link>
                          </Button>
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
              Menampilkan {((currentPage - 1) * perPage) + 1} - {Math.min(currentPage * perPage, totalProducts)} dari {totalProducts} produk
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-3 text-sm text-slate-600">
                {currentPage} / {totalPages || 1}
              </span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
