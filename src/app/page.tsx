import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, Zap, Shield, Clock, Users, Star, Search, ShoppingBag, TrendingUp, Sparkles } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; page?: string }> }) {
  const params = await searchParams
  const supabase = await createServerClient()
  const searchQuery = params.q || ''
  const categorySlug = params.category || ''
  const page = parseInt(params.page || '1', 10)
  const perPage = 12

  // Fetch categories with product counts
  const { data: categories } = await supabase.from('categories').select('id, name, slug, image_url, description').eq('is_active', true).order('name')
  const { data: allProducts } = await supabase.from('products').select('category_id').eq('status', 'active')
  const countMap = new Map<string, number>()
  ;(allProducts || []).forEach((p: any) => {
    const cid = p.category_id
    countMap.set(cid, (countMap.get(cid) || 0) + 1)
  })

  // Fetch products with filters
  let productQuery = supabase.from('products').select('*', { count: 'exact' }).in('status', ['active', 'sold_out', 'coming_soon']).order('created_at', { ascending: false })
  if (searchQuery) productQuery = productQuery.ilike('name', `%${searchQuery}%`)
  if (categorySlug) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single()
    if (cat) productQuery = productQuery.eq('category_id', cat.id)
  }
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  const { data: products, count } = await productQuery.range(from, to)
  const totalPages = Math.ceil((count || 0) / perPage)

  // Fetch featured, best seller, new
  const { data: featuredProducts } = await supabase.from('products').select('*').eq('is_featured', true).in('status', ['active', 'sold_out', 'coming_soon']).order('sort_order').limit(4)
  const { data: bestSellers } = await supabase.from('products').select('*').eq('best_seller', true).in('status', ['active', 'sold_out', 'coming_soon']).order('sales_count', { ascending: false }).limit(4)
  const { data: newProducts } = await supabase.from('products').select('*').in('status', ['active', 'sold_out', 'coming_soon']).order('created_at', { ascending: false }).limit(4)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sold_out': return <Badge variant="destructive" className="absolute top-2 left-2 z-10">SOLD OUT</Badge>
      case 'coming_soon': return <Badge variant="secondary" className="absolute top-2 left-2 z-10">COMING SOON</Badge>
      default: return null
    }
  }

  const getProductBadge = (product: any) => {
    if (product.best_seller) return <Badge className="absolute top-2 right-2 z-10 bg-orange-500 hover:bg-orange-600"><TrendingUp className="h-3 w-3 mr-1" />Best Seller</Badge>
    if (product.is_featured) return <Badge className="absolute top-2 right-2 z-10 bg-purple-500 hover:bg-purple-600"><Sparkles className="h-3 w-3 mr-1" />Featured</Badge>
    return null
  }

  const ProductCard = ({ product }: { product: any }) => (
    <Link href={`/products/${product.slug}`} className="group block">
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-muted/60">
        <CardContent className="p-0">
          <div className="aspect-[4/3] relative bg-muted rounded-t-lg overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                <ShoppingBag className="h-12 w-12 text-slate-300" />
              </div>
            )}
            {getStatusBadge(product.status)}
            {getProductBadge(product)}
          </div>
          <div className="p-4">
            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.short_description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold">${product.price}</span>
                {product.compare_price && <span className="text-sm text-muted-foreground line-through">${product.compare_price}</span>}
              </div>
              {product.rating_count > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating_average?.toFixed(1)}</span>
                  <span className="text-muted-foreground">({product.rating_count})</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur">Premium Digital Marketplace</Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Build Better Products
              <span className="block text-blue-400 mt-2">Faster Than Ever</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover premium software, templates, and digital tools trusted by thousands of creators and businesses worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white" asChild>
                <Link href="/products">Browse Products <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/categories">Explore Categories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-8 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <form className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input name="q" defaultValue={searchQuery} placeholder="Search products..." className="pl-10 h-11" />
            </div>
            <Button type="submit" className="h-11 px-6">Search</Button>
          </form>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Browse by Category</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Find exactly what you need across our curated categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(categories || []).map((cat: any) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`} className="group">
                <Card className="h-full hover:shadow-md transition-all border-muted/60 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square relative bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-10 w-10 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="font-semibold text-white text-sm">{cat.name}</h3>
                        <p className="text-xs text-white/70">{countMap.get(cat.id) || 0} products</p>

                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {(featuredProducts || []).length > 0 && (
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-1">Featured Products</h2>
                <p className="text-muted-foreground">Handpicked by our team</p>
              </div>
              <Button variant="outline" asChild><Link href="/products">View All <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts!.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {(bestSellers || []).length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-1">Best Sellers</h2>
                <p className="text-muted-foreground">Most popular this month</p>
              </div>
              <Button variant="outline" asChild><Link href="/products">View All <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers!.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* New Products */}
      {(newProducts || []).length > 0 && (
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-1">New Arrivals</h2>
                <p className="text-muted-foreground">Fresh from the marketplace</p>
              </div>
              <Button variant="outline" asChild><Link href="/products">View All <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts!.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* All Products Grid with Filter */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-1">All Products</h2>
              <p className="text-muted-foreground">{count || 0} products available</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/" className={`px-3 py-1.5 rounded-full text-sm transition-colors ${!categorySlug ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>All</Link>
              {(categories || []).map((cat: any) => (
                <Link key={cat.id} href={`/?category=${cat.slug}${searchQuery ? `&q=${searchQuery}` : ''}`} className={`px-3 py-1.5 rounded-full text-sm transition-colors ${categorySlug === cat.slug ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(products || []).map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {page > 1 && (
                <Link href={`/?page=${page - 1}${searchQuery ? `&q=${searchQuery}` : ''}${categorySlug ? `&category=${categorySlug}` : ''}`}>
                  <Button variant="outline">Previous</Button>
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1
                return (
                  <Link key={p} href={`/?page=${p}${searchQuery ? `&q=${searchQuery}` : ''}${categorySlug ? `&category=${categorySlug}` : ''}`}>
                    <Button variant={page === p ? 'default' : 'outline'}>{p}</Button>
                  </Link>
                )
              })}
              {page < totalPages && (
                <Link href={`/?page=${page + 1}${searchQuery ? `&q=${searchQuery}` : ''}${categorySlug ? `&category=${categorySlug}` : ''}`}>
                  <Button variant="outline">Next</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Why Choose Our Marketplace</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to build and scale your digital business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Zap, title: 'Instant Delivery', desc: 'Get immediate access to your digital purchases with automated delivery' },
              { icon: Shield, title: 'Secure Payments', desc: 'Enterprise-grade encryption protects every transaction you make' },
              { icon: Clock, title: 'Lifetime Updates', desc: 'Free updates for life on all products with active support' },
              { icon: Users, title: 'Creator Community', desc: 'Join thousands of creators sharing feedback and ideas' },
              { icon: Star, title: 'Verified Quality', desc: 'Every product is reviewed and tested before listing' },
              { icon: TrendingUp, title: 'Best Value', desc: 'Competitive pricing with regular sales and bundle deals' },
            ].map((f) => (
              <Card key={f.title} className="border-none shadow-sm bg-white">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                    <f.icon className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">Join thousands of businesses and creators using our platform to grow.</p>
          <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
            <Link href="/auth/register">Create Free Account</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
