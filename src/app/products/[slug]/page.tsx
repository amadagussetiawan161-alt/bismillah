import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { createServerClient } from '@/lib/supabase/server'
import { Star, Shield, Zap, Headphones } from 'lucide-react'
import { AddToCartButton } from './add-to-cart-button'

interface BuilderBlock {
  id: string
  type: string
  content: Record<string, any>
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createServerClient()

  const { data: product } = await supabase.from('products').select('*, category:categories(*)').eq('slug', slug).single()
  if (!product) notFound()

  const isAvailable = product.status === 'active'
  const builderContent: BuilderBlock[] = product.builder_content || []
  const hasPublishedBuilder = product.builder_published && builderContent.length > 0

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

  if (hasPublishedBuilder) {
    return <BuilderProductPage product={product} blocks={builderContent} />
  }

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

function BuilderProductPage({ product, blocks }: { product: any; blocks: BuilderBlock[] }) {
  const isAvailable = product.status === 'active'

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
      default: return 'Buy Now'
    }
  }

  return (
    <div className="space-y-0">
      {blocks.map((block) => {
        const { type, content } = block
        switch (type) {
          case 'hero': return (
            <section key={block.id} className={`py-20 px-4 text-center ${content.bgImage ? 'bg-cover bg-center' : 'bg-gradient-to-br from-slate-900 to-slate-800'} text-white`} style={content.bgImage ? { backgroundImage: `url(${content.bgImage})` } : {}}>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.title}</h1>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">{content.subtitle}</p>
              <a href={getCtaUrl()} className="inline-block px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-white/90 transition-colors">{content.buttonText || getCtaLabel()}</a>
            </section>
          )
          case 'heading': return <div key={block.id} className={`py-6 px-4 text-${content.align}`}>{content.level === 'h1' ? <h1 className="text-3xl font-bold">{content.text}</h1> : content.level === 'h3' ? <h3 className="text-xl font-bold">{content.text}</h3> : <h2 className="text-2xl font-bold">{content.text}</h2>}</div>
          case 'text': return <div key={block.id} className={`py-4 px-4 text-${content.align} text-muted-foreground leading-relaxed`}><p>{content.text}</p></div>
          case 'image': return <div key={block.id} className={`py-4 px-4 text-${content.align}`}>{content.src && <img src={content.src} alt={content.alt} className="max-w-full rounded-lg mx-auto" />}{content.caption && <p className="text-sm text-muted-foreground mt-2">{content.caption}</p>}</div>
          case 'gallery': return <div key={block.id} className="py-4 px-4 grid grid-cols-2 md:grid-cols-3 gap-4">{content.images?.map((img: string, i: number) => <img key={i} src={img} className="rounded-lg object-cover aspect-square" />)}</div>
          case 'video': return <div key={block.id} className="py-4 px-4">{content.url && <div className="aspect-video bg-muted rounded-lg flex items-center justify-center"><p className="text-muted-foreground">Video: {content.url}</p></div>}{content.caption && <p className="text-sm text-muted-foreground mt-2">{content.caption}</p>}</div>
          case 'features': return <div key={block.id} className="py-8 px-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{content.items?.map((f: any, i: number) => <div key={i} className="p-6 bg-muted/50 rounded-xl"><h3 className="font-semibold mb-2">{f.title}</h3><p className="text-sm text-muted-foreground">{f.description}</p></div>)}</div></div>
          case 'pricing': return <div key={block.id} className="py-8 px-4"><div className="max-w-sm mx-auto p-8 bg-muted/50 rounded-2xl text-center"><div className="text-4xl font-bold mb-1">{content.price}</div><div className="text-sm text-muted-foreground mb-6">{content.period}</div><ul className="space-y-2 mb-6 text-sm">{content.features?.map((f: string, i: number) => <li key={i} className="flex items-center gap-2 justify-center"><Star className="h-3 w-3 text-primary" />{f}</li>)}</ul><a href={getCtaUrl()} className="inline-block w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold">{content.buttonText || getCtaLabel()}</a></div></div>
          case 'testimonials': return <div key={block.id} className="py-8 px-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{content.items?.map((t: any, i: number) => <div key={i} className="p-6 bg-muted/50 rounded-xl"><p className="italic text-muted-foreground mb-4">&ldquo;{t.text}&rdquo;</p><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><span className="font-semibold text-sm">{t.name?.[0]}</span></div><div><div className="font-medium text-sm">{t.name}</div><div className="text-xs text-muted-foreground">{t.role}</div></div></div></div>)}</div></div>
          case 'faq': return <div key={block.id} className="py-8 px-4 max-w-2xl mx-auto"><div className="space-y-4">{content.items?.map((q: any, i: number) => <div key={i} className="p-4 bg-muted/50 rounded-xl"><h4 className="font-semibold mb-2">{q.question}</h4><p className="text-sm text-muted-foreground">{q.answer}</p></div>)}</div></div>
          case 'countdown': return <div key={block.id} className="py-8 px-4 text-center"><p className="text-muted-foreground mb-2">{content.label}</p><div className="text-3xl font-bold">{content.targetDate || 'No date set'}</div></div>
          case 'cta': return <div key={block.id} className={`py-12 px-4 text-${content.align} bg-muted/30`}><p className="text-xl mb-4">{content.text}</p><a href={getCtaUrl()} className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold">{content.buttonText || getCtaLabel()}</a></div>
          case 'affiliate_cta': return <div key={block.id} className={`py-12 px-4 text-${content.align} bg-green-50`}><p className="text-xl mb-4 text-green-800">{content.text}</p><button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold">{content.buttonText}</button></div>
          case 'divider': return <div key={block.id} className="py-4 px-4"><hr className={`border-${content.style}`} /></div>
          case 'spacer': return <div key={block.id} style={{ height: content.height }} />
          case 'html': return <div key={block.id} className="py-4 px-4" dangerouslySetInnerHTML={{ __html: content.code }} />
          default: return null
        }
      })}
      {!isAvailable && (
        <div className="fixed bottom-0 left-0 right-0 bg-destructive text-white text-center py-3 font-semibold z-50">
          {product.status === 'sold_out' ? 'SOLD OUT' : 'COMING SOON'}
        </div>
      )}
    </div>
  )
}
