'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Hammer, Eye, EyeOff, ArrowRight, User, Briefcase, Store } from 'lucide-react'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const ROLES = [
  { value: 'CUSTOMER', label: 'Customer', desc: 'I need to hire workers', icon: User },
  { value: 'WORKER', label: 'Worker', desc: 'I want to find jobs', icon: Briefcase },
  { value: 'HARDWARE_STORE', label: 'Hardware Store', desc: 'I sell materials', icon: Store },
]

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password.length < 8) {
      toast({ title: 'Weak password', description: 'Password must be at least 8 characters.' })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to create account')

      toast({ title: 'Account created!', description: 'You can now sign in to your account.' })
      router.push('/auth/signin')
    } catch (error: any) {
      toast({ title: 'Error', description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = ROLES.find(r => r.value === formData.role)

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-blue-600 to-blue-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full border border-white" />
        </div>

        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Hammer className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Wandura</span>
        </Link>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Join 10,000+<br />skilled professionals.
          </h2>
          <p className="text-blue-200 leading-relaxed mb-10">
            Whether you&apos;re a customer looking for quality labor, a skilled worker seeking jobs,
            or a hardware store expanding your reach — Wandura is built for you.
          </p>

          <div className="space-y-3">
            {ROLES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-blue-200 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-sm relative z-10">© 2026 Wandura. All rights reserved.</p>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Top Toggles */}
          <div className="flex items-center justify-end gap-2 mb-6">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Hammer className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Wandura</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Create account</h1>
            <p className="text-gray-500">Get started — it&apos;s completely free.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">I am a…</Label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: value })}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                      formData.role === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-11 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 transition-colors pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password.length > 0 && formData.password.length < 8 && (
                <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm shadow-blue-200 transition-all"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>

            <p className="text-xs text-center text-gray-400">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
