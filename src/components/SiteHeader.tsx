import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-leaf" />
          <span className="font-display text-2xl text-primary">Ayusense</span>
        </Link>
        <nav className="flex items-center gap-7 text-sm text-foreground/80">
          <Link to="/" className="hover:text-primary">Home</Link>
          <a href="#about" className="hover:text-primary">About</a>
          <a href="#contact" className="hover:text-primary">Contact</a>
        </nav>
      </div>
    </header>
  );
}
