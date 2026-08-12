import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import RankingQualityPanel from '@/components/admin/RankingQualityPanel'
import ExposureFairnessChart from '@/components/admin/ExposureFairnessChart'
import MetricsHonestyBanner from '@/components/admin/MetricsHonestyBanner'
import DateRangeSelector from '@/components/admin/DateRangeSelector'

export default async function AdminRecommendationsPage({ 
  searchParams 
}: { 
  searchParams: { days?: string } 
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const days = parseInt(searchParams.days || '30', 10)
  const to = new Date()
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000)
  const dateRange = { from, to }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <MetricsHonestyBanner />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Recommendations Dashboard</h1>
          <p className="text-muted-foreground">Monitor hybrid recommender quality and exposure fairness metrics.</p>
        </div>
        <DateRangeSelector />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <RankingQualityPanel dateRange={dateRange} />
        <Card>
          <CardHeader>
            <CardTitle>Exposure Fairness (Top-10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ExposureFairnessChart />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
