import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-gradient-brand">
      <div className="mx-auto max-w-7xl px-6 py-14 text-center">
        <div className="flex justify-center mb-4"><Logo /></div>
        <p className="text-white/90 font-medium">Personas correctas. Oportunidades correctas.</p>
        <p className="mt-3 text-sm text-white/70">© 2026 Persona. Hecho en Venezuela 🇻🇪</p>
      </div>
    </footer>
  );
}
