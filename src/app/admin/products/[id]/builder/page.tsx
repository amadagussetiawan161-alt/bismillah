'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, use } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Loader2, Eye, Save, Globe, GlobeOff, Plus, Trash2, Copy,
  ChevronUp, ChevronDown, Type, Image as ImageIcon, Video,
  Star, Clock, HelpCircle, ShoppingCart, Phone, Link2,
  FileText, Layout, Separator as SepIcon, MoveVertical, Code
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BuilderBlock {
  id: string
  type: string
  content: Record<string, any>
}

const BLOCK_TYPES = [
  { type: 'hero', label: 'Hero', icon: Layout },
  { type: 'heading', label: 'Heading', icon: Type },
  { type: 'text', label: 'Text', icon: FileText },
  { type: 'image', label: 'Image', icon: ImageIcon },
  { type: 'gallery', label: 'Gallery', icon: ImageIcon },
  { type: 'video', label: 'Video', icon: Video },
  { type: 'features', label: 'Features', icon: Star },
  { type: 'pricing', label: 'Pricing', icon: ShoppingCart },
  { type: 'testimonials', label: 'Testimonials', icon: Star },
  { type: 'faq', label: 'FAQ', icon: HelpCircle },
  { type: 'countdown', label: 'Countdown', icon: Clock },
  { type: 'cta', label: 'CTA', icon: ShoppingCart },
  { type: 'affiliate_cta', label: 'Affiliate CTA', icon: Link2 },
  { type: 'divider', label: 'Divider', icon: SepIcon },
  { type: 'spacer', label: 'Spacer', icon: MoveVertical },
  { type: 'html', label: 'Custom HTML', icon: Code },
]

function getDefaultContent(type: string): Record<string, any> {
  switch (type) {
    case 'hero': return { title: 'Your Product Name', subtitle: 'The best solution for your needs', buttonText: 'Get Started', bgImage: '', align: 'center' }
    case 'heading': return { text: 'Section Heading', level: 'h2', align: 'center' }
    case 'text': return { text: 'Enter your content here...', align: 'left' }
    case 'image': return { src: '', alt: '', caption: '', align: 'center' }
    case 'gallery': return { images: [] }
    case 'video': return { url: '', caption: '' }
    case 'features': return { items: [{ title: 'Feature 1', description: 'Description' }, { title: 'Feature 2', description: 'Description' }, { title: 'Feature 3', description: 'Description' }] }
    case 'pricing': return { price: '$99', period: 'one-time', features: ['Feature 1', 'Feature 2', 'Feature 3'], buttonText: 'Buy Now' }
    case 'testimonials': return { items: [{ name: 'John Doe', role: 'Customer', text: 'Great product!', avatar: '' }] }
    case 'faq': return { items: [{ question: 'Question?', answer: 'Answer.' }] }
    case 'countdown': return { targetDate: '', label: 'Offer ends in:' }
    case 'cta': return { text: 'Ready to get started?', buttonText: 'Buy Now', align: 'center' }
    case 'affiliate_cta': return { text: 'Earn commissions by promoting this product!', buttonText: 'Join Affiliate Program', align: 'center' }
    case 'divider': return { style: 'solid' }
    case 'spacer': return { height: 40 }
    case 'html': return { code: '<div>Custom HTML</div>' }
    default: return {}
  }
}

