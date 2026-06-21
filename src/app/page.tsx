import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { ArrowRight, Zap, Shield, Clock, Users, Star, ShoppingBag, TrendingUp, Sparkles, Award, CircleCheck as CheckCircle } from 'lucide-react'

const categories = [
  { id: '1', name: 'Template Website', slug: 'template-website' },
  { id: '2', name: 'Dashboard Admin', slug: 'dashboard-admin' },
  { id: '3', name: 'UI Kits', slug: 'ui-kits' },
  { id: '4', name: 'Landing Page', slug: 'landing-page' },
  { id: '5', name: 'Source Code', slug: 'source-code' },
  { id: '6', name: 'Plugin & Module', slug: 'plugin-module' },
]

const features = [
  { icon: Zap, title: 'Pengiriman Instan', desc: 'Akses langsung setelah pembayaran berhasil' },
  { icon: Shield, title: 'Pembayaran Aman', desc: 'Transaksi dienkripsi dengan standar tertinggi' },
  { icon: Clock, title: 'Update Selamanya', desc: 'Gratis update seumur hidup untuk semua produk' },
  { icon: Users, title: 'Dukungan 24/7', desc: 'Tim support siap membantu kapan saja' },
  { icon: CheckCircle, title: 'Kualitas Terjamin', desc: 'Semua produk di-review sebelum dipublikasikan' },
  { icon: Star, title: 'Rating Tinggi', desc: '4.9/5 rata-rata kepuasan pelanggan' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 mb-6">
              <Award className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium">Dipercaya 1,100+ Pelanggan</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Marketplace Digital
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mt-2">
                Premium Indonesia
              </span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Temukan template, software, dan tools digital berkualitas tinggi untuk mengembangkan bisnis dan project Anda.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/products">Jelajahi Produk <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/categories">Lihat Kategori</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Kategori Produk</h2>
            <p className="text-slate-500 mt-2">Temukan produk sesuai kebutuhan Anda</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all cursor-pointer overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square relative bg-slate-100 flex items-center justify-center group">
                      <ShoppingBag className="h-10 w-10 text-slate-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="font-semibold text-white text-sm">{cat.name}</h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Mengapa Memilih Kami?</h2>
            <p className="text-slate-500 mt-2">Komitmen kami untuk pengalaman terbaik</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f) => (
              <Card key={f.title} className="border-slate-200 bg-white">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                    <f.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Siap Untuk Memulai?</h2>
          <p className="text-blue-100 mt-2 mb-6">Bergabung dengan ribuan creator dan bisnis yang berkembang bersama kami.</p>
          <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50" asChild>
            <Link href="/auth/register">Daftar Gratis</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
