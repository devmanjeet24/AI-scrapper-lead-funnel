import { Footer } from '@/components/footer/Footer'
import { StickyFeatureShowcase } from '@/components/feature-showcase/StickyFeatureShowcase'
import { HeroSection } from '@/components/hero/HeroSection'
import { Navbar } from '@/components/navbar/Navbar'
import { SocialProofSection } from '@/components/social-proof/SocialProofSection'

export function HomePage() {
  return (
    <div className="min-h-screen bg-background px-4 pt-4 pb-5 sm:px-5 sm:pt-5 sm:pb-6 lg:px-6 lg:pt-6">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 sm:gap-5">
        <Navbar />
        <HeroSection />
        <SocialProofSection />
        <StickyFeatureShowcase />
        <Footer />
      </div>
    </div>
  )
}
