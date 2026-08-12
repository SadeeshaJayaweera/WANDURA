"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function DateRangeSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const days = searchParams.get('days') || '30'

  const handlePeriodChange = (newDays: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('days', newDays)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={days === '7' ? 'default' : 'outline'}
        onClick={() => handlePeriodChange('7')}
      >
        7 Days
      </Button>
      <Button
        variant={days === '30' ? 'default' : 'outline'}
        onClick={() => handlePeriodChange('30')}
      >
        30 Days
      </Button>
      <Button
        variant={days === '90' ? 'default' : 'outline'}
        onClick={() => handlePeriodChange('90')}
      >
        90 Days
      </Button>
    </div>
  )
}
