import { createBrowserClient } from './client'

const BUCKET_NAME = 'product-images'

export async function uploadProductImage(file: File, productSlug: string): Promise<string | null> {
  const supabase = createBrowserClient()

  const ext = file.name.split('.').pop()?.toLowerCase()
  const fileName = `${productSlug}-${Date.now()}.${ext}`
  const filePath = `products/${fileName}`

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  return publicUrl
}

export async function deleteProductImage(imageUrl: string): Promise<boolean> {
  const supabase = createBrowserClient()

  const url = new URL(imageUrl)
  const pathParts = url.pathname.split('/')
  const bucketIndex = pathParts.indexOf(BUCKET_NAME)
  if (bucketIndex === -1) return false

  const filePath = pathParts.slice(bucketIndex + 1).join('/')

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath])

  if (error) {
    console.error('Delete error:', error)
    return false
  }

  return true
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPG, JPEG, PNG, and WEBP files are allowed.' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 5MB.' }
  }

  return { valid: true }
}
