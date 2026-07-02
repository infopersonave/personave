import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Hammer, HeartHandshake, ArrowRight } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/damnificados/")({
  head: () => ({
    meta: [
      { title: "Persona — Registro para damnificados del terremoto" },
      { name: "description", content: "Si fuiste afectado por el terremoto y buscas trabajo, elige tu ruta de registro." },
      { property: "og:title", content: "Registro damnificados — Persona" },
      { property: "og:description", content: "Elige la opción que mejor describa tu perfil profesional." },
    ],
  }),
  component: DamnificadosChooser,
});

function DamnificadosChooser() {
  return (
    <>
      <Nav />
      <main className="pt-24 pb-20 min-h-screen">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium mb-5">
              <HeartHandshake className="w-4 h-4 text-primary" />
              Apoyo a damnificados
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              ¿Cómo quieres <span className="text-gradient">registrarte</span>?
            </h1>
            <p className="text-muted-foreground">
              Elige la opción que mejor describa tu situación para conectarte con las oportunidades correctas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <Link
              to="/damnificados/candidato"
              className="group glass-strong rounded-3xl p-7 shadow-card hover:shadow-xl transition-all hover:-translate-y-1 text-left flex flex-col"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow mb-5">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">Tengo CV o experiencia profesional</h2>
              <p className="text-sm text-muted-foreground flex-1">
                Para quienes ya cuentan con una hoja de vida formal, estudios o experiencia en empresas y quieren postularse a roles profesionales.
              </p>
              <div className="flex items-center gap-2 mt-5 text-sm font-semibold text-primary">
                Continuar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/damnificados/informal"
              className="group glass-strong rounded-3xl p-7 shadow-card hover:shadow-xl transition-all hover:-translate-y-1 text-left flex flex-col"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow mb-5">
                <Hammer className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">Tengo experiencia trabajando pero no una hoja de vida formal</h2>
              <p className="text-sm text-muted-foreground flex-1">
                Para oficios y experiencia práctica (electricistas, albañiles, cocineros, cuidadores, etc.) que no tienen un CV escrito. Solo cuéntanos qué sabes hacer.
              </p>
              <div className="flex items-center gap-2 mt-5 text-sm font-semibold text-primary">
                Continuar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
