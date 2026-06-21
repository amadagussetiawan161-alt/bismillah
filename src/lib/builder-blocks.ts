export interface BlockDefinition {
  type: string
  label: string
  icon: string
  category: string
  defaultContent: Record<string, any>
  supportsActions?: boolean
}

export const BLOCK_CATEGORIES = [
  {
    name: 'Layout',
    description: 'Containers and structure',
    blocks: [
      { type: 'section', label: 'Section', icon: 'Layout' },
      { type: 'container', label: 'Container', icon: 'Layout' },
      { type: 'grid', label: 'Grid', icon: 'Layout' },
      { type: 'columns', label: 'Columns', icon: 'Layout' },
      { type: 'tabs', label: 'Tabs', icon: 'Layout' },
      { type: 'accordion', label: 'Accordion', icon: 'Layout' },
      { type: 'timeline', label: 'Timeline', icon: 'Layout' },
    ],
  },
  {
    name: 'Basic',
    description: 'Text and media',
    blocks: [
      { type: 'heading', label: 'Heading', icon: 'Type' },
      { type: 'text', label: 'Text', icon: 'FileText' },
      { type: 'button', label: 'Button', icon: 'ArrowRight', supportsActions: true },
      { type: 'divider', label: 'Divider', icon: 'Sparkles' },
      { type: 'spacer', label: 'Spacer', icon: 'MoveVertical' },
      { type: 'icon', label: 'Icon', icon: 'ImageIcon' },
      { type: 'icon_text', label: 'Icon + Text', icon: 'FileText' },
      { type: 'badge', label: 'Badge', icon: 'Badge' },
      { type: 'alert', label: 'Alert Box', icon: 'AlertCircle' },
      { type: 'progress', label: 'Progress Bar', icon: 'Loader2' },
    ],
  },
  {
    name: 'Media',
    description: 'Images and videos',
    blocks: [
      { type: 'image', label: 'Image', icon: 'ImageIcon', supportsActions: true },
      { type: 'gallery', label: 'Gallery', icon: 'ImageIcon' },
      { type: 'video', label: 'Video', icon: 'Video' },
      { type: 'image_banner', label: 'Image Banner', icon: 'ImageIcon', supportsActions: true },
      { type: 'image_overlay', label: 'Image + Button Overlay', icon: 'ImageIcon', supportsActions: true },
      { type: 'image_hotspot', label: 'Image Hotspot', icon: 'ImageIcon', supportsActions: true },
      { type: 'carousel', label: 'Image Carousel', icon: 'ImageIcon' },
      { type: 'auto_slider', label: 'Auto Slider', icon: 'ImageIcon' },
      { type: 'before_after', label: 'Before / After Image', icon: 'ImageIcon' },
      { type: 'lightbox', label: 'Lightbox Gallery', icon: 'ImageIcon' },
      { type: 'bg_video', label: 'Background Video', icon: 'Video' },
      { type: 'youtube', label: 'YouTube Embed', icon: 'Video' },
      { type: 'vimeo', label: 'Vimeo Embed', icon: 'Video' },
    ],
  },
  {
    name: 'Marketing',
    description: 'Conversion elements',
    blocks: [
      { type: 'hero', label: 'Hero', icon: 'Layout' },
      { type: 'hero_centered', label: 'Hero Centered', icon: 'Layout' },
      { type: 'hero_split', label: 'Hero Split', icon: 'Layout' },
      { type: 'hero_video', label: 'Hero Video', icon: 'Video' },
      { type: 'hero_countdown', label: 'Hero Countdown', icon: 'Clock' },
      { type: 'features', label: 'Features', icon: 'Star' },
      { type: 'pricing', label: 'Pricing', icon: 'DollarSign' },
      { type: 'testimonials', label: 'Testimonials', icon: 'Star' },
      { type: 'testimonial_carousel', label: 'Testimonial Carousel', icon: 'Star' },
      { type: 'faq', label: 'FAQ', icon: 'HelpCircle' },
      { type: 'countdown', label: 'Countdown', icon: 'Clock' },
    ],
  },
  {
    name: 'Sales',
    description: 'Sales-focused blocks',
    blocks: [
      { type: 'offer_box', label: 'Offer Box', icon: 'Package' },
      { type: 'cta', label: 'CTA Section', icon: 'ShoppingCart', supportsActions: true },
      { type: 'guarantee', label: 'Guarantee Box', icon: 'Shield' },
      { type: 'benefits', label: 'Benefits List', icon: 'CheckCircle' },
      { type: 'comparison', label: 'Comparison Table', icon: 'Table' },
      { type: 'product_showcase', label: 'Product Showcase', icon: 'Package' },
      { type: 'product_grid', label: 'Product Grid', icon: 'Package' },
      { type: 'product_carousel', label: 'Product Carousel', icon: 'Package' },
      { type: 'promo_banner', label: 'Promo Banner', icon: 'Sparkles' },
      { type: 'coupon', label: 'Coupon Section', icon: 'Tag' },
      { type: 'scarcity', label: 'Scarcity Notice', icon: 'AlertCircle' },
      { type: 'stock_counter', label: 'Stock Counter', icon: 'Package' },
    ],
  },
  {
    name: 'Trust',
    description: 'Social proof',
    blocks: [
      { type: 'trust_badges', label: 'Trust Badges', icon: 'Shield' },
      { type: 'partner_logos', label: 'Partner Logos', icon: 'ImageIcon' },
      { type: 'customer_logos', label: 'Customer Logos', icon: 'ImageIcon' },
      { type: 'review_cards', label: 'Review Cards', icon: 'Star' },
      { type: 'star_ratings', label: 'Star Ratings', icon: 'Star' },
      { type: 'purchase_popup', label: 'Purchase Notification', icon: 'Bell' },
      { type: 'social_popup', label: 'Social Proof Popup', icon: 'Users' },
    ],
  },
  {
    name: 'Forms',
    description: 'Lead capture',
    blocks: [
      { type: 'contact_form', label: 'Contact Form', icon: 'FileText' },
      { type: 'email_form', label: 'Email Form', icon: 'Mail' },
      { type: 'lead_form', label: 'Lead Capture Form', icon: 'Users' },
      { type: 'multistep_form', label: 'Multi-Step Form', icon: 'FileText' },
      { type: 'newsletter', label: 'Newsletter Form', icon: 'Mail' },
      { type: 'survey', label: 'Survey Form', icon: 'FileText' },
    ],
  },
  {
    name: 'Checkout',
    description: 'Payment blocks',
    blocks: [
      { type: 'checkout_button', label: 'Checkout Button', icon: 'ShoppingCart', supportsActions: true },
      { type: 'order_summary', label: 'Order Summary', icon: 'FileText' },
      { type: 'product_selector', label: 'Product Selector', icon: 'Package' },
      { type: 'variant_selector', label: 'Variant Selector', icon: 'Package' },
      { type: 'coupon_input', label: 'Coupon Input', icon: 'Tag' },
      { type: 'payment_selector', label: 'Payment Method', icon: 'CreditCard' },
      { type: 'order_bump', label: 'Order Bump', icon: 'Package' },
      { type: 'upsell', label: 'Upsell Block', icon: 'Package' },
      { type: 'cross_sell', label: 'Cross-Sell Block', icon: 'Package' },
    ],
  },
  {
    name: 'Interactive',
    description: 'Engaging elements',
    blocks: [
      { type: 'popup_trigger', label: 'Popup Trigger', icon: 'Maximize2' },
      { type: 'modal', label: 'Modal', icon: 'Maximize2' },
      { type: 'slide_in', label: 'Slide-In Panel', icon: 'PanelLeft' },
      { type: 'floating_button', label: 'Floating Button', icon: 'Plus', supportsActions: true },
      { type: 'floating_whatsapp', label: 'Floating WhatsApp', icon: 'MessageCircle', supportsActions: true },
      { type: 'floating_telegram', label: 'Floating Telegram', icon: 'Send', supportsActions: true },
      { type: 'floating_cta', label: 'Floating CTA', icon: 'ShoppingCart', supportsActions: true },
      { type: 'sticky_bar', label: 'Sticky CTA Bar', icon: 'ShoppingCart', supportsActions: true },
      { type: 'sticky_button', label: 'Sticky Buy Button', icon: 'ShoppingCart', supportsActions: true },
    ],
  },
  {
    name: 'Product',
    description: 'Dynamic product data',
    blocks: [
      { type: 'product_image', label: 'Product Image', icon: 'ImageIcon' },
      { type: 'product_name', label: 'Product Name', icon: 'Package' },
      { type: 'product_price', label: 'Product Price', icon: 'DollarSign' },
      { type: 'product_description', label: 'Product Description', icon: 'FileText' },
      { type: 'buy_button', label: 'Buy Button', icon: 'ShoppingCart', supportsActions: true },
      { type: 'product_variants', label: 'Product Variants', icon: 'Package' },
    ],
  },
  {
    name: 'Advanced',
    description: 'Custom code',
    blocks: [
      { type: 'html', label: 'Custom HTML', icon: 'Code' },
    ],
  },
]

