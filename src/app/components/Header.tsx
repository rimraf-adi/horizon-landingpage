import { Button } from "./ui/button";
import { BarChart3 } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center gap-2 font-semibold tracking-tight">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Prop Trading Cockpit</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#pillars" className="text-muted-foreground hover:text-foreground transition-colors">Pillars</a>
            <a href="#roadmap" className="text-muted-foreground hover:text-foreground transition-colors">Roadmap</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Plans</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden md:inline-flex">Sign In</Button>
          <Button>Start With Sample Data</Button>
        </div>
      </div>
    </header>
  );
}
