'use client';

import Link from 'next/link';
import { TrendingUp, ArrowRight, BookOpen, Users, Target, Zap, BarChart3, Shield, Brain, Activity, FileText } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <FadeIn delay={0.1}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400">Expert Financial Insights</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-muted-foreground">Navigate the</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">Financial Markets</span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.3}>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Expert analysis, market trends, and investment strategies to help you make informed financial decisions in today&apos;s dynamic markets.
          </p>
        </FadeIn>
        <FadeIn delay={0.4}>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold hover:shadow-[0_0_28px_rgba(16,185,129,0.35)] transition-all hover:scale-105"
            >
              <BookOpen className="w-5 h-5" />
              Read Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#about"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 hover:bg-emerald-500/15 transition-all hover:scale-105"
            >
              Learn More
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ── Trade Analytics Section ── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <FadeIn>
          <div className="rounded-3xl overflow-hidden border border-border bg-card/80 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left — Info */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <FadeIn delay={0.1} direction="right">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-5 w-fit">
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Trade Audit</span>
                  </div>
                </FadeIn>
                <FadeIn delay={0.15} direction="right">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                    Every trade you take,{' '}
                    <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">decoded across 10&nbsp;domains</span>
                  </h2>
                </FadeIn>
                <FadeIn delay={0.2} direction="right">
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Upload your prop firm CSV and get institutional-grade analysis on risk, compliance, behavior, and payout-readiness — in seconds, not a spreadsheet.
                  </p>
                </FadeIn>
                <FadeIn delay={0.25} direction="right">
                  <div className="flex flex-wrap gap-2 mb-8">
                    {[
                      { icon: Shield, label: 'Risk & Compliance' },
                      { icon: Brain, label: 'Behavioral Engine' },
                      { icon: Activity, label: 'Session Analysis' },
                      { icon: FileText, label: 'PDF Reports' },
                    ].map((pill) => (
                      <span
                        key={pill.label}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs font-medium text-muted-foreground"
                      >
                        <pill.icon className="w-3.5 h-3.5 text-emerald-400" />
                        {pill.label}
                      </span>
                    ))}
                  </div>
                </FadeIn>
                <FadeIn delay={0.3} direction="right">
                  <Link
                    href="/trade-check"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold hover:shadow-[0_0_28px_rgba(16,185,129,0.35)] transition-all hover:scale-105 w-fit"
                  >
                    Run Free Analysis
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2.5">No card. No signup to see your score.</p>
                </FadeIn>
              </div>

              {/* Right — Mini Dashboard Preview */}
              <div className="relative p-6 md:p-8 bg-gradient-to-br from-emerald-500/5 to-teal-500/10">
                <FadeIn delay={0.2} direction="left">
                  <div className="space-y-4">
                    {/* Score Ring + Verdict */}
                    <div className="flex items-center gap-4 rounded-2xl bg-background/80 border border-border p-4 shadow-sm">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <svg viewBox="0 0 72 72" className="w-full h-full">
                          <circle cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted" />
                          <circle
                            cx="36" cy="36" r="30" fill="none"
                            stroke="url(#scoreGrad)" strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={`${0.72 * 188.5} ${188.5}`}
                            transform="rotate(-90 36 36)"
                          />
                          <defs>
                            <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#059669" />
                              <stop offset="100%" stopColor="#10B981" />
                            </linearGradient>
                          </defs>
                          <text x="36" y="40" textAnchor="middle" className="text-sm font-bold" fill="#10B981" fontSize="16">72</text>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Overall Score</p>
                        <p className="text-xs text-emerald-400 font-medium">Good — Minor risk adjustments needed</p>
                      </div>
                    </div>

                    {/* Equity Curve */}
                    <div className="rounded-2xl bg-background/80 border border-border p-4 shadow-sm">
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Equity Curve</p>
                      <svg viewBox="0 0 320 80" className="w-full h-16">
                        <defs>
                          <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#059669" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="eqLine" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#059669" />
                            <stop offset="100%" stopColor="#10B981" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0 60 C20 58, 40 52, 60 48 C80 44, 100 50, 120 42 C140 34, 160 38, 180 30 C200 24, 220 28, 240 22 C260 18, 280 20, 300 14 L320 10 L320 80 L0 80 Z"
                          fill="url(#eqFill)"
                        />
                        <path
                          d="M0 60 C20 58, 40 52, 60 48 C80 44, 100 50, 120 42 C140 34, 160 38, 180 30 C200 24, 220 28, 240 22 C260 18, 280 20, 300 14 L320 10"
                          fill="none" stroke="url(#eqLine)" strokeWidth="2.5" strokeLinecap="round"
                        />
                        <circle cx="320" cy="10" r="3" fill="#10B981" />
                      </svg>
                    </div>

                    {/* Session Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Win Rate', value: '62%' },
                        { label: 'Profit Factor', value: '1.84' },
                        { label: 'Avg R:R', value: '1.6' },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-xl bg-background/80 border border-border p-3 text-center shadow-sm">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                          <p className="text-lg font-bold text-emerald-400">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Analysis badges */}
                    <div className="flex flex-wrap gap-2">
                      {['Session Lens', 'Behavior Timeline', 'Capital Routing', 'Drawdown Check'].map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-full bg-background/80 border border-border text-[10px] font-medium text-muted-foreground shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
          <StaggerItem>
            <div className="p-8 rounded-2xl text-center h-full hover:scale-105 transition-transform border border-border bg-card/80 backdrop-blur-sm">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Market Analysis</h3>
              <p className="text-muted-foreground">In-depth analysis of market trends, patterns, and opportunities to inform your investment decisions.</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="p-8 rounded-2xl text-center h-full hover:scale-105 transition-transform border border-border bg-card/80 backdrop-blur-sm">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Real-Time Updates</h3>
              <p className="text-muted-foreground">Stay ahead with timely insights on market movements and economic developments.</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="p-8 rounded-2xl text-center h-full hover:scale-105 transition-transform border border-border bg-card/80 backdrop-blur-sm">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Expert Community</h3>
              <p className="text-muted-foreground">Join a community of traders and investors sharing knowledge and strategies.</p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* About Section */}
      <section id="about" className="max-w-6xl mx-auto px-4 py-20">
        <FadeIn>
          <div className="rounded-3xl p-12 md:p-16 border border-border bg-card/80 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <FadeIn delay={0.1} direction="right">
                  <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 block">About Us</span>
                </FadeIn>
                <FadeIn delay={0.2} direction="right">
                  <h2 className="text-4xl font-bold text-foreground mb-6">Your Trusted Financial Partner</h2>
                </FadeIn>
                <FadeIn delay={0.3} direction="right">
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Paisanomics is dedicated to democratizing financial knowledge. We believe everyone deserves access to quality market analysis and investment education.
                  </p>
                </FadeIn>
                <FadeIn delay={0.4} direction="right">
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Our team of experienced analysts and finance professionals bring you insights that were once reserved for institutional investors.
                  </p>
                </FadeIn>
              </div>
              <FadeIn delay={0.3} direction="left">
                <div className="relative">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center">
                    <TrendingUp className="w-32 h-32 text-emerald-400 opacity-30" />
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <FadeIn>
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Start Your Financial Journey?</h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Explore our latest articles and stay informed about market trends.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold hover:shadow-[0_0_28px_rgba(16,185,129,0.35)] transition-all hover:scale-105"
          >
            Browse All Articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </FadeIn>
      </section>
    </main>
  );
}
