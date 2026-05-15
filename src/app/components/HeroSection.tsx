import { Button } from "./ui/button";
import { ArrowRight, Play, CandlestickChart, ShieldAlert, Layers3 } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const chips = [
  { label: "London +2.4R", cls: "top-6 left-6" },
  { label: "NY Open -1.1R", cls: "top-10 right-6" },
  { label: "Revenge Risk High", cls: "bottom-24 left-10" },
  { label: "Portfolio +$4.2k", cls: "bottom-8 right-10" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-20 lg:py-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(11,121,255,0.16),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(0,177,138,0.13),transparent_40%)]" />
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.55, ease: "easeOut" }}>
            <h1 className="text-3xl sm:text-4xl md:text-6xl tracking-tight mb-6 max-w-2xl">
              Make better trading decisions with one cockpit
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl">
              Consolidate prop firm and broker data into session intelligence, behavioral incident detection, and multi-account capital analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Play className="mr-2 h-4 w-4" />
                Explore Sandbox
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
              <div className="rounded-xl border bg-card/90 p-3">
                <CandlestickChart className="h-4 w-4 text-primary mb-2" />
                <p className="text-xs text-muted-foreground">Session Lens</p>
                <p className="text-sm font-semibold">London / NY / Asia</p>
              </div>
              <div className="rounded-xl border bg-card/90 p-3">
                <ShieldAlert className="h-4 w-4 text-primary mb-2" />
                <p className="text-xs text-muted-foreground">Behavior Engine</p>
                <p className="text-sm font-semibold">Revenge + Over-trading</p>
              </div>
              <div className="rounded-xl border bg-card/90 p-3">
                <Layers3 className="h-4 w-4 text-primary mb-2" />
                <p className="text-xs text-muted-foreground">Portfolio View</p>
                <p className="text-sm font-semibold">All Accounts</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-auto min-h-[420px] md:min-h-[470px] rounded-[1.5rem] md:rounded-[2rem] border bg-gradient-to-br from-card via-card/95 to-muted/30 p-4 md:p-6 shadow-xl"
          >
            <div className="grid grid-cols-1 gap-3 md:gap-4 h-full">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-2xl border bg-background/90 p-3 md:p-4"
              >
                <p className="text-xs text-muted-foreground mb-2">Session Expectancy (R)</p>
                <svg viewBox="0 0 420 110" className="w-full h-20 md:h-24">
                  <defs>
                    <linearGradient id="lineA" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="420" height="110" rx="10" fill="rgba(15,23,42,0.03)" />
                  <path d="M10 78 C50 60, 70 62, 95 55 C130 44, 145 74, 180 58 C210 44, 230 42, 260 48 C295 56, 315 38, 350 34 C374 31, 390 42, 410 36" fill="none" stroke="url(#lineA)" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="180" cy="58" r="4" fill="#2563eb" />
                  <circle cx="350" cy="34" r="4" fill="#0284c7" />
                </svg>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                  className="rounded-2xl border bg-background/90 p-3 md:p-4"
                >
                  <p className="text-xs text-muted-foreground mb-2">Behavior Timeline</p>
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded bg-muted" />
                    <div className="h-2 w-5/6 rounded bg-muted" />
                    <div className="h-2 w-2/3 rounded bg-muted" />
                    <div className="inline-block text-xs mt-1 rounded bg-amber-100 text-amber-800 px-2 py-1">2 incidents detected</div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  className="rounded-2xl border bg-background/90 p-3 md:p-4"
                >
                  <p className="text-xs text-muted-foreground mb-2">Capital Routing</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>FTMO Funded</span><span className="font-semibold text-emerald-600">+1.9R</span></div>
                    <div className="flex justify-between"><span>Eval Group</span><span className="font-semibold text-rose-600">-0.6R</span></div>
                    <div className="h-px bg-border my-2" />
                    <div className="text-xs text-muted-foreground">Suggestion: scale risk on FTMO NY continuation setups.</div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="rounded-2xl border bg-background/90 p-3 md:p-4"
              >
                <p className="text-xs text-muted-foreground mb-2">Connected Sources</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border px-2 py-1">FTMO CSV</span>
                  <span className="rounded-full border px-2 py-1">MyFundedFX CSV</span>
                  <span className="rounded-full border px-2 py-1">Tradovate Export</span>
                  <span className="rounded-full border px-2 py-1">MT5 Report</span>
                </div>
              </motion.div>
            </div>

            <div className="hidden md:block">
              {chips.map((chip, i) => (
                <motion.div
                  key={chip.label}
                  className={`absolute ${chip.cls} rounded-full border bg-background/95 px-3 py-1 text-xs shadow-md`}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.6 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
                >
                  {chip.label}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
