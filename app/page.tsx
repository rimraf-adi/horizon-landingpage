'use client';

import { Header } from "@/app/components/Header";
import { HeroSection } from "@/app/components/HeroSection";
import { FeaturesSection } from "@/app/components/FeaturesSection";
import { PricingSection } from "@/app/components/PricingSection";
import { TestimonialsSection } from "@/app/components/TestimonialsSection";
import { Footer } from "@/app/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  );
}
