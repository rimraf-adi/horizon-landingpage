"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  { 
    name: "Single Report", 
    price: "₹99", 
    period: "one-time",
    description: "A complete diagnostic of your trade history", 
    features: ["Full 10-domain analysis", "Payout readiness score", "Risk & compliance cross-check", "Behavioral incident detection", "Instant delivery"], 
    cta: "Get Your Report", 
    popular: false 
  },
  { 
    name: "Full Guidance", 
    price: "₹499", 
    period: "/month",
    description: "For traders who want continuous improvement and support", 
    features: ["Everything in Single Report", "Full guidance & support", "1:1 Telegram access", "Annotated charts & breakdowns", "One clear fix per audit"], 
    cta: "Book Pro Audit", 
    popular: true 
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.45 }} className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl tracking-tight mb-4 font-bold">Simple, transparent pricing</h2>
          <p className="text-lg text-muted-foreground">Get a single health check or work with us continuously to scale your edge.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.4, delay: index * 0.08 }}>
              <Card className={`h-full flex flex-col ${plan.popular ? "border-primary shadow-lg relative" : ""}`}>
                <CardHeader>
                  {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Recommended</Badge>}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold mt-2 mb-1">{plan.price}<span className="text-base font-normal text-muted-foreground">{plan.period}</span></div>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <ul className="space-y-4 mb-8 flex-1 mt-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground/90">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" size="lg" variant={plan.popular ? "default" : "outline"}>{plan.cta}</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
