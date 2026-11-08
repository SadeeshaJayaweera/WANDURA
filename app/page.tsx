'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import { useLanguage } from '@/components/providers/LanguageProvider'
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
  Compass,
} from 'lucide-react'

const SKILLS_DATA = [
  { key: 'mason', name: 'Mason', sinhala: 'මේසන් බාස්', emoji: '🧱', desc: 'Brickwork & Concrete' },
  { key: 'carpenter', name: 'Carpenter', sinhala: 'වඩු බාස්', emoji: '🪵', desc: 'Woodwork & Roofing' },
  { key: 'welder', name: 'Welder', sinhala: 'වෙල්ඩින් කාර්මික', emoji: '⚙️', desc: 'Gates, Grills & Trusses' },
  { key: 'tile_layer', name: 'Tile Layer', sinhala: 'ටයිල් බාස්', emoji: '🏠', desc: 'Floor & Bathroom Tiles' },
  { key: 'plumber', name: 'Plumber', sinhala: 'නල කාර්මික', emoji: '🔧', desc: 'Pipes, Motors & Fixtures' },
  { key: 'electrician', name: 'Electrician', sinhala: 'විදුලි කාර්මික', emoji: '⚡', desc: 'Wiring & Solar Power' },
  { key: 'steel_fixer', name: 'Steel Fixer', sinhala: 'යකඩ බාස්', emoji: '🏗️', desc: 'Rebar & Slab Work' },
  { key: 'painter', name: 'Painter', sinhala: 'තීන්ත ආලේපක', emoji: '🎨', desc: 'Interior & Exterior' },
]

