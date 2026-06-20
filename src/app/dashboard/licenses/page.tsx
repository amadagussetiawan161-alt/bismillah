'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@/lib/supabase/client'
import { Key, Loader2, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface License { id: string; license_key: string; status: string; expires_at: string; product: { name: string } }

export default function LicensesPage() {
  const [loading, setLoading] = useState(true)
  const [licenses, setLicenses] = useState<License[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('licenses').select('id, license_key, status, expires_at, product:products(name)').eq('user_id', user.id).order('created_at', { ascending: false })
      setLicenses((data as License[]) || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const copyKey = (key: string) => { navigator.clipboard.writeText(key); toast.success('License key copied!') }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div>
      <div className="mb-8"><h1 className="text-3xl font-bold">Licenses</h1><p className="text-muted-foreground">Your software license keys</p></div>
      {licenses.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><h3 className="font-semibold mb-2">No licenses</h3><p className="text-muted-foreground">Purchase a product to receive license keys</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {licenses.map((license) => (
            <Card key={license.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{license.product?.name || 'License'}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{license.license_key.slice(0, 8)}...{license.license_key.slice(-8)}</code>
                      <Button variant="ghost" size="icon" onClick={() => copyKey(license.license_key)}><Copy className="h-4 w-4" /></Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Expires: {license.expires_at ? new Date(license.expires_at).toLocaleDateString() : 'Never'}</p>
                  </div>
                  <Badge variant={license.status === 'active' ? 'default' : 'secondary'}>{license.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
