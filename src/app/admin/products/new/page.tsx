'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBrowserClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function NewProductPage() {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: '', category_id: '', image_url: '', is_active: true, is_featured: false })
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    supabase.from('categories').select('id, name').eq('is_active', true).then(({ data }) => setCategories(data || []))
  }, [])

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price) { toast.error('Name and price required'); return }
    setLoading(true)

    const slug = form.slug || generateSlug(form.name)
    const { error } = await supabase.from('products').insert({
      name: form.name, slug, description: form.description || null, price: parseFloat(form.price),
      category_id: form.category_id || null, image_url: form.image_url || null, is_active: form.is_active, is_featured: form.is_featured,
    })

    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Product created!')
    router.push('/admin/products')
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader><CardTitle>Add New Product</CardTitle><CardDescription>Create a new product listing</CardDescription></CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || generateSlug(e.target.value) })} required /></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><textarea className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Price *</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Category</Label>
                <select className="w-full px-3 py-2 border rounded-md bg-background" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">None</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2"><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4" /><span className="text-sm">Active</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="h-4 w-4" /><span className="text-sm">Featured</span></label>
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Product</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
