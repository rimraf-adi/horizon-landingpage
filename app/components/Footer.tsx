"use client";

import { Separator } from "./ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="font-semibold mb-3">Prop Trading Cockpit</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Trader-centric analytics for prop firm and broker data: sessions, behavior, and multi-account capital context in one workspace.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-3">Product Focus</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>CSV-first import engine</li>
              <li>Session and heatmap analytics</li>
              <li>Behavioral incident detection</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-3">Target Users</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Funded grinder</li>
              <li>Scaling prop operator</li>
              <li>Challenge taker</li>
            </ul>
          </div>
        </div>
        <Separator className="my-6" />
        <p className="text-sm text-muted-foreground">&copy; 2026 Prop Trading Cockpit. Built from PRD v1.0 (May 14, 2026).</p>
      </div>
    </footer>
  );
}
