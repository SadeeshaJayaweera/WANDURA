'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import {
  Hammer, Wallet, ArrowLeft, Loader2, DollarSign, TrendingUp,
  Building2, Calendar, ShieldCheck, ArrowUpRight, ArrowDownLeft,
  CheckCircle2, Clock, AlertCircle, RefreshCw
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useLanguage } from '@/components/providers/LanguageProvider'

const SRI_LANKA_BANKS = [
  'Commercial Bank of Ceylon',
  'Bank of Ceylon (BOC)',
  'People\'s Bank',
  'Hatton National Bank (HNB)',
  'Sampath Bank',
  'Nations Trust Bank (NTB)',
  'Seylan Bank',
  'DFCC Bank',
  'National Development Bank (NDB)',
]

export default function WorkerEarningsPage() {
  const { data: session, status } = useSession()
  const { t, isSinhala } = useLanguage()

  const [loading, setLoading] = useState(true)
  const [workerData, setWorkerData] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false)

  // Withdraw form state
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bankName, setBankName] = useState(SRI_LANKA_BANKS[0])
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [branch, setBranch] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEarningsData()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchEarningsData = async () => {
    setLoading(true)
    try {
      if (!session?.user?.id) return
      const res = await fetch(`/api/workers/${session.user.id}`)
      if (res.ok) {
        const data = await res.json()
        setWorkerData(data.worker)
        if (session.user.name) {
          setAccountHolder(session.user.name)
        }
      }

      // Fetch bookings to display earnings trail
      const bookingsRes = await fetch('/api/bookings')
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setTransactions(Array.isArray(bookingsData) ? bookingsData : [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(withdrawAmount)

    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid withdrawal amount.' })
      return
    }

    if (amountNum > (workerData?.walletBalance || 0)) {
      toast({ title: 'Insufficient Balance', description: 'You cannot withdraw more than your available wallet balance.' })
      return
    }

    if (!accountNumber.trim()) {
      toast({ title: 'Account Number Required', description: 'Please enter your bank account number.' })
      return
    }

    setSubmittingWithdraw(true)
    try {
      const res = await fetch('/api/workers/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountNum,
          bankName,
          accountNumber,
          accountHolder,
          branch,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Withdrawal failed')

      toast({
        title: isSinhala ? 'මුදල් ලබාගැනීම සාර්ථකයි!' : 'Withdrawal Approved!',
        description: `Rs. ${amountNum.toLocaleString()} credited to ${bankName} account ending in ${accountNumber.slice(-4)}.`,
      })

      setWorkerData((prev: any) => ({
        ...prev,
        walletBalance: data.walletBalance,
      }))
      setWithdrawAmount('')
      setShowWithdrawModal(false)
    } catch (err: any) {
      toast({ title: 'Withdrawal Failed', description: err.message })
    } finally {
      setSubmittingWithdraw(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070b14] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c1222]/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
            <div className="h-4 w-px bg-gray-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold tracking-tight text-gray-900 dark:text-white">
                {isSinhala ? 'ඉපැයීම් සහ පසුම්බිය' : 'Worker Earnings & Wallet'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {isSinhala ? 'ශිල්පී පසුම්බිය සහ ගෙවීම්' : 'Earnings, Commission & Payouts'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Transparent daily wage earnings, platform 10% commission deductions, and direct bank withdrawals in LKR.
            </p>
          </div>

          <Button
            onClick={() => setShowWithdrawModal(true)}
            disabled={!workerData || workerData.walletBalance <= 0}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm font-semibold"
          >
            <ArrowUpRight className="h-4 w-4 mr-1.5" />
            {isSinhala ? 'මුදල් ලබාගන්න (Payout)' : 'Request Bank Payout'}
          </Button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-3" />
            <p className="text-sm text-gray-500">Loading wallet balance...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Wallet Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-md col-span-2 sm:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
                    Available Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold tracking-tight">
                    Rs. {(workerData?.walletBalance || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-blue-100 mt-1">Ready for bank transfer</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    Lifetime Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    Rs. {(workerData?.totalEarnings || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    {workerData?.totalJobs || 0} completed jobs
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    Daily Wage Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    Rs. {(workerData?.dailyRate || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Per day (8 hours)</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    Client Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-500">
                    ★ {workerData?.rating?.toFixed(1) || '5.0'}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{workerData?.totalReviews || 0} reviews</p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Commission Info Banner */}
            <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl p-5 flex items-start gap-3.5">
              <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <p className="font-semibold text-sm">
                  {isSinhala ? 'ශ්‍රී ලංකා විනිවිදභාවය: 90% ශිල්පී ගෙවීම් ආකෘතිය' : 'Sri Lanka Fair Pricing Model: 90% Worker Payout'}
                </p>
                <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                  You keep 90% of all client job bookings. Wandura deducts a transparent 10% platform service fee to cover client guarantee insurance, customer matching, and site dispute mediation.
                </p>
              </div>
            </div>

            {/* Completed Bookings & Payouts Breakdown */}
            <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-gray-100 dark:border-slate-800 pb-4">
                <CardTitle className="text-base font-semibold">Job Earnings History</CardTitle>
                <CardDescription>Breakdown of client bookings, gross fees, and platform payouts</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {transactions.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-400">
                    No completed jobs yet. Bookings from clients will appear here.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-slate-800">
                    {transactions.map((booking: any) => {
                      const gross = booking.totalAmount || 0
                      const commission = Math.round(gross * 0.1)
                      const net = gross - commission

                      return (
                        <div key={booking.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-slate-900/40 transition-colors">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                {booking.customer?.name || 'Client Booking'}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                {booking.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                              {booking.siteCity || 'Western Province'} • {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-6 text-right">
                            <div>
                              <p className="text-[11px] text-gray-400 uppercase">Gross Booking</p>
                              <p className="text-xs font-medium text-gray-600 dark:text-slate-300">Rs. {gross.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-gray-400 uppercase">Fee (10%)</p>
                              <p className="text-xs font-medium text-red-500">-Rs. {commission.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[11px] text-gray-400 uppercase">Net Credited</p>
                              <p className="text-sm font-bold text-green-600 dark:text-green-400">Rs. {net.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Withdrawal Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95">
              <CardHeader className="border-b border-gray-100 dark:border-slate-800 pb-4">
                <CardTitle className="text-lg font-bold">Transfer to Sri Lankan Bank</CardTitle>
                <CardDescription>
                  Available Balance: <strong className="text-blue-600 dark:text-blue-400">Rs. {(workerData?.walletBalance || 0).toLocaleString()}</strong>
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleWithdrawalSubmit}>
                <CardContent className="p-5 space-y-4 text-sm">
                  <div className="space-y-1.5">
                    <Label htmlFor="bank">Select Sri Lankan Bank</Label>
                    <Select value={bankName} onValueChange={setBankName}>
                      <SelectTrigger className="rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SRI_LANKA_BANKS.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="branch">Branch Name</Label>
                    <Input
                      id="branch"
                      placeholder="e.g. Maharagama, Kandy, Galle Fort"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="accNo">Account Number</Label>
                    <Input
                      id="accNo"
                      placeholder="e.g. 1002938475"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="holder">Account Holder Name</Label>
                    <Input
                      id="holder"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <Label htmlFor="amount">Withdrawal Amount (Rs.)</Label>
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(String(workerData?.walletBalance || 0))}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Max (Rs. {(workerData?.walletBalance || 0).toLocaleString()})
                      </button>
                    </div>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="e.g. 25000"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
                      required
                    />
                  </div>
                </CardContent>

                <div className="p-5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-gray-50/50 dark:bg-slate-900/50">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowWithdrawModal(false)}
                    disabled={submittingWithdraw}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingWithdraw}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                  >
                    {submittingWithdraw ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      'Confirm Bank Transfer'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
