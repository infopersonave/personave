import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Nav({ variant = "candidate" }: { variant?: "candidate" | "business" }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 glass">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Logo />
        {variant === "candidate" ? (
          <a href="#hero" className="bg-gradient-brand text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-glow hover:shadow-xl transition-all hover:-translate-y-0.5">
            Únete Ahora
          </a>
        ) : (
          <Link to="/" className="text-sm font-semibold text-foreground hover:text-gradient transition">
            Para Profesionales →
          </Link>
        )}
      </div>
    </nav>
  );
}
