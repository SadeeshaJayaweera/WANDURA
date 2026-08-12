"use client"

import { useState } from 'react'
import { Info, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function MetricsHonestyBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <Alert className="mb-6 bg-blue-50/50 border-blue-200 text-blue-800 flex items-start">
      <Info className="h-4 w-4 mt-1 flex-shrink-0 text-blue-600" />
      <div className="flex-1 ml-3">
        <AlertDescription className="text-sm pr-6 leading-relaxed">
          <span className="font-semibold block mb-1">Live Behavioral Proxies vs Offline Evaluation</span>
          These are live behavioral proxies (booked-rank position, exposure ratio), not the offline Precision/Recall/NDCG reported in the paper&apos;s synthetic evaluation, which used a graded ground truth this dashboard does not have access to.
        </AlertDescription>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 -mr-2 -mt-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100/50"
        onClick={() => setVisible(false)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </Alert>
  )
}
