'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createBrowserClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AdminCategoriesPage() {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; is_active: boolean; products_count: number }[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('id, name, slug, is_active').order('name')
      // Get product counts
      const categoriesWithCounts = await Promise.all((data || []).map(async (cat) => {
        const { count } = await supabase.from('products').select('id', { count: 'exact', head: true }).eq('category_id', cat.id)
        return { ...cat, products_count: count || 0 }
      }))
      setCategories(categoriesWithCounts)
      setLoading(false)
    }
    fetchCategories()
  }, [])

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div>
      <div className="mb-8"><h1 className="text-3xl font-bold">Categories</h1><p className="text-muted-foreground">{categories.length} categories</p></div>

      <Card>
        <CardHeader><CardTitle>All Categories</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead><tr className="border-b"><th className="text-left py-3 px-4">Name</th><th className="text-left py-3 px-4">Slug</th><th className="text-left py-3 px-4">Products</th><th className="text-left py-3 px-4">Status</th></tr></thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">{cat.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{cat.slug}</td>
                  <td className="py-3 px-4">{cat.products_count}</td>
                  <td className="py-3 px-4"><Badge variant={cat.is_active ? 'default' : 'secondary'}>{cat.is_active ? 'Active' : 'Inactive'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
