import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CVUpload } from "@/components/CVUpload";
import { FAQ } from "@/components/FAQ";
import { Reviews } from "@/components/Reviews";
import { GuiaCVCard } from "@/components/GuiaCVCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Persona — La nueva red de talento en Venezuela" },
      { name: "description", content: "Conectamos empresas con personas correctas. Talento validado, contratación humana, oportunidades reales en Venezuela." },
      { property: "og:title", content: "Persona — Red de talento en Venezuela" },
      { property: "og:description", content: "Conectamos empresas con personas correctas. Talento validado, contratación humana, oportunidades reales." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: "🎯", title: "Talento Validado", desc: "Cada perfil es revisado y validado por nuestro equipo. No eres un número en una base de datos." },
  { icon: "⚡", title: "Matching Rápido", desc: "Conectamos empresas con los candidatos correctos, sin procesos eternos ni esperas innecesarias." },
  { icon: "🤝", title: "Conexión Humana", desc: "Creemos en las personas, no en algoritmos fríos. Tu historia profesional importa." },
  { icon: "🌎", title: "Alcance Global", desc: "Conectamos talento venezolano con oportunidades en cualquier parte del mundo. Sin fronteras." },
  { icon: "📈", title: "Crecimiento Real", desc: "No solo conseguimos trabajo, construimos carreras profesionales de largo plazo." },
  { icon: "🔒", title: "Confidencial", desc: "Tu información está segura. Control total sobre quién ve tu perfil." },
];

const stats = [
  { v: "🧠", l: "Validación inteligente con tecnología y criterio humano" },
  { v: "100%", l: "Gratis para profesionales" },
  { v: "🇻🇪", l: "Talento venezolano, oportunidades globales" },
];

const steps = [
  { t: "Sube tu CV", d: "Completa tu perfil con tu experiencia y habilidades" },
  { t: "Validación", d: "Nuestro equipo revisa y valida tu perfil profesional" },
  { t: "Matching", d: "Te conectamos con oportunidades que encajan contigo" },
  { t: "¡Contratado!", d: "Inicia en tu nueva oportunidad profesional" },
];

function Index() {
  return (
    <div className="min-h-screen">
      <Nav />

      {/* HERO */}
      <section id="hero" className="relative pt-32 pb-12 md:pt-40 md:pb-16 overflow-hidden bg-mesh">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="animate-fade-up lg:pt-10">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
                <span className="text-gradient">La nueva red de talento</span> en Venezuela
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl">
                Conectamos empresas con personas correctas. Talento validado, contratación humana, oportunidades reales.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {["✓ Talento validado", "✓ Proceso rápido", "✓ Talento venezolano, alcance global"].map((b) => (
                  <span key={b} className="px-4 py-2 rounded-full bg-white/70 backdrop-blur border border-border text-sm font-medium">{b}</span>
                ))}
              </div>
            </div>
            <div className="animate-fade-up">
              <div className="glass-strong rounded-3xl p-8 md:p-10 border border-primary/10 shadow-glow">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-brand-soft border border-primary/20 text-xs font-semibold mb-4">
                  Para empresas
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">¿Buscas talento validado?</h2>
                <p className="text-muted-foreground mb-6">
                  Cuéntanos qué perfil necesitas y te enviamos candidatos pre-filtrados en 48-72 horas.
                </p>
                <ul className="space-y-2 mb-8 text-sm">
                  {[
                    "Shortlists de 3-5 candidatos",
                    "Validación humana + tecnología",
                    "Proceso confidencial y rápido",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/empresas"
                  hash="contacto"
                  className="inline-flex items-center justify-center w-full bg-gradient-brand text-white font-semibold px-6 py-3.5 rounded-xl shadow-glow hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  Solicitar demo
                </Link>
              </div>
            </div>
          </div>

          {/* ÚNETE A LA RED + GUÍA */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold">Para profesionales</h2>
              <p className="mt-2 text-muted-foreground">Únete gratis o potencia tu CV con nuestra guía</p>
            </div>
            <div className="grid md:grid-cols-[2fr_1fr] gap-5 items-start">
              <CVUpload />
              <GuiaCVCard variant="inline" />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 bg-bg-light">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {stats.map((s) => {
              const isFlag = s.v === "🇻🇪";
              const isBrain = s.v === "🧠";
              return (
                <div key={s.l} className="glass-strong rounded-2xl p-8 text-center hover:-translate-y-1 transition-transform">
                  {isFlag ? (
                    <div className="mb-3 flex justify-center">
                      <img
                        src="https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/1f1fb-1f1ea.svg"
                        alt="Bandera de Venezuela"
                        className="h-14 md:h-16 w-auto"
                      />
                    </div>
                  ) : isBrain ? (
                    <div className="mb-3 flex justify-center">
                      <svg width="0" height="0" className="absolute">
                        <defs>
                          <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="50%" stopColor="#EC4899" />
                            <stop offset="100%" stopColor="#3B82F6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <Brain
                        className="h-14 w-14 md:h-16 md:w-16"
                        style={{ stroke: "url(#brainGradient)" }}
                        strokeWidth={1.75}
                      />
                    </div>
                  ) : (
                    <div className="text-5xl md:text-6xl font-bold text-gradient mb-3">{s.v}</div>
                  )}
                  <div className="text-sm text-muted-foreground font-medium">{s.l}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl md:text-5xl font-bold">¿Por qué <span className="text-gradient">Persona</span>?</h2>
            <p className="mt-4 text-lg text-muted-foreground">No somos una bolsa de empleo tradicional</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
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
            <p className="mt-4 text-lg text-muted-foreground">Simple, rápido, efectivo</p>
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

      {/* FAQ */}
      <section className="py-24 bg-bg-light">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">Preguntas frecuentes</h2>
          </div>
          <FAQ />
        </div>
      </section>

      {/* REVIEWS */}
      <Reviews />

      {/* CTA */}
      <section id="cta-final" className="py-24 bg-gradient-brand-soft">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="text-gradient">¿Listo para tu próxima oportunidad?</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Únete a cientos de profesionales que ya encontraron su match perfecto
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#unete" className="bg-gradient-brand text-white font-semibold px-8 py-4 rounded-full shadow-glow hover:-translate-y-0.5 transition-all">
              Sube tu CV ahora
            </a>
            <Link to="/empresas" className="border-2 border-primary text-primary font-semibold px-8 py-4 rounded-full hover:bg-primary hover:text-white transition-all">
              Soy empresa
            </Link>
            <Link to="/damnificados" className="bg-white/90 text-[#8B5CF6] font-semibold px-8 py-4 rounded-full hover:bg-white transition-all">
              Damnificados del terremoto →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
