'use client'

import { useState, useEffect, useRef, FormEvent, Suspense } from 'react'
import { useRouter, use } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createBrowserClient } from '@/lib/supabase/client'
import { uploadProductImage, validateImageFile, deleteProductImage } from '@/lib/supabase/storage'
import { toast } from 'sonner'
import { Loader2, Upload, X, Trash2 } from 'lucide-react'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  compare_price: number | null
  category_id: string | null
  image_url: string | null
  status: 'active' | 'sold_out' | 'coming_soon'
  affiliate_enabled: boolean
  commission_type: string | null
  commission_value: number | null
  is_featured: boolean
}

function EditProductForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<Product>({
    id: '',
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: 0,
    compare_price: null,
    category_id: '',
    image_url: '',
    status: 'active',
    affiliate_enabled: false,
    commission_type: null,
    commission_value: null,
    is_featured: false,
  })

  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: product }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase.from('categories').select('id, name').eq('is_active', true).order('name'),
      ])

      if (product) {
        setForm({
          id: product.id,
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || '',
          short_description: product.short_description || '',
          price: product.price || 0,
          compare_price: product.compare_price || null,
          category_id: product.category_id || '',
          image_url: product.image_url || '',
          status: product.status || 'active',
          affiliate_enabled: product.affiliate_enabled || false,
          commission_type: product.commission_type || null,
          commission_value: product.commission_value || null,
          is_featured: product.is_featured || false,
        })
        if (product.image_url) setImagePreview(product.image_url)
      }
      setCategories(cats || [])
      setLoading(false)
    }
    fetchData()
  }, [id])

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validateForm = (): boolean => {
    if (!form.name.trim()) { toast.error('Name is required'); return false }
    if (!form.price || form.price <= 0) { toast.error('Price must be greater than 0'); return false }
    if (form.affiliate_enabled) {
      if (!form.commission_type) { toast.error('Commission type is required when affiliate is enabled'); return false }
      if (!form.commission_value || form.commission_value <= 0) { toast.error('Commission value is required'); return false }
      if (form.commission_type === 'percentage' && form.commission_value > 100) {
        toast.error('Percentage commission cannot exceed 100%')
        return false
      }
    }
    return true
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setSaving(true)

    let imageUrl = form.image_url

    if (imageFile) {
      setImageUploading(true)
      const slug = form.slug || generateSlug(form.name)
      const newUrl = await uploadProductImage(imageFile, slug)
      setImageUploading(false)
      if (newUrl) {
        if (form.image_url) await deleteProductImage(form.image_url)
        imageUrl = newUrl
      } else {
        toast.error('Image upload failed')
        setSaving(false)
        return
      }
    }

    if (imagePreview === null && form.image_url) {
      await deleteProductImage(form.image_url)
      imageUrl = ''
    }

    const payload: Record<string, unknown> = {
      name: form.name,
      slug: form.slug || generateSlug(form.name),
      description: form.description || null,
      short_description: form.short_description || null,
      price: parseFloat(form.price.toString()),
      compare_price: form.compare_price ? parseFloat(form.compare_price.toString()) : null,
      category_id: form.category_id || null,
      image_url: imageUrl || null,
      status: form.status,
      affiliate_enabled: form.affiliate_enabled,
      is_featured: form.is_featured,
      updated_at: new Date().toISOString(),
    }

    if (form.affiliate_enabled) {
      payload.commission_type = form.commission_type
      payload.commission_value = form.commission_value ? parseFloat(form.commission_value.toString()) : null
    } else {
      payload.commission_type = null
      payload.commission_value = null
    }

    const { error } = await supabase.from('products').update(payload).eq('id', id)

    if (error) {
      toast.error(error.message)
      setSaving(false)
      return
    }

    toast.success('Product updated!')
    router.push('/admin/products')
  }

  const handleDelete = async () => {
    setDeleting(true)
    if (form.image_url) await deleteProductImage(form.image_url)
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete product')
      setDeleting(false)
      return
    }
    toast.success('Product deleted!')
    router.push('/admin/products')
  }

  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Edit Product</CardTitle>
          <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-1" />Delete
          </Button>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description</Label>
              <Input
                id="short_description"
                value={form.short_description || ''}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compare_price">Compare Price</Label>
                <Input
                  id="compare_price"
                  type="number"
                  step="0.01"
                  value={form.compare_price || ''}
                  onChange={(e) => setForm({ ...form, compare_price: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={form.category_id || ''}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Product Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative w-32 h-32">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-md hover:bg-muted transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">Upload Image</span>
                </button>
              )}
              <p className="text-xs text-muted-foreground">JPG, JPEG, PNG, WEBP up to 5MB</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'sold_out' | 'coming_soon' })}
              >
                <option value="active">Active</option>
                <option value="sold_out">Sold Out</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="affiliate_enabled"
                checked={form.affiliate_enabled}
                onChange={(e) => setForm({ ...form, affiliate_enabled: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="affiliate_enabled">Affiliate Enabled</Label>
            </div>

            {form.affiliate_enabled && (
              <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-primary/20">
                <div className="space-y-2">
                  <Label htmlFor="commission_type">Commission Type</Label>
                  <select
                    id="commission_type"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    value={form.commission_type || ''}
                    onChange={(e) => setForm({ ...form, commission_type: e.target.value as 'percentage' | 'fixed' })}
                  >
                    <option value="">Select</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commission_value">Commission Value</Label>
                  <Input
                    id="commission_value"
                    type="number"
                    step="0.01"
                    value={form.commission_value || ''}
                    onChange={(e) => setForm({ ...form, commission_value: e.target.value ? parseFloat(e.target.value) : null })}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="is_featured">Featured</Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving || imageUploading}>
                {(saving || imageUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </CardContent>
        </form>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{form.name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <EditProductForm params={params} />
    </Suspense>
  )
}
