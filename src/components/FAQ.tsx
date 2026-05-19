import { useState } from "react";
import { Plus } from "lucide-react";

const items = [
  { q: "¿Cuánto cuesta usar Persona?", a: "Para profesionales, Persona es 100% gratis. Las empresas pagan por acceder a talento validado." },
  { q: "¿Qué hace diferente a Persona?", a: "No somos una bolsa de empleo tradicional. Validamos cada perfil, hacemos matching humano y nos enfocamos en calidad sobre cantidad." },
  { q: "¿Cuánto tarda el proceso?", a: "La validación toma 24-48 horas. Una vez validado, comenzamos a conectarte con oportunidades inmediatamente." },
  { q: "¿Solo para Venezuela?", a: "Actualmente enfocados en Venezuela, pero trabajamos con empresas que contratan remoto desde LATAM." },
  { q: "¿Qué tipo de empresas contratan aquí?", a: "Desde startups tech hasta empresas establecidas. Todas validadas y con cultura de trabajo moderna." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {items.map((it, i) => (
        <div key={i} className="glass-strong rounded-2xl overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
            <span className="font-semibold pr-4">{it.q}</span>
            <Plus className={`w-5 h-5 shrink-0 transition-transform ${open === i ? "rotate-45 text-primary" : ""}`} />
          </button>
          {open === i && (
            <div className="px-5 pb-5 text-muted-foreground animate-fade-up">{it.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}
