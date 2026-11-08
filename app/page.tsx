import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Hammer,
  Search,
  Calendar,
  CreditCard,
  Star,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
  MapPin,
  Clock,
} from 'lucide-react'

const SKILLS = [
  { name: 'Mason', emoji: '🧱', desc: 'Brickwork & Stonework' },
  { name: 'Welder', emoji: '⚙️', desc: 'Metal Fabrication' },
  { name: 'Carpenter', emoji: '🪵', desc: 'Wood & Framing' },
  { name: 'Tile Layer', emoji: '🏠', desc: 'Tiles & Flooring' },
  { name: 'Plumber', emoji: '🔧', desc: 'Pipes & Fixtures' },
  { name: 'Electrician', emoji: '⚡', desc: 'Wiring & Panels' },
  { name: 'Steel Fixer', emoji: '🏗️', desc: 'Rebar & Structural' },
  { name: 'Painter', emoji: '🎨', desc: 'Interior & Exterior' },
]

const STEPS = [
  {
    icon: Search,
    title: 'Search Workers',
    desc: 'Browse verified professionals by skill, location, and rating.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Calendar,
    title: 'Book & Schedule',
    desc: 'Pick dates, review rates, and confirm your booking in minutes.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    desc: 'Pay confidently via Stripe with escrow protection.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Star,
    title: 'Rate & Review',
    desc: 'Share feedback to help the community make better decisions.',
    color: 'bg-amber-50 text-amber-600',
  },
]

const STATS = [
  { value: '10,000+', label: 'Skilled Workers' },
  { value: '95%', label: 'Job Satisfaction' },
  { value: '24hr', label: 'Average Response' },
  { value: '500+', label: 'Cities Covered' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ── Navigation ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <Hammer className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Wandura</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/workers', label: 'Find Workers' },
              { href: '/stores', label: 'Hardware Stores' },
              { href: '/estimator', label: 'Cost Estimator' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-24">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-50/80 to-transparent rounded-b-full" />
          <div className="absolute top-20 right-20 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-56 h-56 bg-violet-100/30 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-blue-100">
            <Zap className="h-3.5 w-3.5" />
            Skilled Labor, Instantly Available
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight text-balance">
            Find Skilled Workers{' '}
            <span className="text-blue-600">On-Demand</span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with verified masons, welders, carpenters, and more.
            Book by the hour or day — transparent pricing, guaranteed quality.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 shadow-sm shadow-blue-200 font-medium"
            >
              <Link href="/workers">
                <Search className="mr-2 h-4 w-4" />
                Find Workers Near Me
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-xl h-12 px-8 border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
            >
              <Link href="/auth/signup?role=WORKER">
                Become a Worker
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-500">
            {[
              { icon: ShieldCheck, label: 'Verified Workers' },
              { icon: Clock, label: 'Book in Minutes' },
              { icon: MapPin, label: '500+ Cities' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-blue-500" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-gray-100 bg-gray-50/50 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">How Wandura Works</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              From search to job completion — everything managed in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((step, index) => (
              <div key={step.title} className="relative">
                {index < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%-24px)] w-12 border-t-2 border-dashed border-gray-200 z-0" />
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 relative z-10">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${step.color}`}>
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-bold text-gray-400 mb-1">STEP {index + 1}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Skills ── */}
      <section className="py-24 bg-gray-50/60">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">Skilled Trades</p>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Available Specializations</h2>
            <p className="text-gray-500 mt-3">Verified professionals across all major construction trades.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {SKILLS.map((skill) => (
              <Link
                key={skill.name}
                href={`/workers?skill=${skill.name.toUpperCase().replace(' ', '_')}`}
                className="group bg-white border border-gray-100 rounded-2xl p-5 text-center hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="text-3xl mb-3">{skill.emoji}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                  {skill.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{skill.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Wandura ── */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-4">Why Choose Us</p>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-6">
                Built for quality,<br />designed for speed
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Wandura isn't just a job board. We're a full platform for managing construction labor —
                from smart recommendations to project tracking and secure payments.
              </p>
              <ul className="space-y-4">
                {[
                  'AI-powered worker recommendations tailored to your project',
                  'Real-time booking and scheduling calendar',
                  'Escrow payments with Stripe — pay only when satisfied',
                  'Project management with task tracking and material lists',
                  'Verified worker profiles with ratings and reviews',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                asChild
                className="mt-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
              >
                <Link href="/auth/signup">Start for Free</Link>
              </Button>
            </div>

            {/* Visual placeholder */}
            <div className="relative hidden lg:block">
              <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-3xl p-8 border border-blue-100">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">JK</div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">James Kamau</p>
                      <p className="text-xs text-gray-400">Certified Mason · 8 yrs exp</p>
                    </div>
                    <span className="ml-auto text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-semibold">Available</span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                    <span className="text-xs text-gray-500 ml-1">4.9 (142 reviews)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Daily Rate</span>
                    <span className="font-bold text-blue-600">$180/day</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-900">Booking Confirmed</p>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex justify-between"><span>Duration</span><span className="font-medium text-gray-700">3 days</span></div>
                    <div className="flex justify-between"><span>Total</span><span className="font-bold text-blue-600">$540</span></div>
                    <div className="flex justify-between"><span>Payment</span><span className="text-green-600 font-medium">Secured via Stripe</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-2xl mb-6">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 mb-10 max-w-lg mx-auto text-lg">
            Join thousands of customers and skilled workers building better projects together.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-white text-blue-600 hover:bg-blue-50 rounded-xl h-12 px-8 font-semibold"
            >
              <Link href="/auth/signup">Create Free Account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/30 text-white hover:bg-white/10 rounded-xl h-12 px-8"
            >
              <Link href="/workers">Browse Workers</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-10 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                <Hammer className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-gray-900">Wandura</span>
            </Link>
            <nav className="flex gap-6 text-sm text-gray-500">
              {['Find Workers', 'Hardware Stores', 'Cost Estimator', 'Sign In'].map((item) => (
                <span key={item} className="hover:text-gray-900 cursor-pointer transition-colors">{item}</span>
              ))}
            </nav>
            <p className="text-sm text-gray-400">© 2026 Wandura. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
