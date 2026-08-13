import { useState, useRef, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { Upload, FileText, CheckCircle2, X, Loader2, AlertCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { submitCV, uploadCVFile } from "@/lib/forms.functions";

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; file: File }
  | { status: "done"; file: File; signedUrl: string; filename: string }
  | { status: "error"; file: File; message: string };

export function CVUpload({ origen }: { origen?: string } = {}) {
  const [upload, setUpload] = useState<UploadState>({ status: "idle" });
  const [dragging, setDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doUpload = useServerFn(uploadCVFile);
  const submit = useServerFn(submitCV);

  const startUpload = async (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (ext !== "pdf" && f.type !== "application/pdf") {
      setUpload({ status: "error", file: f, message: "Por favor sube tu CV en formato PDF." });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setUpload({ status: "error", file: f, message: "El archivo supera el máximo de 5MB." });
      return;
    }
    setUpload({ status: "uploading", file: f });
    try {
      const fd = new FormData();
      fd.set("cv", f);
      const res = await doUpload({ data: fd });
      if (!res.signedUrl) throw new Error("No signed URL returned");
      setUpload({ status: "done", file: f, signedUrl: res.signedUrl, filename: res.filename });
    } catch (err) {
      console.error(err);
      setUpload({ status: "error", file: f, message: "No pudimos subir tu CV. Intenta de nuevo." });
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void startUpload(f);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void startUpload(f);
  };

  const clearFile = () => {
    setUpload({ status: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  };

  const canSubmit = upload.status === "done" && !sending;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!canSubmit || upload.status !== "done") return;
    setSending(true);
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      formData.delete("cv");
      formData.set("cv_url", upload.signedUrl);
      formData.set("cv_filename", upload.filename);
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
        <button onClick={() => { setSubmitted(false); clearFile(); }} className="text-sm font-semibold text-gradient">Enviar otro</button>
      </div>
    );
  }

  const showFileError =
    upload.status === "error" ||
    (attempted && upload.status === "idle") ||
    (attempted && upload.status === "uploading");

  const fileErrorMsg =
    upload.status === "error"
      ? upload.message
      : upload.status === "uploading"
        ? "Espera a que termine la subida del CV antes de enviar."
        : "Debes adjuntar tu CV en PDF para poder enviar el formulario.";

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
        {origen ? <input type="hidden" name="origen" value={origen} /> : null}

        {upload.status === "idle" || upload.status === "error" ? (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                showFileError
                  ? "border-red-400 bg-red-50"
                  : dragging
                    ? "border-primary bg-gradient-brand-soft scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:bg-bg-light"
              }`}
            >
              <Upload className="mx-auto w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-semibold">Arrastra tu CV aquí</p>
              <p className="text-sm text-muted-foreground mt-1">o haz click para seleccionar</p>
              <p className="text-xs text-muted-foreground mt-3">PDF · máx 5MB</p>
              <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={onChange} className="hidden" />
            </div>
            {showFileError && (
              <p className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5" />
                {fileErrorMsg}
              </p>
            )}
          </>
        ) : (
          <>
            <div
              className={`flex items-center gap-3 rounded-2xl border p-4 ${
                upload.status === "done" ? "border-emerald-500 bg-emerald-50" : "border-border bg-bg-light"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0">
                {upload.status === "uploading" ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <FileText className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{upload.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {upload.status === "uploading"
                    ? "Subiendo CV..."
                    : `Listo · ${(upload.file.size / 1024).toFixed(0)} KB`}
                </p>
              </div>
              <button
                type="button"
                onClick={clearFile}
                disabled={upload.status === "uploading" || sending}
                className="p-1.5 rounded-lg hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {attempted && upload.status === "uploading" && (
              <p className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5" />
                Espera a que termine la subida del CV antes de enviar.
              </p>
            )}

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
            <Input name="edad" type="number" label="Edad *" required min={16} max={80} />
            <Input
              name="salario_esperado_usd"
              type="number"
              label="¿Cuánto esperas ganar aprox? (USD mensuales) *"
              required
              min={0}
              placeholder="Ej: 800"
            />
            <div>
              <label className="block text-sm font-medium mb-1.5">País *</label>
              <select
                name="pais"
                required
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {PAISES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Estado / Provincia *</label>
              {pais === "Venezuela" ? (
                <select
                  name="region"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="" disabled>Selecciona tu estado</option>
                  {ESTADOS_VE.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              ) : (
                <input
                  name="region"
                  required
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">¿Qué oportunidades buscas?</label>
              <textarea name="oportunidades" rows={3} className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>


            <button
              type="submit"
              disabled={!canSubmit}
              aria-disabled={!canSubmit}
              className="w-full bg-gradient-brand text-white font-semibold py-3.5 rounded-xl shadow-glow hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-glow"
            >
              {sending
                ? "Enviando..."
                : upload.status === "uploading"
                  ? "Subiendo CV..."
                  : "Enviar mi perfil"}
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
