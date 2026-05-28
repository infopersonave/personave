import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Nav({ variant = "candidate" }: { variant?: "candidate" | "business" }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-gradient-brand shadow-glow">
      <div className="mx-auto max-w-7xl px-6 h-28 md:h-36 flex items-center justify-between">
        <Logo />
        {variant === "candidate" ? (
          <a href="#hero" className="bg-white text-primary text-sm font-bold px-5 py-2.5 rounded-full hover:shadow-xl transition-all hover:-translate-y-0.5">
            Únete Ahora
          </a>
        ) : (
          <Link to="/" className="text-sm font-semibold text-white hover:text-white/80 transition">
            Para Profesionales →
          </Link>
        )}
      </div>
    </nav>
  );
}
