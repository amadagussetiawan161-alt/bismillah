'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Action,
  ActionType,
  createEmptyAction,
  ACTION_TYPES,
} from '@/lib/action-engine'
import {
  Plus, Trash2, ChevronDown, ChevronUp, GripVertical, ExternalLink,
  MessageCircle, Phone, Mail, Send, Facebook, BarChart3, Target, Code
} from 'lucide-react'

interface MultiActionEditorProps {
  actions: Action[]
  onChange: (actions: Action[]) => void
}

const ACTION_ICONS: Record<string, any> = {
  direct_url: ExternalLink,
  product_purchase: ExternalLink,
  whatsapp_chat: MessageCircle,
  whatsapp_inquiry: MessageCircle,
  phone_call: Phone,
  email: Mail,
  telegram: Send,
  facebook_pixel: Facebook,
  google_analytics: BarChart3,
  google_ads: Target,
  tiktok_pixel: Target,
  custom_tracking: Code,
}

export function MultiActionEditor({ actions, onChange }: MultiActionEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const supabase = createBrowserClient()

  const addAction = (type: ActionType) => {
    const newAction = createEmptyAction(type)
    onChange([...actions, newAction])
    setExpandedId(newAction.id)
  }

  const updateAction = (id: string, updates: Partial<Action>) => {
    onChange(actions.map((a) => (a.id === id ? { ...a, ...updates } : a)))
  }

  const removeAction = (id: string) => {
    onChange(actions.filter((a) => a.id !== id))
  }

  const moveAction = (id: string, direction: 'up' | 'down') => {
    const index = actions.findIndex((a) => a.id === id)
    if (direction === 'up' && index > 0) {
      const newActions = [...actions]
      ;[newActions[index], newActions[index - 1]] = [newActions[index - 1], newActions[index]]
      onChange(newActions)
    } else if (direction === 'down' && index < actions.length - 1) {
      const newActions = [...actions]
      ;[newActions[index], newActions[index + 1]] = [newActions[index + 1], newActions[index]]
      onChange(newActions)
    }
  }

  const groupedActionTypes = ACTION_TYPES.reduce((acc, type) => {
    if (!acc[type.category]) acc[type.category] = []
    acc[type.category].push(type)
    return acc
  }, {} as Record<string, typeof ACTION_TYPES>)

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Actions</Label>

      {actions.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 border rounded-lg text-center">
          No actions configured. Add actions below.
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map((action, index) => {
            const isExpanded = expandedId === action.id
            const typeInfo = ACTION_TYPES.find((t) => t.value === action.type)
            const Icon = ACTION_ICONS[action.type] || ExternalLink

            return (
              <div
                key={action.id}
                className="border rounded-lg overflow-hidden"
              >
                <div
                  className="flex items-center gap-2 p-3 bg-muted/30 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : action.id)}
                >
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="p-1 hover:bg-muted rounded cursor-grab"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <span className="text-xs text-muted-foreground w-4">
                      {index + 1}
                    </span>
                  </div>
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="flex-1 text-sm font-medium">
                    {typeInfo?.label || action.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={action.enabled}
                      onChange={(e) => {
                        e.stopPropagation()
                        updateAction(action.id, { enabled: e.target.checked })
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4"
                      title="Enable/Disable"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeAction(action.id)
                      }}
                      className="p-1 hover:bg-muted rounded text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-3 bg-background border-t">
                    <ActionConfigFields
                      action={action}
                      onChange={(config) => updateAction(action.id, { config })}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="space-y-1">
        <Label className="text-xs">Add Action</Label>
        <div className="flex flex-wrap gap-1">
          {Object.entries(groupedActionTypes).map(([category, types]) => (
            <div key={category} className="flex flex-wrap gap-1">
              {types.slice(0, 3).map((type) => {
                const Icon = ACTION_ICONS[type.value] || ExternalLink
                return (
                  <Button
                    key={type.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAction(type.value)}
                    className="h-7 text-xs"
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {type.label}
                  </Button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ActionConfigFields({
  action,
  onChange,
}: {
  action: Action
  onChange: (config: Record<string, any>) => void
}) {
  const update = (key: string, value: any) => {
    onChange({ ...action.config, [key]: value })
  }

  switch (action.type) {
    case 'direct_url':
      return (
        <>
          <div className="space-y-1">
            <Label className="text-xs">URL</Label>
            <Input
              className="text-xs"
              value={action.config.url || ''}
              onChange={(e) => update('url', e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`newTab-${action.id}`}
              checked={action.config.openInNewTab || false}
              onChange={(e) => update('openInNewTab', e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor={`newTab-${action.id}`} className="text-xs">
              Open in New Tab
            </Label>
          </div>
        </>
      )

    case 'product_purchase':
      return <ProductPurchaseConfig action={action} onChange={onChange} />

    case 'whatsapp_chat':
    case 'whatsapp_inquiry':
      return (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Phone Number</Label>
            <Input
              className="text-xs"
              value={action.config.phone || ''}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="+62812345678"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Message</Label>
            <Input
              className="text-xs"
              value={action.config.message || ''}
              onChange={(e) => update('message', e.target.value)}
              placeholder="Hi, I'm interested in..."
            />
          </div>
          {action.type === 'whatsapp_inquiry' && (
            <ProductPurchaseConfig action={action} onChange={onChange} />
          )}
        </>
      )

    case 'phone_call':
      return (
        <div className="space-y-1">
          <Label className="text-xs">Phone Number</Label>
          <Input
            className="text-xs"
            value={action.config.phone || ''}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+62812345678"
          />
        </div>
      )

    case 'email':
      return (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input
              className="text-xs"
              type="email"
              value={action.config.email || ''}
              onChange={(e) => update('email', e.target.value)}
              placeholder="hello@example.com"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Subject</Label>
            <Input
              className="text-xs"
              value={action.config.subject || ''}
              onChange={(e) => update('subject', e.target.value)}
              placeholder="Email subject"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Body</Label>
            <Input
              className="text-xs"
              value={action.config.body || ''}
              onChange={(e) => update('body', e.target.value)}
              placeholder="Email body..."
            />
          </div>
        </>
      )

    case 'telegram':
      return (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Username</Label>
            <Input
              className="text-xs"
              value={action.config.username || ''}
              onChange={(e) => update('username', e.target.value)}
              placeholder="@username"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Message</Label>
            <Input
              className="text-xs"
              value={action.config.message || ''}
              onChange={(e) => update('message', e.target.value)}
              placeholder="Message..."
            />
          </div>
        </>
      )

    case 'facebook_pixel':
      return (
        <div className="space-y-1">
          <Label className="text-xs">Event Name</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
            value={action.config.eventName || 'Lead'}
            onChange={(e) => update('eventName', e.target.value)}
          >
            <option value="PageView">PageView</option>
            <option value="ViewContent">ViewContent</option>
            <option value="AddToCart">AddToCart</option>
            <option value="InitiateCheckout">InitiateCheckout</option>
            <option value="Purchase">Purchase</option>
            <option value="Lead">Lead</option>
            <option value="CompleteRegistration">CompleteRegistration</option>
            <option value="CustomEvent">Custom Event</option>
          </select>
        </div>
      )

    case 'google_analytics':
      return (
        <>
          <div className="space-y-1">
            <Label className="text-xs">Event Name</Label>
            <Input
              className="text-xs"
              value={action.config.eventName || ''}
              onChange={(e) => update('eventName', e.target.value)}
              placeholder="purchase"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <Input
                className="text-xs"
                value={action.config.category || ''}
                onChange={(e) => update('category', e.target.value)}
                placeholder="ecommerce"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Label</Label>
              <Input
                className="text-xs"
                value={action.config.label || ''}
                onChange={(e) => update('label', e.target.value)}
                placeholder="button"
              />
            </div>
          </div>
        </>
      )

    case 'google_ads':
      return (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Conversion ID</Label>
            <Input
              className="text-xs"
              value={action.config.conversionId || ''}
              onChange={(e) => update('conversionId', e.target.value)}
              placeholder="AW-XXXXXX"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Conversion Label</Label>
            <Input
              className="text-xs"
              value={action.config.conversionLabel || ''}
              onChange={(e) => update('conversionLabel', e.target.value)}
              placeholder="XXXXXX"
            />
          </div>
        </div>
      )

    case 'tiktok_pixel':
      return (
        <div className="space-y-1">
          <Label className="text-xs">Event Name</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
            value={action.config.eventName || 'ViewContent'}
            onChange={(e) => update('eventName', e.target.value)}
          >
            <option value="ViewContent">ViewContent</option>
            <option value="AddToCart">AddToCart</option>
            <option value="InitiateCheckout">InitiateCheckout</option>
            <option value="Purchase">Purchase</option>
            <option value="Lead">Lead</option>
          </select>
        </div>
      )

    default:
      return (
        <p className="text-xs text-muted-foreground">
          No configuration needed for this action type.
        </p>
      )
  }
}

function ProductPurchaseConfig({
  action,
  onChange,
}: {
  action: Action
  onChange: (config: Record<string, any>) => void
}) {
  const [products, setProducts] = useState<any[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    supabase
      .from('products')
      .select('id, name, slug, variants_enabled')
      .eq('status', 'active')
      .order('name')
      .then(({ data }) => setProducts(data || []))
  }, [])

  useEffect(() => {
    const productId = action.config.productId
    if (!productId) {
      setVariants([])
      return
    }
    const product = products.find((p) => p.id === productId)
    if (!product?.variants_enabled) {
      setVariants([])
      return
    }
    supabase
      .from('product_variants')
      .select('id, name, variant_type, price')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setVariants(data || []))
  }, [action.config.productId, products])

  const update = (key: string, value: any) => {
    onChange({ ...action.config, [key]: value })
    if (key === 'productId') {
      onChange({ ...action.config, productId: value, variantId: null })
    }
  }

  const product = products.find((p) => p.id === action.config.productId)

  return (
    <>
      <div className="space-y-1">
        <Label className="text-xs">Product *</Label>
        <select
          className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
          value={action.config.productId || ''}
          onChange={(e) => update('productId', e.target.value || null)}
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {action.config.productId && variants.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs">Variant *</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
            value={action.config.variantId || ''}
            onChange={(e) => update('variantId', e.target.value || null)}
          >
            <option value="">Select Variant</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} - ${v.price}
              </option>
            ))}
          </select>
        </div>
      )}

      {action.config.productId && variants.length === 0 && product && !product.variants_enabled && (
        <p className="text-xs text-muted-foreground">
          Product has no variants. Default checkout will be used.
        </p>
      )}
    </>
  )
}
