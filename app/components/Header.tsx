"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { BarChart3, Menu } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { label: "How it works", id: "how-it-works" },
  { label: "Pricing", id: "pricing" },
];

export function Header() {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { threshold: [0.35, 0.6, 0.85], rootMargin: "-20% 0px -60% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;
    setActiveSection(id);
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4 lg:gap-8">
          <a href="/" className="flex items-center gap-2 font-semibold tracking-tight shrink-0">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Trade Audit</span>
          </a>
          <nav className="hidden md:flex items-center gap-1 rounded-full border bg-card/70 p-1 text-sm">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  whileTap={{ scale: 0.96, opacity: 0.8 }}
                  className={`relative px-3 py-1.5 rounded-full transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-nav-pill"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <motion.span
                    className="relative z-10"
                    animate={{ opacity: isActive ? 1 : 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                </motion.button>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/trade-check">
            <Button className="hidden sm:inline-flex">Try it free</Button>
          </Link>
          <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Open navigation menu">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
