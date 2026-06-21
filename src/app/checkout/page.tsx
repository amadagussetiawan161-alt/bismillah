'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBrowserClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, CreditCard } from 'lucide-react'

interface CartItem { id: string; quantity: number; price: number; product: { id: string; name: string } }

export default function CheckoutPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const router = useRouter()
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchCart = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login?redirectTo=/checkout'); return }
      if (user.email) setForm(f => ({ ...f, email: user.email! }))
      const { data: profile } = await supabase.from('profiles').select('full_name, phone').eq('user_id', user.id).single()
      if (profile) setForm(f => ({ ...f, name: profile.full_name || '', phone: profile.phone || '' }))
      const { data } = await supabase.from('cart_items').select('id, quantity, price, product:products(id, name)').eq('user_id', user.id)
      setCartItems((data as CartItem[]) || [])
      setLoading(false)
    }
    fetchCart()
  }, [router])

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cartItems.length === 0) { toast.error('Cart is empty'); return }
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    const { data: order, error: orderError } = await supabase.from('orders').insert({
      user_id: user.id,
      order_number: orderNumber,
      total_amount: total,
      status: 'pending',
      payment_method: 'midtrans',
      notes: form.notes,
    }).select().single()

    if (orderError || !order) { toast.error('Failed to create order'); setSubmitting(false); return }

    const orderItems = cartItems.map(item => ({ order_id: order.id, product_id: item.product.id, quantity: item.quantity, price: item.price }))
    await supabase.from('order_items').insert(orderItems)
    await supabase.from('payments').insert({ user_id: user.id, amount: total, currency: 'USD', payment_method: 'midtrans', status: 'pending', product_id: cartItems[0]?.product.id })
    await supabase.from('cart_items').delete().eq('user_id', user.id)
    await supabase.from('user_products').insert(cartItems.map(item => ({ user_id: user.id, product_id: item.product.id })))

    toast.success('Order placed successfully!')
    router.push('/checkout/success?order=' + orderNumber)
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold">Checkout</h1><p className="text-muted-foreground">Complete your order</p></div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader><CardTitle>Billing Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Full Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="space-y-2"><Label>Notes</Label><textarea className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." /></div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between"><span>{item.product.name} x{item.quantity}</span><span>${(item.price * item.quantity).toFixed(2)}</span></div>
                ))}
                <div className="border-t pt-4 flex justify-between text-lg font-bold"><span>Total</span><span>${total.toFixed(2)}</span></div>
                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                  Place Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
