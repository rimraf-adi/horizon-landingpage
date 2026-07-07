"use client";

import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { MessageCircle, FileBarChart2 } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">
            Want a person to look at the chart too?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Chat 1:1 on Telegram or book a Pro Audit — annotated chart, written breakdown, one clear fix.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" variant="secondary" className="gap-2 text-primary font-semibold">
              <MessageCircle className="h-5 w-5" />
              Chat on Telegram
            </Button>
            <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 text-white">
              <FileBarChart2 className="h-5 w-5" />
              Book Pro Audit
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
