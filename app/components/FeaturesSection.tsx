"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ShieldCheck, BrainCircuit, Target, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const pillars = [
  { icon: ShieldCheck, title: "Risk & Compliance", description: "Real-time cross-check against your prop firm's actual daily loss and drawdown limits. Know exactly how close you are before they tell you." },
  { icon: BrainCircuit, title: "Behavioral Intelligence", description: "Detects revenge-trading, sizing-up-after-wins, and SL-drift patterns — then checks them against what you think you're doing." },
  { icon: Target, title: "Payout Readiness", description: "A single score reflecting how close your current habits are to a clean, sustainable payout — not just whether you're currently profitable." },
];

const domains = [
  "Risk Sizing", "Prop Firm Compliance", "Win Rate & Expectancy", "Lot Consistency",
  "Trade Timing", "Behavioral Flags", "Drawdown Recovery", "Strategy Discipline",
  "Loss Reduction", "Payout Score"
];

export function FeaturesSection() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/40">
      <div className="container mx-auto px-4">
        
        {/* Three Pillars */}
        <div className="mb-24">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.45 }} className="max-w-3xl mb-12">
            <h2 className="text-3xl md:text-4xl tracking-tight mb-4 font-bold">Institutional-grade analytics for retail traders</h2>
            <p className="text-lg text-muted-foreground">Go beyond basic P&L. Our cockpit decodes your true trading behavior across three core pillars.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {pillars.map((pillar, index) => (
              <motion.div key={pillar.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.4, delay: index * 0.06 }}>
                <Card className="h-full border-muted-foreground/20 bg-card hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <pillar.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{pillar.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-muted-foreground/90 leading-relaxed">{pillar.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-24">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.45 }} className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl tracking-tight mb-4 font-bold">How it works</h2>
            <p className="text-lg text-muted-foreground">Three simple steps to unlock your performance data.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-0.5 bg-border -translate-y-1/2 z-0" />
            {[
              { step: 1, text: "Enter account details, upload trade history" },
              { step: 2, text: "System runs the analysis across 10 domains" },
              { step: 3, text: "Get your full report + payout-readiness score instantly" }
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.4, delay: i * 0.1 }} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary font-bold text-lg mb-6 group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <h3 className="text-lg font-medium px-4">{item.text}</h3>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 10 Domains Grid */}
        <div className="max-w-5xl mx-auto bg-card rounded-2xl border p-8 md:p-12 shadow-sm">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.45 }} className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">The 10 Domains of Analysis</h2>
            <p className="text-muted-foreground">Every trade is scrutinized against these core metrics.</p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {domains.map((domain, i) => (
              <motion.div key={domain} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.04 }} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium">{domain}</span>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
