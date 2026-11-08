'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import {
  Hammer, Users, ArrowLeft, Loader2, ShieldCheck, MapPin,
  Phone, Mail, Briefcase, DollarSign, Clock, CheckCircle2,
  Calendar, Star, AlertCircle
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useLanguage } from '@/components/providers/LanguageProvider'

const SRI_LANKAN_CITIES = [
  'Colombo', 'Maharagama', 'Dehiwala', 'Mount Lavinia', 'Moratuwa',
  'Kandy', 'Peradeniya', 'Katugastota',
  'Galle', 'Hikkaduwa', 'Unawatuna',
  'Gampaha', 'Negombo', 'Kelaniya', 'Ja-Ela',
  'Kalutara', 'Panadura', 'Horana',
  'Kurunegala', 'Matara', 'Batticaloa', 'Jaffna',
]

const SKILL_OPTIONS = [
  { value: 'MASON', label: 'Mason (මේසන් බාස්)' },
  { value: 'CARPENTER', label: 'Carpenter (වඩු බාස්)' },
  { value: 'WELDER', label: 'Welder (වෙල්ඩින් කාර්මික)' },
  { value: 'TILE_LAYER', label: 'Tile Layer (ටයිල් බාස්)' },
  { value: 'PLUMBER', label: 'Plumber (නල කාර්මික)' },
  { value: 'ELECTRICIAN', label: 'Electrician (විදුලි කාර්මික)' },
  { value: 'STEEL_FIXER', label: 'Steel Fixer (යකඩ බාස්)' },
  { value: 'PAINTER', label: 'Painter (තීන්ත ආලේපක)' },
]

export default function WorkerProfileSettingsPage() {
  const { data: session, status } = useSession()
  const { t, isSinhala } = useLanguage()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workerData, setWorkerData] = useState<any>(null)

  // Form states
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [skill, setSkill] = useState('MASON')
  const [dailyRate, setDailyRate] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [experience, setExperience] = useState('')
  const [city, setCity] = useState('Colombo')
  const [bio, setBio] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchWorkerProfile()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchWorkerProfile = async () => {
    setLoading(true)
    try {
      if (!session?.user?.id) return
      const res = await fetch(`/api/workers/${session.user.id}`)
      if (res.ok) {
        const data = await res.json()
        const w = data.worker
        setWorkerData(w)
        setName(w?.user?.name || session.user.name || '')
        setPhone(w?.user?.phone || '')
        setSkill(w?.skill || 'MASON')
        setDailyRate(String(w?.dailyRate || '5500'))
        setHourlyRate(String(w?.hourlyRate || '700'))
        setExperience(String(w?.experience || '5'))
        setCity(w?.city || 'Colombo')
        setBio(w?.bio || '')
        setIsAvailable(w?.isAvailable ?? true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setSaving(true)
    try {
      const res = await fetch(`/api/workers/${session.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          skill,
          dailyRate: parseFloat(dailyRate),
          hourlyRate: parseFloat(hourlyRate),
          experience: parseInt(experience, 10),
          city,
          bio,
          isAvailable,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile')

      toast({
        title: isSinhala ? 'පැතිකඩ යාවත්කාලීන විය!' : 'Profile Updated Successfully!',
        description: 'Your rates, trade skills, and availability are now live for customers across Sri Lanka.',
      })
      fetchWorkerProfile()
    } catch (err: any) {
      toast({ title: 'Error', description: err.message })
    } finally {
      setSaving(false)
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
                <Users className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold tracking-tight text-gray-900 dark:text-white">
                {isSinhala ? 'ශිල්පී පැතිකඩ සැකසුම්' : 'Worker Profile & Trade Settings'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isSinhala ? 'ශිල්පී පැතිකඩ කළමනාකරණය' : 'Manage Your Trade Profile'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update your daily wage, years of experience, trade specialty, and site availability for Sri Lankan clients.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-3" />
            <p className="text-sm text-gray-500">Loading profile...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Card */}
            <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 dark:text-white">{name || 'Worker'}</p>
                      {workerData?.isVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border border-green-200 dark:border-green-800">
                          <ShieldCheck className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Rating: ★ {workerData?.rating?.toFixed(1) || '5.0'} ({workerData?.totalReviews || 0} reviews) • {workerData?.totalJobs || 0} jobs completed
                    </p>
                  </div>
                </div>

                {/* Availability Toggle Button */}
                <Button
                  type="button"
                  variant={isAvailable ? 'default' : 'outline'}
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`text-xs h-9 px-4 rounded-xl font-semibold transition-all ${
                    isAvailable
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'border-amber-300 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  {isAvailable ? '● Available for Work' : '○ Currently Booked / Busy'}
                </Button>
              </CardContent>
            </Card>

            {/* Profile Fields */}
            <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="border-b border-gray-100 dark:border-slate-800 pb-4">
                <CardTitle className="text-base font-semibold">Personal & Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name (English / Sinhala)</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Contact Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      placeholder="+94 77 123 4567"
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city">Base City / Town</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger className="rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SRI_LANKAN_CITIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Trade & Rate Settings */}
            <Card className="bg-white dark:bg-[#0c1222] border-gray-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="border-b border-gray-100 dark:border-slate-800 pb-4">
                <CardTitle className="text-base font-semibold">Trade Specialty & Rates (LKR)</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="skill">Primary Trade</Label>
                    <Select value={skill} onValueChange={setSkill}>
                      <SelectTrigger className="rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SKILL_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="dailyRate">Daily Wage Rate (Rs. / 8-hr day)</Label>
                    <Input
                      id="dailyRate"
                      type="number"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(e.target.value)}
                      className="rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="hourlyRate">Hourly Overtime Rate (Rs. / hr)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio">Professional Bio & Service Description</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your trade experience, site equipment, specialties..."
                    className="rounded-xl border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-semibold shadow-sm"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </span>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
