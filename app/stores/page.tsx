'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Lock,
  ArrowRight,
  PlusCircle,
  Building2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function StoresPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [stores, setStores] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
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
    fetchProductsAndStores()
  }, [selectedCategory])

  const fetchProductsAndStores = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Fetch stores
      const storeRes = await fetch('/api/stores')
      if (storeRes.ok) {
        const storeData = await storeRes.json()
        setStores(Array.isArray(storeData) ? storeData : [])
      }

      // 2. Fetch products
      const params = new URLSearchParams()
      if (selectedCategory !== 'ALL') {
        params.append('category', selectedCategory)
      }
      const prodRes = await fetch(`/api/products?${params}`)
      if (!prodRes.ok) {
        throw new Error('Failed to fetch hardware products')
      }
      const prodData = await prodRes.json()
      const safeProducts = Array.isArray(prodData) ? prodData : []
      setProducts(safeProducts)
    } catch (err: any) {
      console.error('Failed to fetch products/stores:', err)
      setError(err.message || 'Failed to load products and stores')
      setProducts([])
      setStores([])
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
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
    // ENFORCE ACCOUNT CREATION / AUTHENTICATION BEFORE PURCHASING
    if (!session?.user) {
      setShowAuthModal(true)
      return
    }

    setCheckoutSuccess(true)
    setTimeout(() => {
      setCart([])
      setIsCartOpen(false)
      setCheckoutSuccess(false)
      toast({
        title: 'Order Confirmed! (ඇණවුම සාර්ථකයි)',
        description: `Your order has been routed to the partner hardware store. Invoice sent to ${session.user.email}.`,
      })
    }, 1500)
  }

  const handleAddListingClick = () => {
    // ENFORCE ACCOUNT CREATION / AUTHENTICATION BEFORE ADDING LISTINGS
    if (!session?.user) {
      toast({
        title: 'Hardware Store Account Required',
        description: 'Please sign up as a Hardware Store seller to list construction materials.',
      })
      router.push('/auth/signup?role=HARDWARE_STORE')
      return
    }

    if (session.user.role !== 'HARDWARE_STORE') {
      toast({
        title: 'Store Account Needed',
        description: 'Only registered Hardware Store accounts can list materials. You are currently signed in as a ' + session.user.role,
      })
      return
    }

    router.push('/dashboard/products')
  }

  const filteredProducts = Array.isArray(products)
    ? products.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.store?.storeName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Hammer className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Wandura</span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-100">
              ශ්‍රී ලංකා 🇱🇰
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleAddListingClick}
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-semibold"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>List Your Store / Materials</span>
            </Button>

            <Button variant="ghost" size="sm" asChild className="text-gray-600 text-xs font-semibold">
              <Link href="/dashboard">Dashboard</Link>
            </Button>

            <Button
              onClick={() => setIsCartOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl relative shadow-sm gap-2 text-xs"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Cart</span>
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
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-900">Hardware Stores & Materials</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Hardware Stores & Materials (හාඩ්වෙයාර් වෙළඳසැල්)
              </h1>
              <p className="text-gray-500 mt-1">
                Browse verified Sri Lankan supply depots, compare prices in LKR, and order direct to your site.
              </p>
            </div>

            <Button
              onClick={handleAddListingClick}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold gap-2 self-start md:self-auto shadow-sm"
            >
              <Building2 className="h-4 w-4" />
              <span>Are You a Store Owner? Sell on Wandura</span>
            </Button>
          </div>
        </div>

        {/* Featured Partner Stores Section */}
        {stores.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <StoreIcon className="h-5 w-5 text-blue-600" />
                  Verified Hardware Stores (තහවුරු කළ වෙළඳසැල්)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Click any store to view its full catalog and exclusive discounts</p>
              </div>
              <span className="text-xs text-gray-400 font-semibold">{stores.length} Partner Stores</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {stores.map((store) => {
                const storeImg =
                  store.user?.image ||
                  'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&auto=format&fit=crop&q=80'

                return (
                  <Link
                    key={store.id}
                    href={`/stores/${store.id}`}
                    className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row"
                  >
                    <div className="sm:w-2/5 h-44 sm:h-auto relative overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={storeImg}
                        alt={store.storeName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="flex items-center gap-1 text-[11px] font-semibold bg-green-600 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                          <ShieldCheck className="h-3 w-3" /> Verified Partner
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                            {store.storeName}
                          </h3>
                        </div>

                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span>{store.address}, {store.city}</span>
                        </p>

                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                          {store.description || 'Quality building materials, cement, timber, and hardware supplies.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-gray-800">{store.rating?.toFixed(1) || '4.8'}</span>
                          <span className="text-xs text-gray-400">({store.totalReviews || 98})</span>
                        </div>

                        <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>View Inventory ({store._count?.products || 6}+ items)</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search materials (e.g. Portland Cement, River Sand, Tiles, Rebar)..."
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

          <div className="w-full md:w-64 flex-shrink-0">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-gray-50 text-sm font-medium">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'ALL' ? 'All Categories (සියල්ල)' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Construction Materials Catalog (ද්‍රව්‍ය නාමාවලිය)
            </h2>
            {!loading && (
              <span className="text-xs text-gray-400 font-medium">
                {filteredProducts.length} materials available
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
              <p className="text-sm">Loading materials...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold text-red-800 mb-1">Failed to Load Products</h3>
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <Button
                onClick={fetchProductsAndStores}
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-100 rounded-xl"
              >
                Try Again
              </Button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No Materials Found</h3>
              <p className="text-sm text-gray-500 mb-6">
                Try selecting a different category or clearing your search term.
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
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
                      <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                        <img
                          src={productImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[11px] font-semibold text-blue-700 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
                            {product.category}
                          </span>
                        </div>
                        <div className="absolute top-2.5 right-2.5">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm ${
                              inStock
                                ? 'bg-green-600/90 text-white backdrop-blur-sm'
                                : 'bg-red-600/90 text-white backdrop-blur-sm'
                            }`}
                          >
                            {inStock ? `${product.stock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                          {product.name}
                        </h3>

                        {product.store?.id && (
                          <Link
                            href={`/stores/${product.store.id}`}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2 font-medium"
                          >
                            <StoreIcon className="h-3 w-3" />
                            <span className="truncate">{product.store.storeName}</span>
                          </Link>
                        )}

                        {product.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <div className="pt-3 border-t border-gray-100 mb-3 flex items-baseline justify-between">
                        <div>
                          <span className="text-lg font-bold text-blue-600">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">/ {product.unit}</span>
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium">SLS</span>
                      </div>

                      <Button
                        onClick={() => addToCart(product)}
                        disabled={!inStock}
                        className={`w-full rounded-xl text-xs font-semibold gap-1.5 ${
                          inStock
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        {inStock ? 'Add to Cart' : 'Unavailable'}
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
                    <h2 className="text-lg font-bold text-gray-900">Order Cart</h2>
                    <p className="text-xs text-gray-400">{totalCartItems} items selected</p>
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
                      Browse available construction materials and add them to your order.
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
              To place orders for construction materials, track site deliveries, and receive official receipts, please create an account or sign in.
            </p>

            <div className="space-y-3">
              <Button
                asChild
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm"
              >
                <Link href="/auth/signup?callbackUrl=/stores">
                  Create Customer Account (ගිණුමක් සාදන්න)
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full h-11 rounded-xl text-gray-700 font-medium border-gray-200"
              >
                <Link href="/auth/signin?callbackUrl=/stores">
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
