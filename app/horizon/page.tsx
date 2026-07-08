'use client';

import { HeroSection } from "@/app/components/HeroSection";
import { FeaturesSection } from "@/app/components/FeaturesSection";
import { PricingSection } from "@/app/components/PricingSection";
import { TestimonialsSection } from "@/app/components/TestimonialsSection";

export default function HorizonPage() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
    </main>
  );
}