function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [blocks, setBlocks] = useState<BuilderBlock[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [published, setPublished] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: productData } = await supabase.from('products').select('*').eq('id', id).single()
      if (productData) {
        setProduct(productData)
        setPublished(productData.builder_published || false)
        const content = productData.builder_content
        if (content && Array.isArray(content) && content.length > 0) {
          setBlocks(content)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [id])

  useEffect(() => {
    if (blocks.length === 0) return
    const timer = setTimeout(() => {
      handleSave(true)
    }, 5000)
    return () => clearTimeout(timer)
  }, [blocks])

  const addBlock = (type: string) => {
    const newBlock: BuilderBlock = { id: crypto.randomUUID(), type, content: getDefaultContent(type) }
    setBlocks(prev => [...prev, newBlock])
    setSelectedBlockId(newBlock.id)
  }

  const updateBlock = (blockId: string, content: Record<string, any>) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content } : b))
  }

  const removeBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId))
    if (selectedBlockId === blockId) setSelectedBlockId(null)
  }

  const duplicateBlock = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId)
    if (!block) return
    const newBlock: BuilderBlock = { id: crypto.randomUUID(), type: block.type, content: JSON.parse(JSON.stringify(block.content)) }
    const idx = blocks.findIndex(b => b.id === blockId)
    setBlocks(prev => [...prev.slice(0, idx + 1), newBlock, ...prev.slice(idx + 1)])
  }

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const idx = blocks.findIndex(b => b.id === blockId)
    if (idx === -1) return
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === blocks.length - 1) return
    const newBlocks = [...blocks]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newBlocks[idx], newBlocks[swapIdx]] = [newBlocks[swapIdx], newBlocks[idx]]
    setBlocks(newBlocks)
  }

  const handleSave = async (silent = false) => {
    if (!silent) setSaving(true)
    const { error } = await supabase.from('products').update({
      builder_content: blocks,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (error && !silent) toast.error('Save failed: ' + error.message)
    else if (!silent) toast.success('Draft saved')
    if (!silent) setSaving(false)
  }

  const handlePublish = async () => {
    setSaving(true)
    const { error } = await supabase.from('products').update({
      builder_content: blocks,
      builder_published: true,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) toast.error('Publish failed: ' + error.message)
    else { toast.success('Published!'); setPublished(true) }
    setSaving(false)
  }

  const handleUnpublish = async () => {
    const { error } = await supabase.from('products').update({
      builder_published: false,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) toast.error('Unpublish failed')
    else { toast.success('Unpublished'); setPublished(false) }
  }

  const selectedBlock = blocks.find(b => b.id === selectedBlockId)

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold">Builder: {product?.name}</h1>
          {published ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Published</span> : <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Draft</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={previewMode ? 'default' : 'outline'} onClick={() => setPreviewMode(!previewMode)}><Eye className="h-4 w-4 mr-1" />{previewMode ? 'Edit' : 'Preview'}</Button>
          <Button size="sm" variant="outline" onClick={() => handleSave()} disabled={saving}>{saving && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}<Save className="h-4 w-4 mr-1" />Save Draft</Button>
          {published ? (
            <Button size="sm" variant="outline" onClick={handleUnpublish}><GlobeOff className="h-4 w-4 mr-1" />Unpublish</Button>
          ) : (
            <Button size="sm" onClick={handlePublish} disabled={saving}>{saving && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}<Globe className="h-4 w-4 mr-1" />Publish</Button>
          )}
        </div>
      </div>

      {previewMode ? (
        <div className="flex-1 overflow-auto bg-white">
          <PreviewRenderer blocks={blocks} product={product} />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-56 border-r bg-muted/30 overflow-y-auto p-3">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              {BLOCK_TYPES.map((bt) => (
                <button key={bt.type} onClick={() => addBlock(bt.type)} className="flex flex-col items-center gap-1 p-2 rounded-md bg-background border hover:border-primary transition-colors text-xs">
                  <bt.icon className="h-4 w-4" />
                  <span>{bt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-muted/20 p-6">
            <div className="max-w-3xl mx-auto space-y-2">
              {blocks.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  <p>Click an element from the sidebar to add it here.</p>
                </div>
              )}
              {blocks.map((block, idx) => (
                <div
                  key={block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`relative group rounded-lg border-2 transition-all cursor-pointer ${selectedBlockId === block.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-muted'}`}
                >
                  <div className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 flex gap-0.5 z-10">
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up') }} disabled={idx === 0} className="p-1 bg-background rounded shadow border"><ChevronUp className="h-3 w-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down') }} disabled={idx === blocks.length - 1} className="p-1 bg-background rounded shadow border"><ChevronDown className="h-3 w-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); duplicateBlock(block.id) }} className="p-1 bg-background rounded shadow border"><Copy className="h-3 w-3" /></button>
                    <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id) }} className="p-1 bg-background rounded shadow border text-destructive"><Trash2 className="h-3 w-3" /></button>
                  </div>
                  <div className="pointer-events-none p-4">
                    <BlockPreview block={block} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-72 border-l bg-muted/30 overflow-y-auto p-3">
            {selectedBlock ? (
              <BlockSettings block={selectedBlock} onChange={(content) => updateBlock(selectedBlock.id, content)} />
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">Select a block to edit its settings.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function BlockPreview({ block }: { block: BuilderBlock }) {
  const { type, content } = block
  switch (type) {
    case 'hero': return (
      <div className={`text-center py-8 ${content.bgImage ? 'bg-cover bg-center' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white rounded-lg`} style={content.bgImage ? { backgroundImage: `url(${content.bgImage})` } : {}}>
        <h2 className="text-2xl font-bold">{content.title}</h2>
        <p className="mt-2">{content.subtitle}</p>
        <button className="mt-4 px-4 py-2 bg-white text-black rounded">{content.buttonText}</button>
      </div>
    )
    case 'heading': return <div className={`text-${content.align}`}><h2 className="text-xl font-bold">{content.text}</h2></div>
    case 'text': return <div className={`text-${content.align} text-sm text-muted-foreground`}><p>{content.text}</p></div>
    case 'image': return <div className={`text-${content.align}`}>{content.src ? <img src={content.src} alt={content.alt} className="max-h-32 mx-auto rounded" /> : <div className="h-24 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">Image</div>}{content.caption && <p className="text-xs mt-1">{content.caption}</p>}</div>
    case 'gallery': return <div className="grid grid-cols-3 gap-2">{content.images?.length ? content.images.map((img: string, i: number) => <img key={i} src={img} className="h-16 w-full object-cover rounded" />) : <div className="col-span-3 h-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">Gallery</div>}</div>
    case 'video': return <div className="bg-muted rounded h-24 flex items-center justify-center text-xs text-muted-foreground">Video: {content.url || 'No URL'}</div>
    case 'features': return <div className="grid grid-cols-3 gap-2">{content.items?.map((f: any, i: number) => <div key={i} className="p-2 bg-muted rounded text-xs"><strong>{f.title}</strong><p>{f.description}</p></div>)}</div>
    case 'pricing': return <div className="p-4 bg-muted rounded text-center"><div className="text-2xl font-bold">{content.price}</div><div className="text-xs">{content.period}</div></div>
    case 'testimonials': return <div className="p-2 bg-muted rounded text-xs italic">&ldquo;{content.items?.[0]?.text || 'Testimonial'}&rdquo;</div>
    case 'faq': return <div className="space-y-1">{content.items?.map((q: any, i: number) => <div key={i} className="p-2 bg-muted rounded text-xs"><strong>Q: {q.question}</strong></div>)}</div>
    case 'countdown': return <div className="p-2 bg-muted rounded text-center text-xs">Countdown: {content.label}</div>
    case 'cta': return <div className={`text-${content.align} p-4 bg-muted rounded`}><p>{content.text}</p><button className="mt-2 px-3 py-1 bg-primary text-white rounded text-xs">{content.buttonText}</button></div>
    case 'affiliate_cta': return <div className={`text-${content.align} p-4 bg-green-50 rounded`}><p className="text-xs">{content.text}</p><button className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-xs">{content.buttonText}</button></div>
    case 'divider': return <hr className={`border-${content.style} my-2`} />
    case 'spacer': return <div style={{ height: content.height }} className="bg-dashed border border-dashed border-muted" />
    case 'html': return <div className="text-xs text-muted-foreground">Custom HTML</div>
    default: return <div className="text-xs text-muted-foreground">Unknown block</div>
  }
}

function BlockSettings({ block, onChange }: { block: BuilderBlock; onChange: (content: Record<string, any>) => void }) {
  const { type, content } = block

  const update = (key: string, value: any) => {
    onChange({ ...content, [key]: value })
  }

  const renderField = (key: string, label: string, inputType: string = 'text') => {
    if (inputType === 'textarea') {
      return (
        <div key={key} className="space-y-1">
          <label className="text-xs font-medium">{label}</label>
          <textarea className="w-full min-h-[60px] rounded-md border border-input bg-background px-2 py-1 text-xs" value={content[key] || ''} onChange={(e) => update(key, e.target.value)} />
        </div>
      )
    }
    if (inputType === 'select') {
      return (
        <div key={key} className="space-y-1">
          <label className="text-xs font-medium">{label}</label>
          <select className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs" value={content[key] || ''} onChange={(e) => update(key, e.target.value)}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      )
    }
    return (
      <div key={key} className="space-y-1">
        <label className="text-xs font-medium">{label}</label>
        <input className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs" type={inputType} value={content[key] || ''} onChange={(e) => update(key, e.target.value)} />
      </div>
    )
  }

  switch (type) {
    case 'hero': return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Hero Settings</h3>
        {renderField('title', 'Title')}
        {renderField('subtitle', 'Subtitle')}
        {renderField('buttonText', 'Button Text')}
        {renderField('bgImage', 'Background Image URL')}
        {renderField('align', 'Alignment', 'select')}
      </div>
    )
    case 'heading': return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Heading Settings</h3>
        {renderField('text', 'Text')}
        <div className="space-y-1"><label className="text-xs font-medium">Level</label><select className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs" value={content.level || 'h2'} onChange={(e) => update('level', e.target.value)}><option>h1</option><option>h2</option><option>h3</option><option>h4</option></select></div>
        {renderField('align', 'Alignment', 'select')}
      </div>
    )
    case 'text': return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Text Settings</h3>
        {renderField('text', 'Content', 'textarea')}
        {renderField('align', 'Alignment', 'select')}
      </div>
    )
    case 'image': return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Image Settings</h3>
        {renderField('src', 'Image URL')}
        {renderField('alt', 'Alt Text')}
        {renderField('caption', 'Caption')}
        {renderField('align', 'Alignment', 'select')}
      </div>
    )
    case 'video': return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Video Settings</h3>
        {renderField('url', 'Video URL')}
        {renderField('caption', 'Caption')}
      </div>
    )
    case 'features': return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Features Settings</h3>
        {content.items?.map((item: any, i: number) => (
          <div key={i} className="space-y-1 p-2 bg-background rounded border">
            <input className="w-full rounded border px-2 py-1 text-xs" value={item.title} onChange={(e) => { const items = [...content.items]; items[i].title = e.target.value; update('items', items) }} placeholder="Title" />
            <input className="w-full rounded border px-2 py-1 text-xs" value={item.description} onChange={(e) => { const items = [...content.items]; items[i].description = e.target.value; update('items', items) }} placeholder="Description" />
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => update('items', [...content.items, { title: 'New Feature', description: '' }])}><Plus className="h-3 w-3 mr-1" />Add Feature</Button>
      </div>
    )
    case 'pricing': return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Pricing Settings</h3>
        {renderField('price', 'Price')}
        {renderField('period', 'Period')}
        {renderField('buttonText', 'Button Text')}
      </div>
    )
    case 'testimonials': return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Testimonials Settings</h3>
        {content.items?.map((item: any, i: number) => (
          <div key={i} className="space-y-1 p-2 bg-background rounded border">
            <input className="w-full rounded border px-2 py-1 text-xs" value={item.name} onChange={(e) => { const items = [...content.items]; items[i].name = e.target.value; update('items', items) }} placeholder="Name" />
            <input className="w-full rounded border px-2 py-1 text-xs" value={item.text} onChange={(e) => { const items = [...content.items]; items[i].text = e.target.value; update('items', items) }} placeholder="Text" />
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => update('items', [...content.items, { name: '', text: '', role: '' }])}><Plus className="h-3 w-3 mr-1" />Add Testimonial</Button>
      </div>
    )
    case 'faq': return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">FAQ Settings</h3>
        {content.items?.map((item: any, i: number) => (
          <div key={i} className="space-y-1 p-2 bg-background rounded border">
            <input className="w-full rounded border px-2 py-1 text-xs" value={item.question} onChange={(e) => { const items = [...content.items]; items[i].question = e.target.value; update('items', items) }} placeholder="Question" />
            <textarea className="w-full rounded border px-2 py-1 text-xs" value={item.answer} onChange={(e) => { const items = [...content.items]; items[i].answer = e.target.value; update('items', items) }} placeholder="Answer" />
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => update('items', [...content.items, { question: '', answer: '' }])}><Plus className="h-3 w-3 mr-1" />Add FAQ</Button>
      </div>
    )
    case 'countdown': return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Countdown Settings</h3>
        {renderField('targetDate', 'Target Date (YYYY-MM-DD)')}
        {renderField('label', 'Label')}
      </div>
    )
    case 'cta': return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">CTA Settings</h3>
        {renderField('text', 'Text', 'textarea')}
        {renderField('buttonText', 'Button Text')}
        {renderField('align', 'Alignment', 'select')}
      </div>
    )
    case 'affiliate_cta': return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Affiliate CTA Settings</h3>
        {renderField('text', 'Text', 'textarea')}
        {renderField('buttonText', 'Button Text')}
        {renderField('align', 'Alignment', 'select')}
      </div>
    )
    case 'divider': return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Divider Settings</h3>
        <div className="space-y-1"><label className="text-xs font-medium">Style</label><select className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs" value={content.style || 'solid'} onChange={(e) => update('style', e.target.value)}><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option></select></div>
      </div>
    )
    case 'spacer': return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Spacer Settings</h3>
        <div className="space-y-1"><label className="text-xs font-medium">Height (px)</label><input className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs" type="number" value={content.height || 40} onChange={(e) => update('height', parseInt(e.target.value))} /></div>
      </div>
    )
    case 'html': return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">HTML Settings</h3>
        {renderField('code', 'HTML Code', 'textarea')}
      </div>
    )
    default: return <div className="text-sm text-muted-foreground">No settings for this block type.</div>
  }
}

function PreviewRenderer({ blocks, product }: { blocks: BuilderBlock[]; product: any }) {
  const getCtaUrl = () => {
    if (!product) return '#'
    switch (product.cta_type) {
      case 'whatsapp': return product.whatsapp_number ? `https://wa.me/${product.whatsapp_number}` : '#'
      case 'external_link': return product.external_url || '#'
      case 'order_form': return '#'
      default: return `/checkout?product=${product.slug}`
    }
  }

  const getCtaLabel = () => {
    if (!product) return 'Buy Now'
    switch (product.cta_type) {
      case 'whatsapp': return 'Chat on WhatsApp'
      case 'external_link': return 'Visit Link'
      case 'order_form': return 'Order Now'
      default: return 'Buy Now'
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-0">
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
    </div>
  )
}

export default function ProductBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <BuilderPage params={params} />
    </Suspense>
  )
}
