/**
 * Landing Page  —  /
 * ==================
 * Composes all landing sections in order.
 */
import Navbar           from '@/components/landing/Navbar'
import Hero             from '@/components/landing/Hero'
import ValueStrip       from '@/components/landing/ValueStrip'
import Features         from '@/components/landing/Features'
import HowItWorks       from '@/components/landing/HowItWorks'
import ValuationMethods from '@/components/landing/ValuationMethods'
import CTASection       from '@/components/landing/CTASection'
import Footer           from '@/components/landing/Footer'
import PricingAndFAQ    from '@/components/landing/PricingAndFAQ'

export default function LandingPage() {
  return (
    <div className="landing-shell">
      <Navbar />
      <main>
        <Hero />
        <ValueStrip />
        <Features />
        <HowItWorks />
        <ValuationMethods />
        <PricingAndFAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
