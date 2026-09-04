import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitDemo } from "@/lib/forms.functions";

export function DemoForm({ compact = false }: { compact?: boolean }) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const submit = useServerFn(submitDemo);
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    const form = e.target as HTMLFormElement;
    try {
      await submit({ data: new FormData(form) });
      setSent(true);
    } catch (err) {
      console.error(err);
      alert("Hubo un error enviando tu solicitud. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className={`glass-strong rounded-3xl text-center animate-fade-up ${compact ? "p-6" : "p-10"}`}>
        <div className="mx-auto w-14 h-14 rounded-full bg-gradient-brand flex items-center justify-center mb-4 shadow-glow">
          <CheckCircle2 className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-bold mb-1">¡Solicitud recibida!</h3>
        <p className="text-muted-foreground text-sm">Te contactaremos en las próximas 24 horas.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`glass-strong rounded-3xl space-y-4 ${compact ? "p-6" : "p-8 md:p-10"}`}>
      <div className={compact ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
        <Field name="name" label="Nombre completo *" required compact={compact} />
        <Field name="email" label="Email corporativo *" type="email" required compact={compact} />
        <Field name="telefono" label="Teléfono *" type="tel" required placeholder="+58XXXXXXXXXX" compact={compact} />
        <Field name="empresa" label="Empresa *" required compact={compact} />
        <Field name="cargo" label="Cargo *" required compact={compact} />
        <Field name="posicion" label="Posición a contratar *" required compact={compact} />
      </div>

      <div className={compact ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
        <div>
          <label className="block text-sm font-medium mb-1.5">Seniority *</label>
          <select
            name="seniority"
            required
            defaultValue=""
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="" disabled>Selecciona...</option>
            <option value="Junior">Junior</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Senior">Senior</option>
          </select>
        </div>

        <Field name="anos_experiencia_min" label="Años mínimos *" type="number" min="0" required compact={compact} />

        <Field name="industria_preferida" label="Industria *" required compact={compact} />

        <div>
          <label className="block text-sm font-medium mb-1.5">Modalidad *</label>
          <select
            name="modalidad"
            required
            defaultValue=""
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="" disabled>Selecciona...</option>
            <option value="Presencial">Presencial</option>
            <option value="Remoto">Remoto</option>
            <option value="Híbrido">Híbrido</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Género buscado</label>
          <select
            name="genero_buscado"
            defaultValue="Indiferente"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="Indiferente">Indiferente</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
        </div>

        <Field name="num_vacantes" label="Vacantes *" type="number" min="1" required placeholder="Ej: 2" compact={compact} />
      </div>

      <div className={compact ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
        <Field name="ubicacion" label="Ubicación *" required placeholder="Ej: Caracas / Remoto" compact={compact} />
        <Field name="rango_salarial" label="Rango salarial *" required placeholder="Ej: 800-1500 USD/mes" compact={compact} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Skills requeridos *</label>
        <input
          name="skills_requeridos"
          required
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Ej: Shopify, SEO, Excel"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Skills deseables</label>
        <input
          name="skills_deseables"
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Ej: Inglés, Canva"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Descripción breve del rol *</label>
        <textarea
          name="descripcion_rol"
          rows={compact ? 2 : 4}
          required
          placeholder="Cuéntanos sobre el rol, el equipo y la cultura"
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="w-full bg-gradient-brand text-white font-semibold py-3 rounded-xl shadow-glow hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {sending ? "Enviando..." : "Solicitar Demo"}
      </button>
    </form>
  );
}

function Field({ label, compact, ...props }: { label: string; compact?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
