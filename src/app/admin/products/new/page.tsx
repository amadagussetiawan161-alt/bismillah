'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createBrowserClient } from '@/lib/supabase/client'
import { uploadProductImage, validateImageFile, deleteProductImage } from '@/lib/supabase/storage'
import { toast } from 'sonner'
import { Loader2, Upload, X, ImageIcon } from 'lucide-react'

interface Category {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: '',
    compare_price: '',
    category_id: '',
    status: 'active' as 'active' | 'sold_out' | 'coming_soon',
    affiliate_enabled: false,
    commission_type: '' as 'percentage' | 'fixed' | '',
    commission_value: '',
    is_featured: false,
  })

  const supabase = createBrowserClient()

  useEffect(() => {
    supabase.from('categories').select('id, name').eq('is_active', true).order('name').then(({ data }) => {
      setCategories(data || [])
    })
  }, [])

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
    if (!form.price || parseFloat(form.price) <= 0) { toast.error('Price must be greater than 0'); return false }
    if (!imageFile && !imagePreview) { toast.error('Image is required for new product'); return false }
    if (form.affiliate_enabled) {
      if (!form.commission_type) { toast.error('Commission type is required when affiliate is enabled'); return false }
      if (!form.commission_value || parseFloat(form.commission_value) <= 0) { toast.error('Commission value is required'); return false }
      if (form.commission_type === 'percentage' && parseFloat(form.commission_value) > 100) {
        toast.error('Percentage commission cannot exceed 100%')
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)

    let imageUrl: string | null = null

    if (imageFile) {
      setImageUploading(true)
      const slug = form.slug || generateSlug(form.name)
      imageUrl = await uploadProductImage(imageFile, slug)
      setImageUploading(false)
      if (!imageUrl) {
        toast.error('Image upload failed')
        setLoading(false)
        return
      }
    }

    const slug = form.slug || generateSlug(form.name)
    const payload: Record<string, unknown> = {
      name: form.name,
      slug,
      description: form.description || null,
      short_description: form.short_description || null,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      category_id: form.category_id || null,
      image_url: imageUrl,
      status: form.status,
      affiliate_enabled: form.affiliate_enabled,
      is_featured: form.is_featured,
    }

    if (form.affiliate_enabled) {
      payload.commission_type = form.commission_type
      payload.commission_value = form.commission_value ? parseFloat(form.commission_value) : null
    }

    const { error } = await supabase.from('products').insert(payload)

    if (error) {
      toast.error(error.message)
      if (imageUrl) await deleteProductImage(imageUrl)
      setLoading(false)
      return
    }

    toast.success('Product created!')
    router.push('/admin/products')
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
          <CardDescription>Create a new product listing</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.slug || generateSlug(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="auto-generated"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description</Label>
              <Input
                id="short_description"
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                placeholder="Brief summary for cards"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Full product description"
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
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compare_price">Compare Price</Label>
                <Input
                  id="compare_price"
                  type="number"
                  step="0.01"
                  value={form.compare_price}
                  onChange={(e) => setForm({ ...form, compare_price: e.target.value })}
                  placeholder="Original/sale price"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Product Image *</Label>
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
                    value={form.commission_type}
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
                    value={form.commission_value}
                    onChange={(e) => setForm({ ...form, commission_value: e.target.value })}
                    placeholder={form.commission_type === 'percentage' ? 'e.g. 10' : 'e.g. 50000'}
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
              <Button type="submit" disabled={loading || imageUploading}>
                {(loading || imageUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Product
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
