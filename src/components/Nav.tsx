import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

const linkCls =
  "text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition whitespace-nowrap";

export function Nav({ variant = "candidate" }: { variant?: "candidate" | "business" }) {
  const onEmpresas = variant === "business";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-gradient-brand shadow-glow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-20 flex items-center justify-between gap-3">
        <Logo />
        <div className="flex items-center gap-3 sm:gap-6">
          {onEmpresas ? (
            <a href="#contacto" className={linkCls}>
              Solicitar demo
            </a>
          ) : (
            <Link to="/empresas" hash="contacto" className={linkCls}>
              Solicitar demo
            </Link>
          )}
          <Link to="/guia" className={linkCls}>
            Guía CV
          </Link>
          <Link
            to="/"
            hash="unete"
            className="bg-white text-primary text-xs sm:text-sm font-bold px-3 sm:px-5 py-2 sm:py-2.5 rounded-full hover:shadow-xl transition-all hover:-translate-y-0.5 whitespace-nowrap"
          >
            Únete a la red
          </Link>
        </div>
      </div>
    </nav>
  );
}
