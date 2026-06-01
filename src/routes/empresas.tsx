import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CheckCircle2 } from "lucide-react";
import { submitDemo } from "@/lib/forms.functions";

export const Route = createFileRoute("/empresas")({
  head: () => ({
    meta: [
      { title: "Persona para Empresas — Talento validado en Venezuela" },
      { name: "description", content: "Reduce tu tiempo de contratación en 60%. Accede a profesionales venezolanos pre-filtrados y listos para trabajar." },
      { property: "og:title", content: "Persona para Empresas" },
      { property: "og:description", content: "Recibe shortlists de candidatos validados en 48-72 horas." },
    ],
  }),
  component: Empresas,
});

const benefits = [
  { icon: "⚡", title: "Ahorra tiempo", desc: "Recibe shortlists de 3-5 candidatos validados en 48-72 horas. No más revisar cientos de CVs." },
  { icon: "🎯", title: "Talento validado", desc: "Cada perfil es verificado personalmente. Solo entrevistas candidatos pre-filtrados y calificados." },
  { icon: "💰", title: "Reduce costos", desc: "Menos tiempo de tu equipo revisando CVs. Menos riesgo de contrataciones fallidas." },
  { icon: "🇻🇪", title: "Enfoque Venezuela", desc: "Conocemos el mercado local. Talento venezolano de clase mundial listo para tu empresa." },
  { icon: "🤝", title: "Matching humano", desc: "No solo skills técnicos. Consideramos cultura, valores y fit con tu equipo." },
  { icon: "🔒", title: "Confidencialidad", desc: "Tus procesos de contratación son privados. Discreción total en búsquedas sensibles." },
];

const steps = [
  { t: "Comparte el perfil", d: "Nos cuentas qué tipo de talento necesitas: posición, skills, experiencia, cultura." },
  { t: "Buscamos y validamos", d: "Buscamos en nuestra red de talento validado y seleccionamos los mejores matches." },
  { t: "Recibes shortlist", d: "En 48-72 horas te enviamos 3-5 candidatos pre-filtrados listos para entrevistar." },
  { t: "Contratas más rápido", d: "Entrevistas solo candidatos calificados. Reduces tu tiempo de contratación en 60%." },
];

function Empresas() {
  return (
    <div className="min-h-screen">
      <Nav variant="business" />

      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-mesh">
        <div className="mx-auto max-w-4xl px-6 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-brand-soft border border-primary/20 text-sm font-medium mb-6">
            Para empresas
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            <span className="text-gradient">Contrata talento validado</span> en Venezuela
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Reduce tu tiempo de contratación en 60%. Accede a profesionales pre-filtrados y listos para trabajar.
          </p>
          <a href="#contacto" className="inline-block mt-10 bg-gradient-brand text-white font-semibold px-8 py-4 rounded-full shadow-glow hover:-translate-y-0.5 transition-all">
            Solicitar Demo
          </a>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl md:text-5xl font-bold">¿Por qué <span className="text-gradient">Persona</span> para empresas?</h2>
            <p className="mt-4 text-lg text-muted-foreground">Contratación más rápida, eficiente y humana</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((f) => (
              <div key={f.title} className="glass-strong rounded-2xl p-7 hover:-translate-y-1 hover:shadow-glow transition-all">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section className="py-24 bg-bg-light">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl md:text-5xl font-bold">Cómo funciona</h2>
            <p className="mt-4 text-lg text-muted-foreground">Simple y efectivo</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.t} className="text-center">
                <div className="mx-auto mb-5 w-20 h-20 rounded-full bg-gradient-brand flex items-center justify-center text-white text-3xl font-bold shadow-glow">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold mb-2">{s.t}</h3>
                <p className="text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="py-24 bg-gradient-brand-soft">
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold">Agenda una demo</h2>
            <p className="mt-4 text-lg text-muted-foreground">Cuéntanos sobre tu empresa y tus necesidades de contratación</p>
          </div>
          <DemoForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}

function DemoForm() {
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
      alert('Hubo un error enviando tu solicitud. Inténtalo de nuevo.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="glass-strong rounded-3xl p-10 text-center animate-fade-up">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center mb-5 shadow-glow">
          <CheckCircle2 className="w-9 h-9 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">¡Solicitud recibida!</h3>
        <p className="text-muted-foreground">Te contactaremos en las próximas 24 horas para agendar tu demo.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass-strong rounded-3xl p-8 md:p-10 space-y-4">
      <Field name="name" label="Nombre completo *" required />
      <Field name="email" label="Email corporativo *" type="email" required />
      <Field name="empresa" label="Empresa *" required />
      <Field name="cargo" label="Cargo" />
      <div>
        <label className="block text-sm font-medium mb-1.5">¿Qué tipo de talento necesitas?</label>
        <textarea name="mensaje" rows={4} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
      </div>
      <button type="submit" disabled={sending} className="w-full bg-gradient-brand text-white font-semibold py-3.5 rounded-xl shadow-glow hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed">
        {sending ? 'Enviando...' : 'Solicitar Demo'}
      </button>
    </form>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input {...props} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
    </div>
  );
}
