import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createServerClient } from '@/lib/supabase/server'
import { Star, Shield, Zap, Headphones } from 'lucide-react'
import { AddToCartButton } from './add-to-cart-button'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createServerClient()

  const { data: product } = await supabase.from('products').select('*, category:categories(*)').eq('slug', slug).single()
  if (!product) notFound()

  const isAvailable = product.status === 'active'

  const getStatusBadge = () => {
    switch (product.status) {
      case 'sold_out': return <Badge variant="destructive" className="text-base px-3 py-1">SOLD OUT</Badge>
      case 'coming_soon': return <Badge variant="secondary" className="text-base px-3 py-1">COMING SOON</Badge>
      default: return null
    }
  }

  const getCtaUrl = () => {
    switch (product.cta_type) {
      case 'whatsapp': return product.whatsapp_number ? `https://wa.me/${product.whatsapp_number}` : '#'
      case 'external_link': return product.external_url || '#'
      case 'order_form': return '#'
      default: return `/checkout?product=${product.slug}`
    }
  }

  const getCtaLabel = () => {
    switch (product.cta_type) {
      case 'whatsapp': return 'Chat on WhatsApp'
      case 'external_link': return 'Visit Link'
      case 'order_form': return 'Order Now'
      default: return 'Purchase Now'
    }
  }

  const isExternal = product.cta_type === 'whatsapp' || product.cta_type === 'external_link'

  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
              {product.image_url && <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />}
              {!isAvailable && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  {getStatusBadge()}
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="mb-4">{product.category && <Link href={`/categories/${product.category.slug}`} className="text-sm text-primary hover:underline">{product.category.name}</Link>}</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
            {product.rating_count > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => (<Star key={i} className={`h-5 w-5 ${i < Math.round(product.rating_average) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />))}</div>
                <span className="text-muted-foreground">({product.rating_count} reviews)</span>
              </div>
            )}
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-3xl font-bold">${product.price}</span>
              {product.compare_price && <span className="text-xl text-muted-foreground line-through">${product.compare_price}</span>}
            </div>
            <p className="text-muted-foreground mb-6">{product.short_description}</p>
            <Separator className="mb-6" />
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3"><Shield className="h-5 w-5 text-primary" /><span className="text-sm">Secure payment & instant delivery</span></div>
              <div className="flex items-center gap-3"><Zap className="h-5 w-5 text-primary" /><span className="text-sm">Lifetime updates included</span></div>
              <div className="flex items-center gap-3"><Headphones className="h-5 w-5 text-primary" /><span className="text-sm">Premium support available</span></div>
            </div>
            {isAvailable ? (
              isExternal ? (
                <a href={getCtaUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-8 bg-primary text-primary-foreground hover:opacity-90">
                  {getCtaLabel()}
                </a>
              ) : (
                <AddToCartButton productId={product.id} price={product.price} name={product.name} />
              )
            ) : (
              <button disabled className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-8 bg-muted text-muted-foreground cursor-not-allowed">
                {product.status === 'sold_out' ? 'Sold Out' : 'Coming Soon'}
              </button>
            )}
            <Separator className="my-6" />
            <div className="prose prose-sm text-muted-foreground">
              <h3>Description</h3>
              <p>{product.description || product.short_description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
