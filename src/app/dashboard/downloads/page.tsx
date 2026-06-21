'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/lib/supabase/client'
import { Loader2, Download, Package } from 'lucide-react'

export default function DownloadsPage() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<{ id: string; purchased_at: string; product: { id: string; name: string; slug: string; download_url: string | null } }[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('user_products').select('id, purchased_at, product:products(id, name, slug, download_url)').eq('user_id', user.id).order('purchased_at', { ascending: false })
      setProducts((data || []) as typeof products)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div>
      <div className="mb-8"><h1 className="text-3xl font-bold">Downloads</h1><p className="text-muted-foreground">{products.length} products available for download</p></div>

      {products.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><h3 className="font-semibold mb-2">No downloads yet</h3><p className="text-muted-foreground mb-4">Purchase products to access downloads</p><Link href="/products" className="text-primary hover:underline">Browse Products</Link></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {products.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-muted-foreground">Purchased {new Date(item.purchased_at).toLocaleDateString()}</p>
                </div>
                <Button asChild>
                  <Link href={item.product.download_url || `/products/${item.product.slug}`} target={item.product.download_url ? '_blank' : undefined}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