export function getDefaultBlockContent(type: string): Record<string, any> {
  // Default action config for blocks that support actions
  const defaultActions = []

  switch (type) {
    // Layout
    case 'section': return { padding: '80', bgColor: '#ffffff', maxWidth: '1200' }
    case 'container': return { padding: '40', bgColor: '#f8fafc', borderRadius: '12', maxWidth: '1200' }
    case 'grid': return { columns: '3', gap: '24', items: [] }
    case 'columns': return { columns: 2, gap: '24', distribution: 'equal' }
    case 'tabs': return { tabs: [{ title: 'Tab 1', content: '' }, { title: 'Tab 2', content: '' }], activeTab: 0 }
    case 'accordion': return { items: [{ title: 'Item 1', content: '' }, { title: 'Item 2', content: '' }], allowMultiple: false }
    case 'timeline': return { items: [{ title: 'Step 1', description: '', icon: '' }], orientation: 'vertical' }

    // Basic
    case 'heading': return { text: 'Section Heading', level: 'h2', align: 'center', color: '#0f172a', fontSize: '32', fontWeight: '700' }
    case 'text': return { text: 'Enter your content here...', align: 'left', color: '#475569', fontSize: '16', lineHeight: '1.6' }
    case 'button': return { text: 'Click Me', style: 'primary', size: 'md', align: 'center', rounded: 'md', actions: defaultActions }
    case 'divider': return { style: 'solid', color: '#e2e8f0', height: '1', width: '100' }
    case 'spacer': return { height: 40 }
    case 'icon': return { icon: 'Star', size: '24', color: '#0f172a', align: 'center' }
    case 'icon_text': return { icon: 'Check', text: 'Feature text', iconPosition: 'left', gap: '12' }
    case 'badge': return { text: 'New', variant: 'default', size: 'sm' }
    case 'alert': return { type: 'info', title: 'Information', message: 'This is an alert message', icon: true }
    case 'progress': return { value: 60, max: 100, showLabel: true, label: '60%', color: 'primary' }

    // Media
    case 'image': return { src: '', alt: '', width: '100%', height: 'auto', borderRadius: '12', align: 'center', caption: '', actions: defaultActions }
    case 'gallery': return { images: [], columns: '3', gap: '16', borderRadius: '12' }
    case 'video': return { url: '', caption: '', width: '100%', borderRadius: '12' }
    case 'image_banner': return { src: '', alt: '', height: '300', overlay: false, overlayColor: '#000000', overlayOpacity: 50, actions: defaultActions }
    case 'image_overlay': return { src: '', alt: '', buttons: [{ text: 'Button', position: 'center', actions: defaultActions }], actions: defaultActions }
    case 'image_hotspot': return { src: '', alt: '', hotspots: [{ x: 50, y: 50, tooltip: 'Hotspot', actions: defaultActions }], actions: defaultActions }
    case 'carousel': return { images: [], autoplay: false, autoplaySpeed: 5000, arrows: true, dots: true, borderRadius: '12' }
    case 'auto_slider': return { images: [], speed: 3000, direction: 'left', borderRadius: '12' }
    case 'before_after': return { beforeImage: '', afterImage: '', label: { before: 'Before', after: 'After' }, startPosition: 50 }
    case 'lightbox': return { images: [], columns: '3', gap: '16', borderRadius: '12' }
    case 'bg_video': return { src: '', poster: '', overlay: false, overlayColor: '#000000', overlayOpacity: 40, muted: true, loop: true }
    case 'youtube': return { videoId: '', autoplay: false, controls: true, modestBranding: true, borderRadius: '12' }
    case 'vimeo': return { videoId: '', autoplay: false, controls: true, borderRadius: '12' }

    // Marketing
    case 'hero': return { title: 'Your Product Name', subtitle: 'The best solution for your needs', buttonText: 'Get Started', bgImage: '', bgColor: '#0f172a', align: 'center', height: '500', overlayOpacity: '60', actions: defaultActions }
    case 'hero_centered': return { title: 'Your Product Name', subtitle: 'The best solution for your needs', buttonText: 'Get Started', bgImage: '', bgColor: '#0f172a', height: '500', actions: defaultActions }
    case 'hero_split': return { title: 'Your Product Name', subtitle: 'The best solution for your needs', buttonText: 'Get Started', image: '', bgColor: '#ffffff', imagePosition: 'right', actions: defaultActions }
    case 'hero_video': return { title: 'Your Product Name', subtitle: 'The best solution for your needs', buttonText: 'Get Started', videoUrl: '', bgImage: '', height: '600', actions: defaultActions }
    case 'hero_countdown': return { title: 'Limited Time Offer', subtitle: 'Offer ends soon', targetDate: '', bgImage: '', bgColor: '#0f172a', height: '500', actions: defaultActions }
    case 'features': return { items: [{ title: 'Feature 1', description: 'Description text', icon: 'Star' }], columns: '3', align: 'center' }
    case 'pricing': return { title: 'Simple Pricing', price: '$99', period: 'one-time', features: ['Feature 1', 'Feature 2', 'Feature 3'], buttonText: 'Buy Now', highlighted: false, align: 'center', actions: defaultActions }
    case 'testimonials': return { items: [{ name: 'John Doe', role: 'Customer', text: 'Great product!', avatar: '', rating: '5' }], columns: '2', align: 'center' }
    case 'testimonial_carousel': return { items: [{ name: 'John Doe', role: 'Customer', text: 'Great product!', avatar: '', rating: '5' }], autoplay: true, autoplaySpeed: 5000 }
    case 'faq': return { items: [{ question: 'Question?', answer: 'Answer.' }], align: 'left' }
    case 'countdown': return { targetDate: '', label: 'Offer ends in:', style: 'modern', align: 'center' }

    // Sales
    case 'offer_box': return { title: 'Special Offer', description: 'Get 50% off today!', badge: 'Limited', bgColor: '#f1f5f9', borderColor: 'primary', actions: defaultActions }
    case 'cta': return { title: 'Ready to get started?', text: 'Join thousands of satisfied customers.', buttonText: 'Buy Now', align: 'center', bgColor: '#f1f5f9', actions: defaultActions }
    case 'guarantee': return { title: '30-Day Money Back Guarantee', description: 'Not satisfied? Get a full refund.', icon: 'Shield', bgColor: '#f0fdf4' }
    case 'benefits': return { title: 'Benefits', items: [{ icon: 'Check', text: 'Benefit 1' }], style: 'list' }
    case 'comparison': return { title: 'Compare Plans', columns: [{ name: 'Basic', features: ['Feature 1', 'Feature 2'] }], highlightColumn: 1 }
    case 'product_showcase': return { productId: null, layout: 'left', showDescription: true, showPrice: true, showBuyButton: true, actions: defaultActions }
    case 'product_grid': return { category: null, limit: 6, columns: '3', showPrice: true, showBuyButton: true }
    case 'product_carousel': return { category: null, limit: 8, autoplay: true, autoplaySpeed: 4000 }
    case 'promo_banner': return { text: 'Get 50% off today! Use code: SAVE50', bgColor: '#dc2626', textColor: '#ffffff', dismissible: true }
    case 'coupon': return { code: 'SAVE50', description: '50% off your purchase', bgColor: '#f1f5f9' }
    case 'scarcity': return { text: 'Only 5 left in stock!', icon: true, bgColor: '#fef2f2', textColor: '#dc2626' }
    case 'stock_counter': return { stock: 10, lowThreshold: 5, showProgress: true }

    // Trust
    case 'trust_badges': return { badges: ['Secure', 'Verified', 'Guaranteed'], layout: 'horizontal' }
    case 'partner_logos': return { logos: [], grayscale: true, columns: '4' }
    case 'customer_logos': return { logos: [], grayscale: false, columns: '4' }
    case 'review_cards': return { reviews: [{ source: 'Google', rating: 5, text: 'Excellent!' }], columns: '3' }
    case 'star_ratings': return { rating: 4.5, count: 1234, showCount: true }
    case 'purchase_popup': return { enabled: true, position: 'bottom-left', showDelay: 5000, products: [] }
    case 'social_popup': return { enabled: true, position: 'bottom-left', showDelay: 3000, message: 'John just purchased!' }

    // Forms
    case 'contact_form': return { fields: ['name', 'email', 'message'], submitText: 'Send Message', successMessage: 'Thank you!' }
    case 'email_form': return { placeholder: 'Enter your email', submitText: 'Subscribe', successMessage: 'Subscribed!' }
    case 'lead_form': return { title: 'Get Started', fields: ['name', 'email', 'phone'], submitText: 'Submit', successMessage: 'Thank you!' }
    case 'multistep_form': return { steps: [{ title: 'Step 1', fields: ['name'] }, { title: 'Step 2', fields: ['email'] }], submitText: 'Submit' }
    case 'newsletter': return { title: 'Newsletter', description: 'Subscribe to our newsletter', placeholder: 'Enter your email', submitText: 'Subscribe' }
    case 'survey': return { title: 'Survey', questions: [{ question: 'Question?', type: 'text' }], submitText: 'Submit' }

    // Checkout
    case 'checkout_button': return { text: 'Checkout', style: 'primary', size: 'lg', fullWidth: false, actions: defaultActions }
    case 'order_summary': return { showDiscount: true, showTax: true, showTotal: true }
    case 'product_selector': return { products: [], selectedProductId: null }
    case 'variant_selector': return { productId: null, selectedVariantId: null }
    case 'coupon_input': return { placeholder: 'Enter coupon code', applyText: 'Apply' }
    case 'payment_selector': return { methods: ['card', 'paypal'], selectedMethod: 'card' }
    case 'order_bump': return { title: 'Add to your order', description: 'Special offer', price: 9.99, checked: false }
    case 'upsell': return { title: 'Upgrade your purchase', description: 'Get more value', price: 19.99, productId: null }
    case 'cross_sell': return { title: 'You might also like', products: [] }

    // Interactive
    case 'popup_trigger': return { triggerText: 'Open Popup', popupContent: '', triggerType: 'click' }
    case 'modal': return { title: 'Modal Title', content: '', size: 'md', closeOnOverlay: true }
    case 'slide_in': return { title: 'Panel Title', content: '', position: 'right', trigger: 'button' }
    case 'floating_button': return { icon: 'Plus', position: 'bottom-right', bgColor: 'primary', actions: defaultActions }
    case 'floating_whatsapp': return { phone: '', message: '', position: 'bottom-right', bgColor: '#25D366' }
    case 'floating_telegram': return { username: '', position: 'bottom-right', bgColor: '#0088cc' }
    case 'floating_cta': return { text: 'Buy Now', position: 'bottom-right', bgColor: 'primary', actions: defaultActions }
    case 'sticky_bar': return { text: 'Special offer!', buttonText: 'Get it now', position: 'top', bgColor: 'primary', actions: defaultActions }
    case 'sticky_button': return { text: 'Buy Now', position: 'bottom', bgColor: 'primary', actions: defaultActions }

    // Product
    case 'product_image': return { width: '100%', borderRadius: '12', align: 'center', maxWidth: '600' }
    case 'product_name': return { level: 'h1', align: 'center', color: '#0f172a', fontSize: '48', fontWeight: '800' }
    case 'product_price': return { align: 'center', showCompare: true, color: '#0f172a', compareColor: '#94a3b8', fontSize: '36', fontWeight: '700' }
    case 'product_description': return { align: 'center', color: '#475569', fontSize: '18', maxLines: '0' }
    case 'buy_button': return { text: 'Buy Now', style: 'primary', size: 'lg', align: 'center', rounded: 'md', fullWidth: false, actions: defaultActions }
    case 'product_variants': return { layout: 'select', showPrice: true }

    // Advanced
    case 'html': return { code: '<div style="padding: 20px; background: #f1f5f9; border-radius: 8px;">Custom HTML</div>' }

    default: return {}
  }
}

export function getAllBlockTypes(): string[] {
  const types: string[] = []
  BLOCK_CATEGORIES.forEach(cat => {
    cat.blocks.forEach(block => {
      types.push(block.type)
    })
  })
  return types
}
