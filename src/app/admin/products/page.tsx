'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/lib/supabase/client'
import { Loader2, Plus, Edit } from 'lucide-react'

interface Product { id: string; name: string; slug: string; price: number; is_active: boolean; is_featured: boolean; category: { name: string } | null }

export default function AdminProductsPage() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('id, name, slug, price, is_active, is_featured, category:categories(name)').order('created_at', { ascending: false })
      setProducts((data as Product[]) || [])
      setLoading(false)
    }
    fetchProducts()
  }, [])

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Products</h1><p className="text-muted-foreground">{products.length} products</p></div>
        <Link href="/admin/products/new"><Button><Plus className="h-4 w-4 mr-2" />Add Product</Button></Link>
      </div>

      <Card>
        <CardHeader><CardTitle>All Products</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead><tr className="border-b"><th className="text-left py-3 px-4">Name</th><th className="text-left py-3 px-4">Category</th><th className="text-left py-3 px-4">Price</th><th className="text-left py-3 px-4">Status</th><th className="text-left py-3 px-4">Actions</th></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4"><Link href={`/products/${product.slug}`} className="font-medium hover:underline">{product.name}</Link></td>
                  <td className="py-3 px-4 text-muted-foreground">{product.category?.name || '-'}</td>
                  <td className="py-3 px-4 font-semibold">${product.price}</td>
                  <td className="py-3 px-4"><div className="flex gap-2"><Badge variant={product.is_active ? 'default' : 'secondary'}>{product.is_active ? 'Active' : 'Inactive'}</Badge>{product.is_featured && <Badge>Featured</Badge>}</div></td>
                  <td className="py-3 px-4"><Link href={`/admin/products/${product.id}/edit`}><Button size="sm" variant="outline"><Edit className="h-3 w-3 mr-1" />Edit</Button></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
