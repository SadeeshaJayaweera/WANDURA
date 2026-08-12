"use client"

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { ExposureFairnessTier } from '@/lib/recommendation/analytics/exposureFairness'

export default function ExposureFairnessChart() {
  const [data, setData] = useState<ExposureFairnessTier[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/recommendation-metrics')
        if (response.ok) {
          const result = await response.json()
          
          // Recharts plays better with percentages mapped to 0-100 for display
          const formattedData = result.exposureFairness?.map((tier: any) => ({
            name: tier.tier,
            'Pool Share (%)': Number((tier.poolShare * 100).toFixed(1)),
            'Exposure Share (%)': Number((tier.recommendationShare * 100).toFixed(1)),
            'Fairness Ratio': tier.exposureRatio,
          })) || []
          
          setData(formattedData)
        }
      } catch (e) {
        console.error('Failed to load exposure fairness metrics', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading chart data...</div>
  }

  if (data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
  }

  return (
    <div className="space-y-6">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name.includes('Ratio') ? value.toFixed(2) : `${value}%`, 
                name
              ]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend />
            <Bar dataKey="Pool Share (%)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Exposure Share (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-muted p-4 rounded-lg text-sm">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          Fairness Ratio Analysis 
          <span className="text-xs font-normal text-muted-foreground">(Exposure Share ÷ Pool Share)</span>
        </h4>
        <div className="grid grid-cols-3 gap-4">
          {data.map(tier => (
            <div key={tier.name} className="space-y-1">
              <div className="text-xs text-muted-foreground">{tier.name}</div>
              <div className={`text-lg font-bold ${
                tier['Fairness Ratio'] < 0.8 ? 'text-orange-500' : 
                tier['Fairness Ratio'] > 1.2 ? 'text-green-500' : 'text-primary'
              }`}>
                {tier['Fairness Ratio'].toFixed(2)}x
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          * A ratio of 1.0x indicates perfect fairness. &lt;1.0x indicates under-exposure relative to group size.
        </p>
      </div>
    </div>
  )
}
