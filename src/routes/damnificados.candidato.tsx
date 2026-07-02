import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CVUpload } from "@/components/CVUpload";

export const Route = createFileRoute("/damnificados/candidato")({
  head: () => ({
    meta: [
      { title: "Persona — Registro candidato damnificado" },
      { name: "description", content: "Sube tu CV y regístrate en Persona como candidato afectado por el terremoto." },
      { property: "og:title", content: "Candidato damnificado — Persona" },
      { property: "og:description", content: "Registro para profesionales afectados por el terremoto con CV o experiencia formal." },
    ],
  }),
  component: DamnificadosCandidato,
});

function DamnificadosCandidato() {
  return (
    <>
      <Nav />
      <main className="pt-24 pb-20 min-h-screen">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium mb-5">
              <HeartHandshake className="w-4 h-4 text-primary" />
              Apoyo a damnificados
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Sube tu <span className="text-gradient">CV</span>
            </h1>
            <p className="text-muted-foreground">
              Regístrate con tu hoja de vida y te conectaremos con oportunidades reales lo antes posible.
            </p>
          </div>

          <CVUpload origen="damnificado" />
        </div>
      </main>
      <Footer />
    </>
  );
}
