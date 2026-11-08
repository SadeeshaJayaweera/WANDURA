'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import {
  Hammer,
  ShoppingCart,
  Store as StoreIcon,
  MapPin,
  Star,
  Search,
  ChevronRight,
  Package,
  Plus,
  Minus,
  Trash2,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Phone,
  ArrowLeft,
  Lock,
  Layers,
  Sparkles,
  Building2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// Dynamic import of Leaflet Map for store location
const WorkerMap = dynamic(() => import('@/components/map/WorkerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 rounded-2xl bg-gray-100 flex flex-col items-center justify-center text-gray-400">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-2" />
      <p className="text-xs">Loading store location map...</p>
    </div>
  ),
})

export default function StoreDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { t, isSinhala } = useLanguage()

  const storeId = params?.id as string

  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [cart, setCart] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)

  const categories = [
    'ALL',
    'Cement & Concrete',
    'Sand & Aggregate',
    'Blocks & Bricks',
    'Steel & Metal',
    'Tiles',
    'Adhesives & Mortar',
    'Welding Supplies',
    'Plumbing & Pipes',
    'Paint & Finishes',
  ]

  useEffect(() => {
    if (!storeId) return
    fetchStoreDetails()
  }, [storeId])

  const fetchStoreDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/stores/${storeId}`)
      if (!res.ok) {
        throw new Error('Hardware store not found')
      }
      const data = await res.json()
      setStore(data.store)
      setProducts(Array.isArray(data.products) ? data.products : [])
    } catch (err: any) {
      console.error('Failed to load store:', err)
      setError(err.message || 'Store could not be loaded')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.id === product.id)
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast({
          title: 'Stock limit reached',
          description: `Only ${product.stock} ${product.unit} available.`,
        })
        return
      }
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      )
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
    toast({
      title: 'Added to cart',
      description: `${product.name} added to your order.`,
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      )
    }
  }

  const getTotalCost = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleCheckout = () => {
    // ENFORCE ACCOUNT REQUIREMENT FOR PURCHASES
    if (!session?.user) {
      setShowAuthModal(true)
      return
    }

    // Authenticated user checkout
    setCheckoutSuccess(true)
    setTimeout(() => {
      setCart([])
      setIsCartOpen(false)
      setCheckoutSuccess(false)
      toast({
        title: 'Order Placed Successfully! (ඇණවුම සාර්ථකයි)',
        description: `Order confirmed with ${store?.storeName}. Invoice and delivery tracking sent to ${session.user.email}.`,
      })
    }, 1500)
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === 'ALL' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-100 h-16 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Hammer className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Wandura</span>
          </Link>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-3" />
          <p className="text-sm font-medium">Loading store inventory & details...</p>
        </div>
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-100 h-16 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Hammer className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Wandura</span>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 max-w-md text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Store Not Found</h2>
            <p className="text-sm text-gray-500 mb-6">{error || 'This hardware store does not exist.'}</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              <Link href="/stores">Browse All Hardware Stores</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const storeImage =
    store.user?.image ||
    'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=1200&auto=format&fit=crop&q=80'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Hammer className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Wandura</span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-100">
              {t('countryTag')}
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            <LanguageToggle />
            <ThemeToggle />

            <Button variant="outline" size="sm" asChild className="rounded-xl border-gray-200">
              <Link href="/stores" className="flex items-center gap-1.5 text-xs font-semibold">
                <ArrowLeft className="h-3.5 w-3.5" /> {t('nav.allStores')}
              </Link>
            </Button>
            <Button
              onClick={() => setIsCartOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl relative shadow-sm gap-2 text-xs font-semibold"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{t('nav.cart')}</span>
              {totalCartItems > 0 && (
                <span className="bg-white text-blue-700 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 flex-1 max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">{t('nav.home')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/stores" className="hover:text-blue-600">{t('nav.stores')}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 font-medium truncate">{store.storeName}</span>
        </div>

        {/* Store Profile Hero Banner */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm mb-10">
          <div className="relative h-64 md:h-80 w-full overflow-hidden bg-gray-900">
            <img
              src={storeImage}
              alt={store.storeName}
              className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                  <span className="flex items-center gap-1 text-xs font-semibold bg-green-500/90 text-white px-2.5 py-1 rounded-full backdrop-blur-md">
                    <ShieldCheck className="h-3.5 w-3.5" /> {t('common.verifiedPartner')}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-md">
                    <MapPin className="h-3.5 w-3.5" /> {store.city}, {store.state}
                  </span>
                  {store.latitude && store.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-full backdrop-blur-md transition-colors"
                    >
                      🗺️ {t('common.googleMaps')}
                    </a>
                  )}
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                  {store.storeName}
                </h1>
                <p className="text-gray-200 text-sm md:text-base mt-2 line-clamp-2">
                  {store.description || 'Quality building materials, cement, timber, and hardware supplies.'}
                </p>
              </div>

              <div className="flex flex-row md:flex-col items-start md:items-end gap-3 flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 text-center">
                  <div className="flex items-center gap-1.5 justify-center">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-bold text-white">{store.rating?.toFixed(1) || '4.8'}</span>
                  </div>
                  <span className="text-[11px] text-gray-300">({store.totalReviews || 120} reviews)</span>
                </div>
                {store.phone && (
                  <a
                    href={`tel:${store.phone}`}
                    className="flex items-center gap-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    <Phone className="h-3.5 w-3.5" /> {store.phone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Location & Operating Details Bar */}
          <div className="p-6 bg-white border-t border-gray-100 grid md:grid-cols-3 gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-gray-900 block">Store Address</span>
                <span>{store.address}, {store.city}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                <Package className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-gray-900 block">Inventory Available</span>
                <span>{products.length} distinct construction materials in stock</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <span className="font-semibold text-gray-900 block">Delivery Coverage</span>
                <span>Same-day & scheduled site delivery across {store.city} area</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Search items in ${store.storeName} (e.g. Portland Cement, Sand, Rebar)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat === 'ALL' ? t('cat.all') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              {t('storeDetail.inventory')} ({filteredProducts.length})
            </h2>
            <span className="text-xs text-gray-400 font-medium">LKR Currency (Rs.)</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No Materials Matched</h3>
              <p className="text-sm text-gray-500 mb-6">
                Try searching with a different keyword or resetting your filter.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('ALL')
                }}
                className="rounded-xl"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const inStock = product.stock > 0
                const productImage =
                  product.images?.[0] ||
                  'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80'

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                        <img
                          src={productImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="text-xs font-medium text-blue-700 bg-white/90 backdrop-blur-sm border border-blue-100 px-2.5 py-1 rounded-full shadow-sm">
                            {product.category}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm ${
                              inStock
                                ? 'bg-green-600/90 text-white backdrop-blur-sm'
                                : 'bg-red-600/90 text-white backdrop-blur-sm'
                            }`}
                          >
                            {inStock ? `${product.stock} ${product.unit} ${t('common.inStock')}` : t('common.outOfStock')}
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 text-base mb-1.5 line-clamp-2">
                          {product.name}
                        </h3>

                        {product.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <div className="pt-4 border-t border-gray-100 mb-3 flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl font-black text-blue-600">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">/ {product.unit}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-400">SLS Certified</span>
                      </div>

                      <Button
                        onClick={() => addToCart(product)}
                        disabled={!inStock}
                        className={`w-full rounded-xl text-sm font-medium gap-2 ${
                          inStock
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {inStock ? t('common.addToCart') : t('common.unavailable')}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Store Order Cart</h2>
                    <p className="text-xs text-gray-400">{store.storeName} ({totalCartItems} items)</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-3 text-gray-300">
                      <ShoppingCart className="h-8 w-8" />
                    </div>
                    <p className="font-semibold text-gray-700">Your cart is empty</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">
                      Select materials from this hardware store to prepare your construction order.
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-400">
                          {formatCurrency(item.price)} per {item.unit}
                        </p>
                        <p className="text-xs text-blue-600 font-bold mt-1">
                          Total: {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-red-500 p-1 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
                  <div className="flex items-center justify-between text-base font-bold text-gray-900">
                    <span>Estimated Total:</span>
                    <span className="text-2xl text-blue-600 font-bold">
                      {formatCurrency(getTotalCost())}
                    </span>
                  </div>

                  {!session?.user && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                      <Lock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        Account required to finalize purchase and schedule delivery to your site.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button
                      onClick={handleCheckout}
                      disabled={checkoutSuccess}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm flex items-center justify-center gap-2"
                    >
                      {checkoutSuccess ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Processing Order...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Proceed to Checkout
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCart([])}
                      className="w-full rounded-xl text-gray-500"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Account Gate Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-md w-full p-7 text-center relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Account Required to Purchase (ගිණුමක් අවශ්‍යයි)
            </h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              To purchase construction materials from <strong>{store.storeName}</strong>, verify delivery address, and receive SMS invoice confirmations, please create a customer account or sign in.
            </p>

            <div className="space-y-3">
              <Button
                asChild
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm"
              >
                <Link href={`/auth/signup?callbackUrl=/stores/${storeId}`}>
                  Create Free Account (ගිණුමක් සාදන්න)
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full h-11 rounded-xl text-gray-700 font-medium border-gray-200"
              >
                <Link href={`/auth/signin?callbackUrl=/stores/${storeId}`}>
                  Already have an account? Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

