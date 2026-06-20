import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'

export default async function ProductsPage() {
  const supabase = await createServerClient()
  const { data: products } = await supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false })

  return (
    <div className="py-20">
      <section className="container mx-auto px-4 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">All Products</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Our Product Catalog</h1>
          <p className="text-lg text-muted-foreground">Browse our complete collection of premium digital products.</p>
        </div>
      </section>
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(products || []).map((product: { id: string; slug: string; name: string; short_description: string | null; price: number; compare_price: number | null; image_url: string | null; is_featured: boolean; rating_average: number; rating_count: number }) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group">
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] relative bg-muted rounded-t-lg overflow-hidden">
                    {product.image_url && <img src={product.image_url} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />}
                    {product.is_featured && <Badge className="absolute top-2 right-2">Featured</Badge>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.short_description}</p>
                    <div className="flex items-center justify-between">
                      <div><span className="text-lg font-bold">${product.price}</span>{product.compare_price && <span className="text-sm text-muted-foreground line-through ml-2">${product.compare_price}</span>}</div>
                      {product.rating_count > 0 && <div className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span>{product.rating_average.toFixed(1)}</span></div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
