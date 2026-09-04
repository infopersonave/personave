import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, X, Upload, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getBcvEurRate, submitGuiaPurchase, uploadComprobante } from "@/lib/forms.functions";

const PRICE_EUR = 9.99;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; file: File }
  | { status: "done"; file: File; submissionId: string; path: string; signedUrl: string }
  | { status: "error"; file: File; message: string };

export function GuiaCVCard({ variant = "inline" }: { variant?: "inline" | "page" }) {
  const [open, setOpen] = useState(false);
  const [eurRate, setEurRate] = useState<number | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [referencia, setReferencia] = useState("");
  const [upload, setUpload] = useState<UploadState>({ status: "idle" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchRate = useServerFn(getBcvEurRate);
  const submit = useServerFn(submitGuiaPurchase);
  const doUpload = useServerFn(uploadComprobante);

  useEffect(() => {
    let cancelled = false;
    setLoadingRate(true);
    setRateError(null);
    fetchRate()
      .then((r) => { if (!cancelled) setEurRate(r.eur); })
      .catch(() => { if (!cancelled) setRateError("No pudimos obtener la tasa BCV del día. Intenta más tarde."); })
      .finally(() => { if (!cancelled) setLoadingRate(false); });
    return () => { cancelled = true; };
  }, [fetchRate]);

  const montoBs = eurRate ? +(PRICE_EUR * eurRate).toFixed(2) : null;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = "Ingresa tu nombre completo.";
    if (!email.trim()) e.email = "Ingresa tu email.";
    else if (!EMAIL_RE.test(email.trim())) e.email = "Email inválido. Debe contener @ y un dominio válido.";
    if (!telefono.trim()) e.telefono = "Ingresa tu teléfono.";
    if (!referencia.trim()) e.referencia = "Ingresa la referencia del Pago Móvil.";
    if (upload.status === "idle") e.comprobante = "Sube el comprobante de pago.";
    else if (upload.status === "uploading") e.comprobante = "Subiendo comprobante… espera a que termine.";
    else if (upload.status === "error") e.comprobante = upload.message || "Error subiendo el comprobante. Intenta de nuevo.";
    return e;
  }, [nombre, email, telefono, referencia, upload]);

  const showError = (key: string) => (touched[key] || attemptedSubmit) && errors[key];
  const canSubmit = Object.keys(errors).length === 0 && !!montoBs && !sending && upload.status === "done";

  const handleFile = async (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      setUpload({ status: "error", file: f, message: "Máximo 10MB." });
      return;
    }
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["jpg", "jpeg", "png", "webp", "heic", "pdf"].includes(ext)) {
      setUpload({ status: "error", file: f, message: "Formato no permitido. Usa JPG, PNG, WEBP, HEIC o PDF." });
      return;
    }
    setUpload({ status: "uploading", file: f });
    try {
      const fd = new FormData();
      fd.set("comprobante", f);
      const res = await doUpload({ data: fd });
      setUpload({ status: "done", file: f, submissionId: res.submissionId, path: res.path, signedUrl: res.signedUrl });
    } catch (err) {
      console.error(err);
      setUpload({ status: "error", file: f, message: "No pudimos subir el comprobante. Intenta de nuevo." });
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    if (!canSubmit || upload.status !== "done" || !montoBs) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.set("nombre", nombre.trim());
      fd.set("email", email.trim());
      fd.set("telefono", telefono.trim());
      fd.set("referencia_pago", referencia.trim());
      fd.set("monto_bs", String(montoBs));
      fd.set("submission_id", upload.submissionId);
      fd.set("comprobante_path", upload.path);
      fd.set("comprobante_url", upload.signedUrl);
      fd.set("comprobante_filename", upload.file.name);
      await submit({ data: fd });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Hubo un error enviando tu compra. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const closeModal = () => {
    if (sending || upload.status === "uploading") return;
    setOpen(false);
  };

  return (
    <>
      <div
        className="rounded-3xl p-7 text-white shadow-glow"
        style={{ background: "linear-gradient(135deg, #5B8AFF 0%, #8B5CF6 50%, #EC4899 100%)", fontFamily: "Outfit, system-ui, sans-serif" }}
      >
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <h3 className="text-xl md:text-2xl font-bold">CV que Conecta</h3>
              <span className="text-[10px] uppercase tracking-wider font-bold bg-white/25 text-white rounded-full px-2.5 py-0.5">Guía premium</span>
            </div>
            <p className="text-sm text-white/90 mb-4">Guía práctica para estructurar tu currículum y destacar ante reclutadores.</p>

            <ul className="space-y-2 mb-5">
              {[
                "Plantillas listas para usar",
                "Ejemplos de perfil profesional",
                "Tips de reclutadores",
                "Formato que pasa filtros ATS",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-white/90">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-2xl font-bold">€{PRICE_EUR.toFixed(2)}</span>
              {loadingRate && <span className="text-xs text-white/80">Calculando Bs…</span>}
              {rateError && <span className="text-xs text-white/90 bg-black/20 rounded-[8px] px-2 py-1">{rateError}</span>}
              {montoBs && !rateError && (
                <span className="text-xs text-white/90">
                  Bs {montoBs.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · tasa BCV hoy
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(true)}
              disabled={!montoBs}
              className="bg-white text-[#8B5CF6] font-bold px-5 py-2.5 rounded-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 shadow-lg"
            >
              Comprar guía
            </button>
            {variant === "inline" && (
              <p className="mt-3 text-xs text-white/80">Opcional — puedes unirte a la red sin comprar la guía.</p>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-start md:items-center justify-center p-4 overflow-y-auto" onClick={closeModal}>
          <div
            className="bg-white rounded-[8px] w-full max-w-lg my-8 shadow-2xl"
            style={{ fontFamily: "Outfit, system-ui, sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="p-8 text-center">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "linear-gradient(135deg, #5B8AFF, #8B5CF6, #EC4899)" }}>
                  <CheckCircle2 className="w-9 h-9 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">¡Gracias por tu compra!</h3>
                <p className="text-muted-foreground mb-6">
                  Recibimos tu comprobante y lo estamos revisando. En cuanto lo confirmemos, te llega tu guía a este correo.
                </p>
                <button
                  onClick={() => {
                    setOpen(false); setSubmitted(false);
                    setNombre(""); setEmail(""); setTelefono(""); setReferencia("");
                    setUpload({ status: "idle" }); setTouched({}); setAttemptedSubmit(false);
                  }}
                  className="text-sm font-semibold text-[#8B5CF6]"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <h3 className="text-lg font-bold">Comprar CV que Conecta</h3>
                  <button onClick={closeModal} disabled={sending || upload.status === "uploading"} className="p-1.5 rounded-[8px] hover:bg-bg-light disabled:opacity-40"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="rounded-[8px] p-4 text-white" style={{ background: "linear-gradient(135deg, #5B8AFF, #8B5CF6, #EC4899)" }}>
                    <p className="text-xs uppercase tracking-wider font-semibold text-white/80 mb-2">Pago Móvil</p>
                    <ul className="text-sm space-y-1">
                      <li><span className="text-white/80">Banco:</span> <strong>Mercantil (0105)</strong></li>
                      <li><span className="text-white/80">Cédula:</span> <strong>29551944</strong></li>
                      <li><span className="text-white/80">Teléfono:</span> <strong>0414-3126355</strong></li>
                      <li className="pt-1 border-t border-white/20 mt-2">
                        <span className="text-white/80">Monto a pagar:</span>{" "}
                        <strong className="text-lg">
                          Bs {montoBs?.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>{" "}
                        <span className="text-xs text-white/80">(€{PRICE_EUR.toFixed(2)} · tasa BCV hoy)</span>
                      </li>
                    </ul>
                  </div>

                  <form onSubmit={onSubmit} noValidate className="space-y-3">
                    <Field
                      label="Nombre completo *"
                      value={nombre}
                      onChange={(v) => setNombre(v)}
                      onBlur={() => setTouched((t) => ({ ...t, nombre: true }))}
                      error={showError("nombre") ? errors.nombre : undefined}
                    />
                    <Field
                      label="Email *"
                      type="email"
                      value={email}
                      onChange={(v) => setEmail(v)}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      error={showError("email") ? errors.email : undefined}
                    />
                    <Field
                      label="Teléfono *"
                      type="tel"
                      placeholder="+58XXXXXXXXXX"
                      value={telefono}
                      onChange={(v) => setTelefono(v)}
                      onBlur={() => setTouched((t) => ({ ...t, telefono: true }))}
                      error={showError("telefono") ? errors.telefono : undefined}
                    />
                    <Field
                      label="Referencia del Pago Móvil *"
                      value={referencia}
                      onChange={(v) => setReferencia(v)}
                      onBlur={() => setTouched((t) => ({ ...t, referencia: true }))}
                      error={showError("referencia") ? errors.referencia : undefined}
                    />

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Comprobante de pago *</label>
                      <label className={`cursor-pointer flex items-center gap-3 rounded-[8px] border-2 border-dashed p-4 transition ${
                        upload.status === "done" ? "border-emerald-500 bg-emerald-50" :
                        upload.status === "error" ? "border-red-400 bg-red-50" :
                        "border-border hover:border-[#8B5CF6]"
                      }`}>
                        {upload.status === "uploading" ? (
                          <Loader2 className="w-5 h-5 text-[#8B5CF6] animate-spin" />
                        ) : upload.status === "done" ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Upload className="w-5 h-5 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground truncate flex-1">
                          {upload.status === "uploading" && `Subiendo comprobante… (${upload.file.name})`}
                          {upload.status === "done" && `Listo · ${upload.file.name}`}
                          {upload.status === "error" && (upload.file?.name ?? "Error")}
                          {upload.status === "idle" && "Sube una imagen o PDF del comprobante"}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          disabled={upload.status === "uploading" || sending}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setTouched((t) => ({ ...t, comprobante: true }));
                            void handleFile(f);
                          }}
                        />
                      </label>
                      {showError("comprobante") && (
                        <p className="mt-1.5 text-xs text-red-600">{errors.comprobante}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!canSubmit}
                      aria-disabled={!canSubmit}
                      className="w-full text-white font-semibold py-3.5 rounded-[8px] shadow-glow hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      style={{ background: "linear-gradient(135deg, #5B8AFF, #8B5CF6, #EC4899)" }}
                    >
                      {sending
                        ? "Enviando..."
                        : upload.status === "uploading"
                          ? "Subiendo comprobante..."
                          : "Enviar comprobante"}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label, value, onChange, onBlur, error, type = "text", placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        className={`w-full rounded-[8px] border bg-background px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
          error ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "border-input focus:border-[#8B5CF6] focus:ring-[#8B5CF6]/20"
        }`}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
