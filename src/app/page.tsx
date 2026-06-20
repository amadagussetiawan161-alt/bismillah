import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Zap, Shield, Clock, Users, Star } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createServerClient()
  const { data: products } = await supabase.from('products').select('*').eq('is_featured', true).limit(4)
  const { data: categories } = await supabase.from('categories').select('*').eq('is_active', true).limit(6)

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Premium Digital Products</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Premium Digital Products<span className="block text-primary mt-2">For Modern Businesses</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover software licenses, subscriptions, and digital tools that power thousands of successful businesses worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild><Link href="/products">Explore Products<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/pricing">View Pricing</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We provide the best tools and services to help your business grow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for speed with instant delivery' },
              { icon: Shield, title: 'Secure & Reliable', desc: 'Enterprise-grade security with 99.9% uptime' },
              { icon: Clock, title: '24/7 Access', desc: 'Access your tools anytime, anywhere' },
              { icon: Users, title: 'Team Collaboration', desc: 'Built for teams with advanced features' },
              { icon: Shield, title: 'Premium Support', desc: 'Dedicated support team ready to help' },
              { icon: Zap, title: 'Analytics', desc: 'Comprehensive insights to track performance' },
            ].map((f) => (
              <Card key={f.title} className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Top picks from our catalog</p>
            </div>
          </div>
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
                        <div>
                          <span className="text-lg font-bold">${product.price}</span>
                          {product.compare_price && <span className="text-sm text-muted-foreground line-through ml-2">${product.compare_price}</span>}
                        </div>
                        {product.rating_count > 0 && <div className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span>{product.rating_average.toFixed(1)}</span></div>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">Join thousands of businesses using our platform.</p>
          <Button size="lg" variant="secondary" asChild><Link href="/auth/register">Start Free Trial</Link></Button>
        </div>
      </section>
    </div>
  )
}