export default function HomePage() {
  const { t, isSinhala } = useLanguage()

  const STEPS = [
    {
      icon: Search,
      title: isSinhala ? 'ශිල්පීන් සෙවීම' : 'Search by Trade & City',
      desc: isSinhala
        ? 'වෘත්තිය, නගරය සහ සමාලෝචන අනුව තහවුරු කළ ශ්‍රී ලාංකික ශිල්පීන් සොයාගන්න.'
        : 'Browse verified Sri Lankan tradespeople by skill, town, and reviews.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Calendar,
      title: isSinhala ? 'දින වෙන්කරවා ගැනීම' : 'Book Dates & Rates',
      desc: isSinhala
        ? 'රුපියල් වලින් පැහැදිලි දෛනික වැටුප්. මිනිත්තු කිහිපයකින් තහවුරු කරන්න.'
        : 'Transparent daily rates in LKR. Confirm your site schedule in minutes.',
      color: 'bg-violet-50 text-violet-600',
    },
    {
      icon: Compass,
      title: isSinhala ? 'සජීවී සිතියම' : 'Live GPS Map',
      desc: isSinhala
        ? 'ඔබේ වැඩබිම අසල සිටින කාර්මිකයන් සහ හාඩ්වෙයාර් වෙළඳසැල් සිතියමෙන් බලන්න.'
        : 'See nearby workers and hardware stores with live distance tracking.',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: Star,
      title: isSinhala ? 'ප්‍රතිචාර ලබාදීම' : 'Rate & Review',
      desc: isSinhala
        ? 'විශ්වාසය තහවුරු කිරීමට ඔබේ අවංක අත්දැකීම් ප්‍රජාව සමග බෙදාගන්න.'
        : 'Share verified feedback to strengthen trust and quality in the community.',
      color: 'bg-amber-50 text-amber-600',
    },
  ]

  const STATS = [
    { value: '5,000+', label: isSinhala ? 'තහවුරු කළ ශිල්පීන්' : 'Verified Workers in Sri Lanka' },
    { value: '25', label: isSinhala ? 'දිස්ත්‍රික්ක ආවරණය' : 'Districts Covered' },
    { value: 'Rs. 4,500+', label: isSinhala ? 'ආරම්භක දෛනික වැටුප' : 'Starting Daily Rates' },
    { value: '98%', label: isSinhala ? 'සාර්ථක වැඩ නිමවීම්' : 'Job Completion Rate' },
  ]

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
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-100">
              {t('countryTag')}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: '/workers', label: t('nav.workers') },
              { href: '/stores', label: t('nav.stores') },
              { href: '/estimator', label: t('nav.estimator') },
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

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button variant="ghost" size="sm" asChild className="text-gray-600 hover:text-gray-900">
              <Link href="/auth/signin">{t('nav.signin')}</Link>
            </Button>
            <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm">
              <Link href="/auth/signup">{t('nav.signup')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-50/80 to-transparent rounded-b-full" />
          <div className="absolute top-20 right-20 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-56 h-56 bg-violet-100/30 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-blue-100">
            <Zap className="h-3.5 w-3.5" />
            <span>{t('home.badge')}</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight text-balance">
            {t('home.heroTitle')}{' '}
            <span className="text-blue-600">{t('home.heroTitleHighlight')}</span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('home.heroDesc')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 shadow-sm shadow-blue-200 font-medium"
            >
              <Link href="/workers">
                <Search className="mr-2 h-4 w-4" />
                {t('home.findWorkers')}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-xl h-12 px-8 border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
            >
              <Link href="/auth/signup?role=WORKER">
                {t('home.becomeWorker')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-500">
            {[
              { icon: ShieldCheck, label: t('home.trustVerified') },
              { icon: Clock, label: t('home.trustRates') },
              { icon: MapPin, label: t('home.trustIslandwide') },
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
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
              {t('home.howItWorksSubtitle')}
            </p>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
              {t('home.howItWorksTitle')}
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              {t('home.howItWorksDesc')}
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
                  <div className="text-xs font-bold text-gray-400 mb-1">
                    {isSinhala ? `පියවර ${index + 1}` : `STEP ${index + 1}`}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Skills in Sri Lanka ── */}
      <section className="py-24 bg-gray-50/60">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-3">
              {t('home.tradesSubtitle')}
            </p>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
              {t('home.tradesTitle')}
            </h2>
            <p className="text-gray-500 mt-3">{t('home.tradesDesc')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {SKILLS_DATA.map((skill) => (
              <Link
                key={skill.name}
                href={`/workers?skill=${skill.name.toUpperCase().replace(' ', '_')}`}
                className="group bg-white border border-gray-100 rounded-2xl p-5 text-center hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="text-3xl mb-3">{skill.emoji}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                  {isSinhala ? skill.sinhala : skill.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{skill.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Wandura Sri Lanka ── */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-4">
                {t('home.whySubtitle')}
              </p>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-6">
                {t('home.whyTitle')}
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                {t('home.whyDesc')}
              </p>
              <ul className="space-y-4">
                {[
                  isSinhala ? 'වැඩබිම අසල සිටින ශිල්පීන් සහ වෙළඳසැල් සජීවී ජී.පී.එස්. සිතියමෙන්' : 'Live GPS Map showing workers and hardware stores near your site',
                  isSinhala ? 'ශ්‍රී ලංකා රුපියල් (LKR) වලින් පැහැදිලි දෛනික සහ පැයක වැටුප්' : 'Clear pricing in Sri Lankan Rupees (LKR) by day or hour',
                  isSinhala ? 'ප්‍රදේශවාසීන්ගේ සත්‍යාපිත ශ්‍රේණිගත කිරීම් සහ සමාලෝචන' : 'Verified ratings & reviews from local homeowners and builders',
                  isSinhala ? 'විශ්වාසදායක වෙළඳසැල් වලින් ද්‍රව්‍ය ඇණවුම් කිරීම (සිමෙන්ති, වැලි, ගඩොල්)' : 'Order materials from trusted local hardware stores (cement, sand, bricks)',
                  isSinhala ? 'ස්වයංක්‍රීය වියදම් ගණකය මගින් ද්‍රව්‍ය අයවැය සැලසුම් කිරීම' : 'Track site progress with tasks and material expense calculators',
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
                <Link href="/auth/signup">{t('home.ctaButton')}</Link>
              </Button>
            </div>

            {/* Visual Card Example in LKR */}
            <div className="relative hidden lg:block">
              <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-3xl p-8 border border-blue-100">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">SW</div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Sunimal Wickramasinghe</p>
                      <p className="text-xs text-gray-400">
                        {isSinhala ? 'මේසන් බාස්' : 'Mason'} &bull; 12 {t('common.yrsExp')} &bull; Colombo
                      </p>
                    </div>
                    <span className="ml-auto text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                      {isSinhala ? 'ලබාගත හැක' : 'Available'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map(s => <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                    <span className="text-xs text-gray-500 ml-1">4.9 (54 {t('common.reviews')})</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('common.dailyWage')}</span>
                    <span className="font-bold text-blue-600">Rs. 5,500 / {t('common.day')}</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {isSinhala ? 'වෙන්කිරීම තහවුරු විය' : 'Booking Confirmed'}
                      </p>
                      <p className="text-xs text-gray-400">Maharagama Site</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>{isSinhala ? 'කාලය' : 'Duration'}</span>
                      <span className="font-medium text-gray-700">5 {isSinhala ? 'දින' : 'days'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('common.totalEstimate')}</span>
                      <span className="font-bold text-blue-600">Rs. 27,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isSinhala ? 'ප්‍රදේශය' : 'Location'}</span>
                      <span className="text-gray-700 font-medium">Western Province</span>
                    </div>
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
            {t('home.ctaTitle')}
          </h2>
          <p className="text-blue-100 mb-10 max-w-lg mx-auto text-lg">
            {t('home.ctaDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-white text-blue-600 hover:bg-blue-50 rounded-xl h-12 px-8 font-semibold shadow-sm transition-all"
            >
              <Link href="/auth/signup">{t('home.ctaButton')}</Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="bg-blue-700 hover:bg-blue-800 text-white border border-blue-400/50 rounded-xl h-12 px-8 font-semibold shadow-sm transition-all"
            >
              <Link href="/workers">{t('home.ctaMapButton')}</Link>
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
              <span className="font-bold text-gray-900">Wandura {t('countryTag')}</span>
            </Link>
            <nav className="flex flex-wrap gap-6 text-sm text-gray-500">
              <Link href="/workers" className="hover:text-gray-900 transition-colors">{t('nav.workers')}</Link>
              <Link href="/stores" className="hover:text-gray-900 transition-colors">{t('nav.stores')}</Link>
              <Link href="/estimator" className="hover:text-gray-900 transition-colors">{t('nav.estimator')}</Link>
              <Link href="/auth/signin" className="hover:text-gray-900 transition-colors">{t('nav.signin')}</Link>
            </nav>
            <p className="text-sm text-gray-400">&copy; 2026 Wandura Sri Lanka. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
