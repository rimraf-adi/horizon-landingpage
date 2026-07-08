'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Check, ArrowLeft, MessageCircle, FileBarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Trade Review',
    price: '₹99',
    period: 'one-time',
    description: 'Manual + AI assisted review of your trades',
    features: [
      'AI-powered 10-domain analysis',
      'Manual review by an experienced trader',
      'Risk & compliance cross-check',
      'Behavioral incident detection',
      'Payout readiness score',
      'Delivered within 24 hours',
    ],
    cta: 'Get Your Review',
    popular: false,
  },
  {
    name: '1:1 Personal Guidance',
    price: '₹499',
    period: '/month',
    description: 'Complete personalisation — work directly with me to fix your edge',
    features: [
      'Everything in Trade Review',
      'Direct 1:1 chat access (Telegram)',
      'Completely personalised to YOUR trading style',
      'Weekly annotated chart reviews',
      'Custom strategy adjustments',
      'Ongoing accountability & follow-up',
      'Priority response — no waiting',
    ],
    cta: 'Start Personal Guidance',
    popular: true,
  },
];

const faqs = [
  {
    q: 'What do I get in a Trade Review?',
    a: 'A combined manual + AI-powered analysis of your trade history across 10 domains — risk sizing, compliance, behavioral flags, payout readiness, and more. An experienced trader personally reviews your data alongside the AI output. Delivered within 24 hours.',
  },
  {
    q: 'What does 1:1 Personal Guidance include?',
    a: 'Everything in the Trade Review, plus ongoing direct access to me via Telegram. This is completely personalised to your trading style — weekly annotated chart reviews, custom strategy adjustments, and continuous accountability to help you actually improve.',
  },
  {
    q: 'Can I try it before I pay?',
    a: 'Yes — every user gets one free AI analysis. After that, you can purchase a Trade Review or subscribe to Personal Guidance for continued access and human insight.',
  },
  {
    q: 'What trade formats do you support?',
    a: 'We support CSV exports from MT4, MT5, cTrader, and most prop firm platforms including FTMO, MyFundedFX, The5%ers, and more.',
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-10"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h1 className="text-4xl md:text-5xl tracking-tight mb-4 font-bold">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-muted-foreground">
              Get a single audit or work with us continuously to scale your edge.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className={`h-full flex flex-col ${plan.popular ? 'border-primary shadow-lg relative' : ''}`}>
                  <CardHeader>
                    {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Recommended</Badge>}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold mt-2 mb-1">
                      {plan.price}
                      <span className="text-base font-normal text-muted-foreground">{plan.period}</span>
                    </div>
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
                    <Button className="w-full" size="lg" variant={plan.popular ? 'default' : 'outline'}>
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl mx-auto mb-24"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Frequently asked questions</h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-xl border bg-card p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-8">
              Reach out directly — we&apos;re happy to walk you through what the audit covers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat on Telegram
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <FileBarChart2 className="h-5 w-5" />
                Book Pro Audit
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
