import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { GuiaCVCard } from "@/components/GuiaCVCard";

export const Route = createFileRoute("/guia")({
  head: () => ({
    meta: [
      { title: "CV que Conecta — Guía digital | Persona" },
      { name: "description", content: "La guía digital para armar un CV que sí consigue entrevistas. Pago Móvil en Venezuela." },
      { property: "og:title", content: "CV que Conecta — Guía digital" },
      { property: "og:description", content: "Aprende a armar un CV que sí consigue entrevistas. Guía digital descargable." },
    ],
  }),
  component: GuiaPage,
});

function GuiaPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <section className="pt-32 pb-20 md:pt-40 bg-mesh">
        <div className="mx-auto max-w-2xl px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="text-gradient">CV que Conecta</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              La guía digital para armar un CV que sí consigue entrevistas.
            </p>
          </div>
          <GuiaCVCard variant="page" />
        </div>
      </section>
      <Footer />
    </div>
  );
}
