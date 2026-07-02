import { useState, useRef, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { Upload, FileText, CheckCircle2, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { submitCV } from "@/lib/forms.functions";

export function CVUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    const allowedExts = ["pdf", "jpg", "jpeg", "png", "webp", "heic", "doc", "docx"];
    const allowedTypes = [
      "application/pdf",
      "image/jpeg", "image/png", "image/webp", "image/heic",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedExts.includes(ext) && !allowedTypes.includes(f.type)) {
      alert("Por favor sube tu CV en formato PDF, imagen (JPG, PNG, WEBP) o Word (.doc, .docx)");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert("Máximo 5MB");
      return;
    }
    setFile(f);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const submit = useServerFn(submitCV);
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSending(true);

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      formData.set("cv", file);

      await submit({ data: formData });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Hubo un error enviando tu perfil. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-strong rounded-3xl p-10 text-center animate-fade-up">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center mb-5 shadow-glow">
          <CheckCircle2 className="w-9 h-9 text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2">¡Perfil recibido!</h3>
        <p className="text-muted-foreground mb-6">Nuestro equipo revisará tu perfil en 24-48 horas y te contactaremos con oportunidades reales.</p>
        <button onClick={() => { setSubmitted(false); setFile(null); }} className="text-sm font-semibold text-gradient">Enviar otro</button>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-3xl p-7 md:p-8 shadow-card">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="9" r="3.5" fill="white" />
            <path d="M4 21 Q5 15 12 15 Q19 15 20 21 Z" fill="white" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold">Únete a la red</h3>
          <p className="text-sm text-muted-foreground">Sube tu CV y accede a oportunidades reales</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${dragging ? "border-primary bg-gradient-brand-soft scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-bg-light"}`}
          >
            <Upload className="mx-auto w-10 h-10 text-muted-foreground mb-3" />
            <p className="font-semibold">Arrastra tu CV aquí</p>
            <p className="text-sm text-muted-foreground mt-1">o haz click para seleccionar</p>
            <p className="text-xs text-muted-foreground mt-3">PDF, imagen o Word · máx 5MB</p>
            <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx,application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={onChange} className="hidden" />
          </div>
        ) : (
          <>
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

            <Input name="name" label="Nombre completo *" required />
            <Input name="email" type="email" label="Email *" required />
            <Input
              name="phone"
              type="tel"
              label="Teléfono *"
              required
              placeholder="+58XXXXXXXXXX"
              pattern="^\+[0-9]{8,16}$"
              title="Formato inválido. Usa el formato internacional: +58XXXXXXXXXX"
              onInvalid={(e) => e.currentTarget.setCustomValidity("Formato inválido. Usa el formato internacional: +58XXXXXXXXXX")}
              onInput={(e) => e.currentTarget.setCustomValidity("")}
              help="Ingresa tu número con código de país, sin espacios ni guiones. Ejemplo: +58XXXXXXXXXX"
            />
            <Input name="linkedin" label="LinkedIn (opcional)" />
            <div>
              <label className="block text-sm font-medium mb-1.5">¿Qué oportunidades buscas?</label>
              <textarea name="oportunidades" rows={3} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>

            <button type="submit" disabled={sending} className="w-full bg-gradient-brand text-white font-semibold py-3.5 rounded-xl shadow-glow hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed">
              {sending ? "Enviando..." : "Enviar mi perfil"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

function Input({ label, help, ...props }: { label: string; help?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input {...props} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
      {help ? <p className="mt-1.5 text-xs text-muted-foreground">{help}</p> : null}
    </div>
  );
}
