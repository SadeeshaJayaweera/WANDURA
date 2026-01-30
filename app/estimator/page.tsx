'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Hammer, Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface EstimateItem {
  id: string
  name: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
}

export default function EstimatorPage() {
  const [items, setItems] = useState<EstimateItem[]>([])
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'bag',
    unitPrice: 0,
  })

  const addItem = () => {
    if (!newItem.name || newItem.unitPrice <= 0) return

    const item: EstimateItem = {
      id: Date.now().toString(),
      ...newItem,
      totalPrice: newItem.quantity * newItem.unitPrice,
    }

    setItems([...items, item])
    setNewItem({ name: '', quantity: 1, unit: 'bag', unitPrice: 0 })
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const totalCost = items.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Hammer className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Wandura</span>
          </Link>
          <Button asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Material Cost Estimator</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Item Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Material</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Material Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Portland Cement"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 1 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    placeholder="e.g., bag, ton, piece"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="price">Unit Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.unitPrice || ''}
                  onChange={(e) =>
                    setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <Button onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </CardContent>
          </Card>

          {/* Estimate Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Estimate Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No materials added yet
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between border-b pb-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {formatCurrency(item.totalPrice)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Estimated Cost:</span>
                      <span className="text-2xl text-primary">
                        {formatCurrency(totalCost)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button variant="outline" className="flex-1">
                      Save Estimate
                    </Button>
                    <Button className="flex-1">
                      Order Materials
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Common Materials Reference */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Common Construction Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: 'Portland Cement', unit: 'bag', price: 12.99 },
                { name: 'River Sand', unit: 'ton', price: 45.0 },
                { name: 'Gravel', unit: 'ton', price: 38.0 },
                { name: 'Concrete Blocks', unit: 'piece', price: 2.25 },
                { name: 'Ceramic Tiles', unit: 'box', price: 28.5 },
                { name: 'Steel Rebar #4', unit: 'piece', price: 8.75 },
              ].map((material) => (
                <div
                  key={material.name}
                  className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() =>
                    setNewItem({
                      name: material.name,
                      quantity: 1,
                      unit: material.unit,
                      unitPrice: material.price,
                    })
                  }
                >
                  <p className="font-medium">{material.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(material.price)}/{material.unit}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
