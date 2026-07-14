import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, X, BookOpen, Upload } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getBcvEurRate, submitGuiaPurchase } from "@/lib/forms.functions";

const PRICE_EUR = 9.99;

export function GuiaCVCard({ variant = "inline" }: { variant?: "inline" | "page" }) {
  const [open, setOpen] = useState(false);
  const [eurRate, setEurRate] = useState<number | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);
  const [loadingRate, setLoadingRate] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchRate = useServerFn(getBcvEurRate);
  const submit = useServerFn(submitGuiaPurchase);

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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !montoBs) return;
    setSending(true);
    try {
      const form = e.target as HTMLFormElement;
      const fd = new FormData(form);
      fd.set("comprobante", file);
      fd.set("monto_bs", String(montoBs));
      await submit({ data: fd });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Hubo un error enviando tu compra. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div
        className={`rounded-[8px] p-6 md:p-7 text-white shadow-glow ${variant === "page" ? "" : ""}`}
        style={{ background: "linear-gradient(135deg, #5B8AFF 0%, #8B5CF6 50%, #EC4899 100%)", fontFamily: "Outfit, system-ui, sans-serif" }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-[8px] bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl md:text-2xl font-bold">CV que Conecta</h3>
              <span className="text-[10px] uppercase tracking-wider bg-white/20 rounded-[8px] px-2 py-0.5">Opcional</span>
            </div>
            <p className="text-sm text-white/90 mb-3">La guía digital para armar un CV que sí consigue entrevistas.</p>
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
              className="bg-white text-[#8B5CF6] font-bold px-5 py-2.5 rounded-[8px] hover:-translate-y-0.5 transition-all disabled:opacity-60"
            >
              Comprar guía
            </button>
            {variant === "inline" && (
              <p className="mt-3 text-xs text-white/80">Puedes saltar este paso y subir tu CV igual, sin comprar nada.</p>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-start md:items-center justify-center p-4 overflow-y-auto" onClick={() => !sending && !submitted && setOpen(false)}>
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
                <button onClick={() => { setOpen(false); setSubmitted(false); setFile(null); }} className="text-sm font-semibold text-[#8B5CF6]">Cerrar</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <h3 className="text-lg font-bold">Comprar CV que Conecta</h3>
                  <button onClick={() => setOpen(false)} className="p-1.5 rounded-[8px] hover:bg-bg-light"><X className="w-5 h-5" /></button>
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

                  <form onSubmit={onSubmit} className="space-y-3">
                    <Field name="nombre" label="Nombre completo *" required />
                    <Field name="email" type="email" label="Email *" required />
                    <Field name="telefono" type="tel" label="Teléfono *" required placeholder="+58XXXXXXXXXX" />
                    <Field name="referencia_pago" label="Referencia del Pago Móvil *" required />

                    <div>
                      <label className="block text-sm font-medium mb-1.5">Comprobante de pago *</label>
                      <label className="cursor-pointer flex items-center gap-3 rounded-[8px] border-2 border-dashed border-border p-4 hover:border-[#8B5CF6] transition">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground truncate">
                          {file ? file.name : "Sube una imagen o PDF del comprobante"}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          required
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            if (f.size > 10 * 1024 * 1024) { alert("Máximo 10MB"); return; }
                            setFile(f);
                          }}
                        />
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={sending || !file || !montoBs}
                      className="w-full text-white font-semibold py-3.5 rounded-[8px] shadow-glow hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(135deg, #5B8AFF, #8B5CF6, #EC4899)" }}
                    >
                      {sending ? "Enviando..." : "Enviar comprobante"}
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

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input {...props} className="w-full rounded-[8px] border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20" />
    </div>
  );
}
