import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Upload, Clock3, AlertTriangle, Network, WalletCards, ChartNoAxesCombined } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Upload, title: "Data Ingestion & Normalization", description: "Upload prop/broker CSV files, auto-detect source schemas, normalize timestamps/symbols, and report skipped rows with reasons.", phase: "Phase 1" },
  { icon: Clock3, title: "Session Intelligence", description: "Measure expectancy across London, NY, and Asia sessions with time-of-day and weekday pattern visibility.", phase: "Phase 2" },
  { icon: AlertTriangle, title: "Behavioral Analytics", description: "Detect revenge trading and over-trading incidents from trade sequences and mark incidents in context.", phase: "Phase 2" },
  { icon: Network, title: "Multi-Account Cockpit", description: "Aggregate funded and evaluation accounts across firms and analyze combined equity and risk.", phase: "Phase 3" },
  { icon: WalletCards, title: "Plan-Based Expansion", description: "Free/Pro/Elite feature gating aligned to account limits, history depth, and advanced analytics.", phase: "Phase 3" },
  { icon: ChartNoAxesCombined, title: "Trader-Centric Insights", description: "Shift from rule-compliance dashboards to actionable edge-focused analytics and allocation guidance.", phase: "Core" },
];

export function FeaturesSection() {
  return (
    <section id="pillars" className="py-20 bg-muted/40">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.45 }} className="max-w-3xl mb-12">
          <h2 className="text-3xl md:text-4xl tracking-tight mb-4">Built around the PRD product pillars</h2>
          <p className="text-lg text-muted-foreground">The cockpit is organized around ingestion reliability, session intelligence, behavioral leak detection, and multi-account capital allocation.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.4, delay: index * 0.06 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <feature.icon className="h-6 w-6 text-primary" />
                    <Badge variant="secondary" className="text-xs">{feature.phase}</Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
