import { Button } from "./ui/button";
import { BarChart3, Menu } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4 lg:gap-8">
          <a href="#" className="flex items-center gap-2 font-semibold tracking-tight shrink-0">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Prop Trading Cockpit</span>
          </a>
          <nav className="hidden md:flex items-center gap-1 rounded-full border bg-card/70 p-1 text-sm">
            <a href="#pillars" className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Pillars</a>
            <a href="#roadmap" className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Roadmap</a>
            <a href="#pricing" className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Plans</a>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden md:inline-flex">Sign In</Button>
          <Button className="hidden sm:inline-flex">Get Started</Button>
          <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Open navigation menu">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
