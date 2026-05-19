import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-light">
      <div className="mx-auto max-w-7xl px-6 py-12 text-center">
        <div className="flex justify-center mb-4"><Logo /></div>
        <p className="text-muted-foreground font-medium">Personas correctas. Oportunidades correctas.</p>
        <p className="mt-3 text-sm text-muted-foreground">© 2026 Persona. Hecho en Venezuela 🇻🇪</p>
      </div>
    </footer>
  );
}
