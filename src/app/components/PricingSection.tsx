import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  { name: "Free", price: "$0", description: "Validation mode for challenge takers", features: ["1 account", "Limited history", "Core import + basic analytics", "Session overview"], cta: "Start Free", popular: false },
  { name: "Pro", price: "$39", description: "For funded grinders scaling with discipline", features: ["Up to 3 accounts", "Full history", "Advanced session intelligence", "Behavior incident detection", "Priority support"], cta: "Upgrade to Pro", popular: true },
  { name: "Elite", price: "$119", description: "For multi-firm portfolio operators", features: ["Unlimited accounts", "Firm/account group analytics", "Capital routing insight cards", "Early access to priority features"], cta: "Contact for Elite", popular: false },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.45 }} className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl tracking-tight mb-4">Plans aligned to account scale</h2>
          <p className="text-lg text-muted-foreground">Feature gating follows the PRD: account limits in Free, behavioral/session depth in Pro, and cross-firm capital tooling in Elite.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.4, delay: index * 0.08 }}>
              <Card className={plan.popular ? "border-primary shadow-lg" : ""}>
                <CardHeader>
                  {plan.popular && <Badge className="w-fit">Recommended</Badge>}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">{plan.price}<span className="text-base font-normal text-muted-foreground">/month</span></div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm"><Check className="h-4 w-4 text-green-500" />{feature}</li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>{plan.cta}</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
