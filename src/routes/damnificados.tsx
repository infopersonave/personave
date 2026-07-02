import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { CheckCircle2, FileText, Upload, X, HeartHandshake } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { submitDamnificado } from "@/lib/forms.functions";

export const Route = createFileRoute("/damnificados")({
  head: () => ({
    meta: [
      { title: "Persona — Registro para damnificados del terremoto" },
      { name: "description", content: "Si fuiste afectado por el terremoto y buscas trabajo, regístrate aquí. Te conectamos con oportunidades reales." },
      { property: "og:title", content: "Registro damnificados — Persona" },
      { property: "og:description", content: "Registro rápido y gratuito para personas afectadas por el terremoto que buscan trabajo." },
    ],
  }),
  component: Damnificados,
});

function Damnificados() {
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const submit = useServerFn(submitDamnificado);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { alert("Sube tu CV en formato PDF"); return; }
    if (f.size > 5 * 1024 * 1024) { alert("Máximo 5MB"); return; }
    setFile(f);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      if (file) formData.set("cv", file);
      else formData.delete("cv");
      await submit({ data: formData });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Hubo un error enviando tu registro. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

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
              Regístrate y <span className="text-gradient">encuentra trabajo</span>
            </h1>
            <p className="text-muted-foreground">
              Si fuiste afectado por el terremoto, déjanos tus datos y te conectaremos con oportunidades reales lo antes posible.
            </p>
          </div>

          {submitted ? (
            <div className="glass-strong rounded-3xl p-10 text-center animate-fade-up">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center mb-5 shadow-glow">
                <CheckCircle2 className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">¡Registro recibido!</h3>
              <p className="text-muted-foreground">
                Gracias por registrarte. Nuestro equipo revisará tu información y te contactaremos con oportunidades pronto.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="glass-strong rounded-3xl p-7 md:p-8 shadow-card space-y-4">
              <Field name="nombre" label="Nombre completo *" required />
              <Field name="telefono" label="Teléfono / WhatsApp *" required placeholder="+58XXXXXXXXXX" />
              <Field name="correo" type="email" label="Correo (opcional)" />
              <Field name="ubicacion" label="Zona / ubicación *" required placeholder="Ej: Caracas, El Hatillo" />

              <div>
                <label className="block text-sm font-medium mb-1.5">¿Qué sabes hacer? / Experiencia *</label>
                <textarea
                  name="que_sabe_hacer"
                  required
                  rows={4}
                  placeholder="Ej: Soy electricista con 5 años de experiencia"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Disponibilidad *</label>
                <select
                  name="disponibilidad"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="" disabled>Selecciona una opción</option>
                  <option value="Inmediata">Inmediata</option>
                  <option value="Esta semana">Esta semana</option>
                  <option value="Próximas 2 semanas">Próximas 2 semanas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">CV (opcional, PDF)</label>
                {!file ? (
                  <div
                    onClick={() => inputRef.current?.click()}
                    className="cursor-pointer rounded-2xl border-2 border-dashed border-border p-6 text-center transition hover:border-primary/50 hover:bg-bg-light"
                  >
                    <Upload className="mx-auto w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Haz click para subir tu CV</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF · máx 5MB</p>
                    <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={onFile} className="hidden" />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-bg-light p-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button type="button" onClick={() => setFile(null)} className="p-1.5 rounded-lg hover:bg-background">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-gradient-brand text-white font-semibold py-3.5 rounded-xl shadow-glow hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? "Enviando..." : "Enviar registro"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
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
