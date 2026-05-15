import { Card, CardContent } from "./ui/card";
import { motion } from "framer-motion";

const roadmap = [
  { phase: "Phase 1", title: "Foundation & MVP", detail: "CSV import, format detection, normalized trade schema, account-level equity, daily P&L, summary stats, and portfolio all-accounts mode." },
  { phase: "Phase 2", title: "Session + Behavior Intelligence", detail: "London/NY/Asia metrics, heatmaps, insight cards, revenge/over-trading incident detection, and behavior timeline markers." },
  { phase: "Phase 3", title: "Capital Cockpit + Monetization", detail: "Free/Pro/Elite gating, account groups, multi-firm exposure views, and capital routing suggestions." },
];

export function TestimonialsSection() {
  return (
    <section id="roadmap" className="py-20 bg-muted/40">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.45 }} className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl tracking-tight mb-4">Phased delivery roadmap</h2>
          <p className="text-lg text-muted-foreground">The launch plan is staged to prove utility early, then deepen session and behavior edge, and finally scale into multi-account capital operations.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roadmap.map((item, index) => (
            <motion.div key={item.phase} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.4, delay: index * 0.08 }}>
              <Card>
                <CardContent className="p-6">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">{item.phase}</p>
                  <h3 className="text-xl mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
