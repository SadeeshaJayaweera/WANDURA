'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Hammer, ShoppingCart, Store as StoreIcon, MapPin, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<any[]>([])

  useEffect(() => {
    fetchProductsAndStores()
  }, [selectedCategory])

  const fetchProductsAndStores = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'ALL') {
        params.append('category', selectedCategory)
      }
      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      setProducts(data)

      // Extract unique stores
      const uniqueStores = data.reduce((acc: any[], product: any) => {
        if (!acc.find(s => s.id === product.store.id)) {
          acc.push(product.store)
        }
        return acc
      }, [])
      setStores(uniqueStores)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ))
    }
  }

  const getTotalCost = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = ['ALL', 'Cement & Concrete', 'Sand & Aggregate', 'Tiles', 'Steel & Metal', 'Lumber', 'Blocks & Bricks', 'Adhesives & Mortar', 'Welding Supplies']

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Hammer className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Wandura</span>
          </Link>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="default" className="relative">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Hardware Stores & Materials</h1>

        {/* Filters */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:col-span-2"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stores Section */}
        {stores.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Featured Stores</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {stores.map(store => (
                <Card key={store.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <StoreIcon className="h-5 w-5" />
                          {store.storeName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {store.city}, {store.state}
                        </p>
                      </div>
                      {store.rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{store.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No products found</p>
            </CardContent>
          </Card>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4">Products</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold mb-1">{product.name}</h3>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        By {product.store.storeName}
                      </p>
                    </div>

                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(product.price)}
                        </p>
                        <p className="text-xs text-muted-foreground">per {product.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {product.stock > 0 ? (
                            <span className="text-green-600">In Stock</span>
                          ) : (
                            <span className="text-red-600">Out of Stock</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{product.stock} available</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => addToCart(product)}
                      className="w-full"
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Shopping Cart Sidebar */}
        {cart.length > 0 && (
          <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl p-6 overflow-y-auto border-l z-50">
            <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>

            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.id} className="border-b pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}/{item.unit}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ×
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <span className="ml-auto font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(getTotalCost())}</span>
              </div>

              <Button className="w-full mb-2">
                Proceed to Checkout
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setCart([])}>
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
