'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<any[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const categories = [
    'ALL',
    'Cement & Concrete',
    'Sand & Aggregate',
    'Tiles',
    'Steel & Metal',
    'Lumber',
    'Blocks & Bricks',
    'Adhesives & Mortar',
    'Welding Supplies',
  ]

  useEffect(() => {
    fetchProductsAndStores()
  }, [selectedCategory])

  const fetchProductsAndStores = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'ALL') {
        params.append('category', selectedCategory)
      }
      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch hardware products')
      }
      const data = await response.json()
      
      const safeProducts = Array.isArray(data) ? data : []
      setProducts(safeProducts)

      // Extract unique stores safely
      const uniqueStores = safeProducts.reduce((acc: any[], product: any) => {
        if (product?.store?.id && !acc.find((s) => s.id === product.store.id)) {
          acc.push(product.store)
        }
        return acc
      }, [])
      setStores(uniqueStores)
    } catch (err: any) {
      console.error('Failed to fetch products:', err)
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

  const filteredProducts = Array.isArray(products)
    ? products.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
          </Link>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-gray-600">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button
              onClick={() => setIsCartOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl relative shadow-sm gap-2"
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

      <main className="container mx-auto px-6 py-8 flex-1">
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
                Hardware Stores & Materials
              </h1>
              <p className="text-gray-500 mt-1">
                Order construction materials directly from verified partner supply stores.
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search materials (e.g. Portland Cement, Lumber, Tiles)..."
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
                    {cat === 'ALL' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Featured Stores Section */}
        {stores.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <StoreIcon className="h-5 w-5 text-blue-600" />
                Partner Stores
              </h2>
              <span className="text-xs text-gray-400 font-medium">{stores.length} Verified Stores</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <StoreIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate">{store.storeName}</h3>
                      <span className="flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                        <ShieldCheck className="h-3 w-3" /> Partner
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {store.city}, {store.state}
                    </p>
                    {store.rating > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-gray-700">{store.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">Rating</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Available Materials
            </h2>
            {!loading && (
              <span className="text-xs text-gray-400 font-medium">
                {filteredProducts.length} items found
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center max-w-md mx-auto">
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
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                          {product.category}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            inStock
                              ? 'bg-green-50 text-green-700 border border-green-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}
                        >
                          {inStock ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
                        {product.name}
                      </h3>

                      {product.store?.storeName && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                          <StoreIcon className="h-3 w-3" />
                          {product.store.storeName}
                        </p>
                      )}

                      {product.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                          {product.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <span className="text-xl font-bold text-blue-600">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">/ {product.unit}</span>
                        </div>
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

                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        toast({
                          title: 'Checkout initiated',
                          description: 'Stripe order checkout session ready.',
                        })
                      }}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm"
                    >
                      Proceed to Checkout
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
    </div>
  )
}
