'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { toast } from '@/components/ui/use-toast'
import {
  Hammer,
  Plus,
  Trash2,
  Calculator,
  Printer,
  Save,
  Package,
  ChevronRight,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface EstimateItem {
  id: string
  name: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
}

const COMMON_MATERIALS = [
  { en: 'Tokyo Super Cement 50kg', si: 'ටෝකියෝ සුපර් සිමෙන්ති 50kg', unit: 'bag', price: 2450 },
  { en: 'Clean River Sand (1 Cube)', si: 'නදී වැලි (කියුබ් 1)', unit: 'cube', price: 22000 },
  { en: '3/4 in Blue Metal (1 Cube)', si: '3/4 කළුගල් (කියුබ් 1)', unit: 'cube', price: 16500 },
  { en: 'Clay Wire-Cut Bricks', si: 'රතු ගඩොල්', unit: 'piece', price: 34 },
  { en: 'Solid Cement Blocks', si: 'සිමෙන්ති බ්ලොක් ගල්', unit: 'piece', price: 95 },
  { en: 'Lanwa Steel Rebar 10mm (20ft)', si: 'ලංවා වානේ කම්බි 10mm', unit: 'piece', price: 1850 },
  { en: 'Rocell Ceramic Tiles (Box)', si: 'රොසෙල් ටයිල් පෙට්ටිය', unit: 'box', price: 6800 },
  { en: 'Timber Rafters 2x4x10', si: 'වහල දැව (අඩි 10)', unit: 'piece', price: 2200 },
  { en: 'Tile Adhesive Mortar 25kg', si: 'ටයිල් මෝටාර් 25kg', unit: 'bag', price: 1650 },
]

export default function EstimatorPage() {
  const { t, isSinhala } = useLanguage()
  const [items, setItems] = useState<EstimateItem[]>([])
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'bag',
    unitPrice: 0,
  })
  const [estimateName, setEstimateName] = useState('')
  const [saving, setSaving] = useState(false)

  const addItem = () => {
    if (!newItem.name.trim() || newItem.unitPrice <= 0) {
      toast({
        title: isSinhala ? 'අසම්පූර්ණ තොරතුරු' : 'Incomplete item',
        description: isSinhala
          ? 'කරුණාකර ද්‍රව්‍යයේ නම සහ වලංගු මිලක් ඇතුළත් කරන්න.'
          : 'Please enter a valid material name and price.',
      })
      return
    }

    const item: EstimateItem = {
      id: Date.now().toString(),
      name: newItem.name.trim(),
      quantity: newItem.quantity,
      unit: newItem.unit,
      unitPrice: newItem.unitPrice,
      totalPrice: newItem.quantity * newItem.unitPrice,
    }

    setItems([...items, item])
    setNewItem({ name: '', quantity: 1, unit: 'bag', unitPrice: 0 })
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const totalCost = items.reduce((sum, item) => sum + item.totalPrice, 0)

  const saveEstimate = async () => {
    if (items.length === 0) {
      toast({
        title: isSinhala ? 'හිස් ඇස්තමේන්තුව' : 'Empty estimate',
        description: isSinhala
          ? 'සුරැකීමට අවම වශයෙන් එක් ද්‍රව්‍යයක් හෝ එක්කරන්න.'
          : 'Please add at least one material to save.',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: estimateName || `Estimate ${new Date().toLocaleDateString()}`,
          items: items,
          totalCost: totalCost,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save estimate')
      }

      toast({
        title: isSinhala ? 'ඇස්තමේන්තුව සුරැකිණි!' : 'Estimate saved!',
        description: isSinhala
          ? 'ඔබේ ඉදිකිරීම් වියදම් ගණනය සාර්ථකව සුරැකිණි.'
          : 'Your project cost calculation has been saved.',
      })
    } catch {
      toast({
        title: isSinhala ? 'සුරැකීම අසාර්ථකයි' : 'Save failed',
        description: isSinhala
          ? 'ඇස්තමේන්තුව සුරැකිය නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.'
          : 'Could not save estimate. Please sign in or try again.',
      })
    } finally {
      setSaving(false)
    }
  }

  const exportToPDF = () => {
    if (items.length === 0) {
      toast({
        title: isSinhala ? 'හිස් ඇස්තමේන්තුව' : 'Empty estimate',
        description: isSinhala
          ? 'මුද්‍රණයට පෙර අවම වශයෙන් එක් ද්‍රව්‍යයක් හෝ එක්කරන්න.'
          : 'Please add at least one material to export.',
      })
      return
    }

    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Material Cost Estimate - Wandura Sri Lanka</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111827; }
            h1 { font-size: 24px; font-weight: bold; border-bottom: 2px solid #2563EB; padding-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th { background-color: #F3F4F6; text-align: left; padding: 10px 12px; font-size: 13px; text-transform: uppercase; color: #4B5563; }
            td { border-bottom: 1px solid #E5E7EB; padding: 12px; font-size: 14px; }
            .total-row { font-size: 18px; font-weight: bold; margin-top: 24px; text-align: right; }
            .footer { margin-top: 48px; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 16px; }
          </style>
        </head>
        <body>
          <h1>Wandura &mdash; Material Cost Estimate (Sri Lanka)</h1>
          <p><strong>Project:</strong> ${estimateName || 'General Project Estimate'}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Currency:</strong> Sri Lankan Rupees (LKR / Rs.)</p>
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item) => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td>${item.quantity}</td>
                  <td>${item.unit}</td>
                  <td>Rs. ${item.unitPrice.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                  <td>Rs. ${item.totalPrice.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <div class="total-row">
            Total Estimated Cost: <span style="color: #2563EB;">Rs. ${totalCost.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="footer">
            Generated by Wandura &bull; Sri Lanka's Skilled Labor & Construction Materials Marketplace
          </div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const clearAll = () => {
    setItems([])
    setEstimateName('')
    toast({
      title: isSinhala ? 'හිස් කරන ලදී' : 'Cleared',
      description: isSinhala
        ? 'සියලුම ද්‍රව්‍ය ගණකයෙන් ඉවත් කරන ලදී.'
        : 'All materials have been removed from the estimator.',
    })
  }

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
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-100 hidden sm:inline-block">
              {t('countryTag')}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button variant="ghost" size="sm" asChild className="text-gray-600">
              <Link href="/dashboard">{t('nav.dashboard')}</Link>
            </Button>
            <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              <Link href="/stores">{t('nav.stores')}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 flex-1 max-w-6xl">
        {/* Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:text-blue-600">{t('nav.home')}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-900">{t('estimator.title')}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {t('estimator.title')}
              </h1>
              <p className="text-gray-500 mt-1">
                {t('estimator.subtitle')}
              </p>
            </div>
            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="self-start md:self-auto rounded-xl gap-2 text-gray-500 hover:text-red-600"
              >
                <RotateCcw className="h-4 w-4" /> {t('estimator.reset')}
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Form & Presets */}
          <div className="lg:col-span-7 space-y-6">
            {/* Add Material Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                {t('estimator.addItem')}
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="mat-name" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t('estimator.matName')}
                  </Label>
                  <Input
                    id="mat-name"
                    placeholder={t('estimator.matPlaceholder')}
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="h-11 rounded-xl border-gray-200 bg-gray-50 mt-1.5 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="mat-qty" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('estimator.quantity')}
                    </Label>
                    <Input
                      id="mat-qty"
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 1 })
                      }
                      className="h-11 rounded-xl border-gray-200 bg-gray-50 mt-1.5 focus:bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mat-unit" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('estimator.unit')}
                    </Label>
                    <Input
                      id="mat-unit"
                      placeholder="bag, cube, pc"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      className="h-11 rounded-xl border-gray-200 bg-gray-50 mt-1.5 focus:bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mat-price" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t('estimator.unitPrice')}
                    </Label>
                    <Input
                      id="mat-price"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0.00"
                      value={newItem.unitPrice || ''}
                      onChange={(e) =>
                        setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })
                      }
                      className="h-11 rounded-xl border-gray-200 bg-gray-50 mt-1.5 focus:bg-white"
                    />
                  </div>
                </div>

                <Button
                  onClick={addItem}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm gap-2"
                >
                  <Plus className="h-4 w-4" /> {t('estimator.addBtn')}
                </Button>
              </div>
            </div>

            {/* Quick Presets Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {t('estimator.presets')}
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                {t('estimator.presetsDesc')}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {COMMON_MATERIALS.map((mat) => {
                  const label = isSinhala ? mat.si : mat.en
                  return (
                    <button
                      key={mat.en}
                      onClick={() =>
                        setNewItem({
                          name: label,
                          quantity: 1,
                          unit: mat.unit,
                          unitPrice: mat.price,
                        })
                      }
                      className="text-left p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all duration-150 group"
                    >
                      <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-700 truncate">
                        {label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatCurrency(mat.price)} / {mat.unit}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">{t('estimator.summary')}</h2>
                <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="mb-4">
                <Label htmlFor="est-name" className="text-xs font-semibold text-gray-600">
                  {t('estimator.projectTitle')}
                </Label>
                <Input
                  id="est-name"
                  placeholder={t('estimator.projectPlaceholder')}
                  value={estimateName}
                  onChange={(e) => setEstimateName(e.target.value)}
                  className="h-10 rounded-xl border-gray-200 bg-gray-50 mt-1 text-sm"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto mb-6 pr-1">
                {items.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium text-gray-600">{t('estimator.noItems')}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('estimator.noItemsDesc')}</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          {item.quantity} {item.unit} &times; {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(item.totalPrice)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total & Actions */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-gray-600">{t('estimator.total')}:</span>
                  <span className="text-3xl font-extrabold text-blue-600">
                    {formatCurrency(totalCost)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={saveEstimate}
                    disabled={items.length === 0 || saving}
                    variant="outline"
                    className="rounded-xl gap-2 text-sm font-medium"
                  >
                    <Save className="h-4 w-4" /> {t('estimator.saveDraft')}
                  </Button>
                  <Button
                    onClick={exportToPDF}
                    disabled={items.length === 0}
                    variant="outline"
                    className="rounded-xl gap-2 text-sm font-medium"
                  >
                    <Printer className="h-4 w-4" /> {t('estimator.exportPDF')}
                  </Button>
                </div>

                <Button
                  asChild
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm gap-2"
                >
                  <Link href="/stores">
                    <span>{t('estimator.orderMaterials')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
