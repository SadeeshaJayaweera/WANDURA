import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Hammer, Search, Calendar, CreditCard, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hammer className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Wandura</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="/workers" className="text-sm font-medium hover:text-primary">
              Find Workers
            </Link>
            <Link href="/stores" className="text-sm font-medium hover:text-primary">
              Hardware Stores
            </Link>
            <Link href="/estimator" className="text-sm font-medium hover:text-primary">
              Cost Estimator
            </Link>
          </nav>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Skilled Labor, <span className="text-primary">On-Demand</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with verified masons, welders, carpenters, and more.
            Book by the hour or day with transparent pricing.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link href="/workers">
                <Search className="mr-2 h-5 w-5" />
                Find Workers
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signup?role=WORKER">
                Become a Worker
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Search Workers</h3>
              <p className="text-sm text-muted-foreground">
                Find skilled workers by trade, location, and rating
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Book & Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Schedule jobs by day or hour with transparent rates
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Secure Payment</h3>
              <p className="text-sm text-muted-foreground">
                Pay securely through our platform with Stripe
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Rate & Review</h3>
              <p className="text-sm text-muted-foreground">
                Share your experience and help others make informed decisions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Available Skills</h2>
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {['Mason', 'Welder', 'Carpenter', 'Tile Layer', 'Plumber', 'Electrician', 'Steel Fixer', 'Painter'].map((skill) => (
              <div key={skill} className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center font-medium border hover:border-primary transition-colors cursor-pointer">
                {skill}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of customers and workers on Wandura
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/signup">Create Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Wandura. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
