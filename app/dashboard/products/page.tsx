'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import {
  Hammer,
  Package,
  Plus,
  Store,
  ArrowLeft,
  Loader2,
  Lock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Image as ImageIcon,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const PRESET_IMAGES: Record<string, string> = {
  'Cement & Concrete': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
  'Sand & Aggregate': 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800&auto=format&fit=crop&q=80',
  'Blocks & Bricks': 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=800&auto=format&fit=crop&q=80',
  'Steel & Metal': 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=800&auto=format&fit=crop&q=80',
  'Tiles': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
  'Welding Supplies': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop&q=80',
  'Plumbing & Pipes': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&auto=format&fit=crop&q=80',
  'Paint & Finishes': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
}

export default function StoreProductsDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Cement & Concrete')
  const [unit, setUnit] = useState('bag')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMyProducts()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchMyProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user || session.user.role !== 'HARDWARE_STORE') {
      toast({
        title: 'Hardware store account required',
        description: 'You must be signed in with a store seller account to list products.',
      })
      return
    }

    setIsSubmitting(true)

    const finalImage = imageUrl.trim() || PRESET_IMAGES[category] || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80'

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          unit,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          images: [finalImage],
          description,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to list product')
      }

      toast({
        title: 'Listing Created! (ද්‍රව්‍ය ලැයිස්තුගත කළා)',
        description: `${name} is now visible to customers across Sri Lanka.`,
      })

      // Reset form
      setName('')
      setPrice('')
      setStock('')
      setImageUrl('')
      setDescription('')
      setShowAddForm(false)

      // Refresh listings
      fetchMyProducts()
    } catch (err: any) {
      toast({
        title: 'Error creating listing',
        description: err.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auth Guard: Unauthenticated
  if (status === 'unauthenticated' || !session?.user) {
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
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Sign In Required to Add Listings
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              To list materials, set LKR prices, and receive customer orders, please sign in or register your hardware store.
            </p>
            <div className="space-y-3">
              <Button
                asChild
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm"
              >
                <Link href="/auth/signup?role=HARDWARE_STORE">
                  Register Hardware Store (නොමිලේ ලියාපදිංචි වන්න)
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full h-11 rounded-xl border-gray-200 text-gray-700 font-medium"
              >
                <Link href="/auth/signin?callbackUrl=/dashboard/products">
                  Sign In to Existing Account
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Auth Guard: Non-hardware store role
  if (session.user.role !== 'HARDWARE_STORE' && session.user.role !== 'ADMIN') {
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
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
            <AlertCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Hardware Store Account Needed
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              You are currently signed in as a <strong>{session.user.role}</strong>. Only verified Hardware Store accounts can add and manage material listings.
            </p>
            <div className="space-y-3">
              <Button
                asChild
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm"
              >
                <Link href="/auth/signup?role=HARDWARE_STORE">
                  Create Hardware Store Seller Account
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-11 rounded-xl">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 mr-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Hammer className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Wandura</span>
          </Link>
          <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-100">
            Store Seller Hub (හාඩ්වෙයාර් පාලක මැදිරිය)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="rounded-xl border-gray-200 text-xs">
            <Link href="/dashboard">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Dashboard
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-xs">
            <Link href="/stores">Public Storefront</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 flex-1 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Hardware Material Listings (ද්‍රව්‍ය ලැයිස්තු)
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your construction supplies, update stock levels, and set Sri Lankan Rupee (LKR) pricing.
            </p>
          </div>

          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold gap-2 shadow-sm self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>{showAddForm ? 'Cancel Listing' : '+ Add New Material (නව ද්‍රව්‍යයක්)'}</span>
          </Button>
        </div>

        {/* Add Product Form Drawer / Card */}
        {showAddForm && (
          <div className="bg-white rounded-3xl border border-blue-100 shadow-md p-6 md:p-8 mb-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  New Material Listing Details (නව ද්‍රව්‍ය විස්තර)
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Published immediately to all customers searching for materials in your city.
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="p-name" className="text-xs font-semibold text-gray-700">
                    Product / Material Name (ද්‍රව්‍යයේ නම) *
                  </Label>
                  <Input
                    id="p-name"
                    placeholder="e.g. Tokyo Super Portland Cement 50kg, River Sand 1 Cube"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 rounded-xl border-gray-200 bg-gray-50 mt-1.5 text-sm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="p-cat" className="text-xs font-semibold text-gray-700">
                    Category (වර්ගීකරණය) *
                  </Label>
                  <Select value={category} onValueChange={(val) => {
                    setCategory(val)
                    if (!imageUrl && PRESET_IMAGES[val]) {
                      setImageUrl(PRESET_IMAGES[val])
                    }
                  }}>
                    <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-gray-50 mt-1.5 text-sm">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(PRESET_IMAGES).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="p-price" className="text-xs font-semibold text-gray-700">
                    Price in LKR (රුපියල්) *
                  </Label>
                  <Input
                    id="p-price"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 2450"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-11 rounded-xl border-gray-200 bg-gray-50 mt-1.5 text-sm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="p-unit" className="text-xs font-semibold text-gray-700">
                    Unit (මිණුම) *
                  </Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-gray-50 mt-1.5 text-sm">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bag">bag (කොට්ටය)</SelectItem>
                      <SelectItem value="cube">cube (කියුබ් 1)</SelectItem>
                      <SelectItem value="piece">piece (කෑල්ල / තනි බටය)</SelectItem>
                      <SelectItem value="box">box (පෙට්ටිය)</SelectItem>
                      <SelectItem value="pack">pack (පැකට්ටුව)</SelectItem>
                      <SelectItem value="bucket">bucket (බාල්දිය)</SelectItem>
                      <SelectItem value="kg">kg (කිලෝග්‍රෑම්)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="p-stock" className="text-xs font-semibold text-gray-700">
                    Stock Quantity (තොග ප්‍රමාණය) *
                  </Label>
                  <Input
                    id="p-stock"
                    type="number"
                    placeholder="e.g. 350"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="h-11 rounded-xl border-gray-200 bg-gray-50 mt-1.5 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="p-img" className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                  <span>Product Image URL (පින්තූර සබැඳිය)</span>
                  <span className="text-[11px] text-gray-400 font-normal">Auto-selected from high quality catalog if empty</span>
                </Label>
                <div className="flex gap-3 mt-1.5">
                  <Input
                    id="p-img"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="h-11 rounded-xl border-gray-200 bg-gray-50 text-sm flex-1"
                  />
                  {imageUrl && (
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="p-desc" className="text-xs font-semibold text-gray-700">
                  Description & Specifications (විස්තරය)
                </Label>
                <Textarea
                  id="p-desc"
                  placeholder="e.g. SLS 107 certified Portland limestone cement for structural concrete, columns, and slabs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="rounded-xl border-gray-200 bg-gray-50 mt-1.5 text-sm resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold px-6 shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </span>
                  ) : (
                    <span>Publish Material Listing (ලැයිස්තුගත කරන්න)</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Products List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Active Store Inventory ({products.length} materials)
            </h2>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-xs">Loading material catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center max-w-md mx-auto">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900 mb-1">No Material Listings Yet</h3>
              <p className="text-xs text-gray-400 mb-6">
                Add your first building material to make it available for local builders and contractors.
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs"
              >
                + Add First Material
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((item) => {
                const img =
                  item.images?.[0] ||
                  'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80'

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
                        <img src={img} alt={item.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2">
                          <span className="text-[10px] font-semibold bg-white/90 backdrop-blur-sm text-blue-700 px-2 py-0.5 rounded-full shadow-sm">
                            {item.category}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="text-[10px] font-semibold bg-green-600 text-white px-2 py-0.5 rounded-full shadow-sm">
                            {item.stock} {item.unit} in stock
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {item.description || 'Quality construction material.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-base font-extrabold text-blue-600">
                            {formatCurrency(item.price)}
                          </span>
                          <span className="text-[11px] text-gray-400 ml-1">/ {item.unit}</span>
                        </div>

                        <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
