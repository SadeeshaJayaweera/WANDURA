import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import RankingQualityPanel from '@/components/admin/RankingQualityPanel'
import ExposureFairnessChart from '@/components/admin/ExposureFairnessChart'

export default async function AdminRecommendationsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Recommendations Dashboard</h1>
      <p className="text-muted-foreground">Monitor hybrid recommender quality and exposure fairness metrics.</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <RankingQualityPanel />
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
