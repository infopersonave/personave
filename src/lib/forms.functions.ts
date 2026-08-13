import { createServerFn } from "@tanstack/react-start";

const MAKE_CV_WEBHOOK_URL = "https://hook.us2.make.com/5hbzwu0mqd0r35vebv13lmtkqkhvgqdj";
const BACKUP_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyQ0y9UUquM_DydCFOOhDtQ0GMjgEQoDI2CZAZxg4VluPYtTjUeOrHUqz7P3_vdtyLaDw/exec";
const MAKE_DAMNIFICADOS_WEBHOOK_URL = "https://hook.us2.make.com/qogs1f0mq820iihb66ubch7p3o0elond";
const MAKE_GUIA_WEBHOOK_URL = "https://hook.us2.make.com/hbgmv6r16emddjx4o57r8yhiwk6bwhhd";

export const getBcvEurRate = createServerFn({ method: "GET" }).handler(async () => {
  const res = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", { headers: { accept: "application/json" } });
  // ve.dolarapi.com exposes /v1/dolares/oficial (USD BCV). For EUR use /v1/euros/oficial
  let eur: number | null = null;
  try {
    const r2 = await fetch("https://ve.dolarapi.com/v1/euros/oficial", { headers: { accept: "application/json" } });
    if (r2.ok) {
      const j = await r2.json();
      if (typeof j?.promedio === "number") eur = j.promedio;
      else if (typeof j?.compra === "number") eur = j.compra;
    }
  } catch {}
  if (!eur && res.ok) {
    // Fallback: derive from USD rate * EUR/USD? Not accurate — just fail.
  }
  if (!eur || !isFinite(eur) || eur <= 0) throw new Error("No se pudo obtener la tasa EUR del BCV");
  return { eur, fetched_at: new Date().toISOString() };
});

export const uploadComprobante = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const file = data.get("comprobante");
    if (!(file instanceof File) || file.size === 0) throw new Error("Comprobante is required");
    if (file.size > 10 * 1024 * 1024) throw new Error("Comprobante exceeds 10MB");
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const allowed = ["jpg", "jpeg", "png", "webp", "heic", "pdf"];
    if (!allowed.includes(ext)) throw new Error("Invalid file type");
    return { file, ext };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const submissionId = crypto.randomUUID();
    const path = `submissions/${submissionId}/comprobante.${data.ext}`;
    const bytes = new Uint8Array(await data.file.arrayBuffer());
    const { error: upErr } = await supabaseAdmin.storage
      .from("comprobantes")
      .upload(path, bytes, { contentType: data.file.type || "application/octet-stream", upsert: false });
    if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
    const { data: signed, error: signedErr } = await supabaseAdmin.storage
      .from("comprobantes")
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    if (signedErr || !signed) throw new Error("Could not create signed URL");
    return { submissionId, path, filename: data.file.name, signedUrl: signed.signedUrl };
  });

export const submitGuiaPurchase = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const nombre = String(data.get("nombre") ?? "").trim().slice(0, 200);
    const email = String(data.get("email") ?? "").trim().slice(0, 200);
    const telefono = String(data.get("telefono") ?? "").trim().slice(0, 50);
    const referencia_pago = String(data.get("referencia_pago") ?? "").trim().slice(0, 100);
    const monto_bs = Number(String(data.get("monto_bs") ?? "0"));
    const submissionId = String(data.get("submission_id") ?? "").trim();
    const comprobante_path = String(data.get("comprobante_path") ?? "").trim();
    const comprobante_url = String(data.get("comprobante_url") ?? "").trim();
    const comprobante_filename = String(data.get("comprobante_filename") ?? "").trim();
    if (!nombre || !email || !telefono || !referencia_pago) throw new Error("Missing required fields");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
    if (!submissionId || !comprobante_path || !comprobante_url) throw new Error("Comprobante upload not completed");
    return { nombre, email, telefono, referencia_pago, monto_bs, submissionId, comprobante_path, comprobante_url, comprobante_filename };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const metadataFile = new File(
      [JSON.stringify({
        nombre: data.nombre, email: data.email, telefono: data.telefono,
        referencia_pago: data.referencia_pago, monto_bs: data.monto_bs,
        comprobante_path: data.comprobante_path, comprobante_filename: data.comprobante_filename,
        created_at: new Date().toISOString(),
      }, null, 2)],
      "metadata.json",
      { type: "application/json" },
    );
    await supabaseAdmin.storage
      .from("comprobantes")
      .upload(`submissions/${data.submissionId}/metadata.json`, metadataFile, { contentType: "application/json", upsert: true });

    const payload = {
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      monto_bs: data.monto_bs,
      referencia_pago: data.referencia_pago,
      comprobante_url: data.comprobante_url,
    };

    const res = await fetch(MAKE_GUIA_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Make webhook failed (status ${res.status}): ${text.slice(0, 200)}`);
    }
    return { success: true };
  });

export const submitDamnificado = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const nombre = String(data.get("nombre") ?? "").trim().slice(0, 200);
    const telefono = String(data.get("telefono") ?? "").trim().slice(0, 50);
    const correo = String(data.get("correo") ?? "").trim().slice(0, 200);
    const ubicacion = String(data.get("ubicacion") ?? "").trim().slice(0, 300);
    const que_sabe_hacer = String(data.get("que_sabe_hacer") ?? "").trim().slice(0, 2000);
    const disponibilidad = String(data.get("disponibilidad") ?? "").trim().slice(0, 50);
    if (!nombre || !telefono || !ubicacion || !que_sabe_hacer || !disponibilidad) {
      throw new Error("Missing required fields");
    }
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) throw new Error("Invalid email");
    const file = data.get("cv");
    let cvFile: File | null = null;
    let cvExt = "";
    if (file instanceof File && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) throw new Error("File exceeds 5MB");
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const allowedExts = ["pdf", "jpg", "jpeg", "png", "webp", "heic", "doc", "docx"];
      const allowedTypes = [
        "application/pdf",
        "image/jpeg", "image/png", "image/webp", "image/heic",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedExts.includes(ext)) throw new Error("Invalid file type");
      if (file.type && !allowedTypes.includes(file.type)) throw new Error("Invalid file type");
      cvFile = file;
      cvExt = ext;
    }
    return { nombre, telefono, correo, ubicacion, que_sabe_hacer, disponibilidad, cvFile, cvExt };
  })
  .handler(async ({ data }) => {
    let cv_url = "";
    if (data.cvFile) {
      try {
        const { uploadCVAndSign } = await import("./forms.server");
        cv_url = await uploadCVAndSign(data.cvFile, data.cvExt || "pdf", {
          nombre: data.nombre,
          telefono: data.telefono,
          correo: data.correo,
          ubicacion: data.ubicacion,
          que_sabe_hacer: data.que_sabe_hacer,
          disponibilidad: data.disponibilidad,
          source: "damnificados",
        });
      } catch (e) {
        console.error("[submitDamnificado] upload FAILED", e);
      }
    }

    const payload = {
      nombre: data.nombre,
      telefono: data.telefono,
      correo: data.correo,
      ubicacion: data.ubicacion,
      que_sabe_hacer: data.que_sabe_hacer,
      disponibilidad: data.disponibilidad,
      cv_url,
    };

    const res = await fetch(MAKE_DAMNIFICADOS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Make webhook failed (status ${res.status}): ${text.slice(0, 200)}`);
    }
    return { success: true, cv_url };
  });

export const uploadCVFile = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const file = data.get("cv");
    if (!(file instanceof File)) throw new Error("CV file is required");
    if (file.size === 0) throw new Error("Empty file");
    if (file.size > 5 * 1024 * 1024) throw new Error("File exceeds 5MB");
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (ext !== "pdf") throw new Error("Invalid file type");
    if (file.type && file.type !== "application/pdf") throw new Error("Invalid file type");
    return { file, ext };
  })
  .handler(async ({ data }) => {
    const { uploadCVAndSign } = await import("./forms.server");
    const signedUrl = await uploadCVAndSign(data.file, data.ext, {
      uploaded_at: new Date().toISOString(),
    });
    return { signedUrl, filename: data.file.name };
  });

export const submitCV = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const cv_url = String(data.get("cv_url") ?? "").trim();
    const cv_filename = String(data.get("cv_filename") ?? "").trim().slice(0, 300);
    if (!cv_url || !cv_filename) throw new Error("CV upload not completed");
    const name = String(data.get("name") ?? "").trim().slice(0, 200);
    const email = String(data.get("email") ?? "").trim().slice(0, 200);
    if (!name || !email) throw new Error("Name and email are required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
    const edad = Number(String(data.get("edad") ?? ""));
    const salario_esperado_usd = Number(String(data.get("salario_esperado_usd") ?? ""));
    const pais = String(data.get("pais") ?? "").trim().slice(0, 100);
    const region = String(data.get("region") ?? "").trim().slice(0, 100);
    if (!Number.isFinite(edad) || edad < 16 || edad > 80) throw new Error("Edad inválida");
    if (!Number.isFinite(salario_esperado_usd) || salario_esperado_usd < 0) throw new Error("Salario esperado inválido");
    if (!pais || !region) throw new Error("País y estado/provincia son obligatorios");
    return {
      cv_url,
      cv_filename,
      name,
      email,
      edad,
      salario_esperado_usd,
      pais,
      region,
      phone: String(data.get("phone") ?? "").trim().slice(0, 50),
      linkedin: String(data.get("linkedin") ?? "").trim().slice(0, 300),
      oportunidades: String(data.get("oportunidades") ?? "").trim().slice(0, 2000),
      origen: String(data.get("origen") ?? "").trim().slice(0, 50),
    };
  })
  .handler(async ({ data }) => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      linkedin: data.linkedin,
      oportunidades: data.oportunidades,
      origen: data.origen,
      edad: data.edad,
      salario_esperado_usd: data.salario_esperado_usd,
      pais: data.pais,
      region: data.region,
      cv_url: data.cv_url,
      cv_filename: data.cv_filename,
    };

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("candidatos").insert({
        nombre_completo: data.name,
        email: data.email,
        telefono: data.phone,
        linkedin: data.linkedin,
        origen: data.origen || null,
        oportunidades_persona: data.oportunidades,
        link_cv: data.cv_url,
        edad: data.edad,
        salario_esperado_usd: data.salario_esperado_usd,
        pais: data.pais,
        region: data.region,
        ubicacion: `${data.region}, ${data.pais}`,
      });
      if (error) console.error("[candidatos insert]", error.message);
    } catch (e) {
      console.error("[candidatos insert] failed", e);
    }

    const res = await fetch(MAKE_CV_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("[make] response", { status: res.status, ok: res.ok });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Make webhook failed (status ${res.status}): ${text.slice(0, 200)}`);
    }

    try {
      const backupRes = await fetch(BACKUP_SHEET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          nombre: data.name,
          email: data.email,
          cv_url: data.cv_url,
          linkedin: data.linkedin || "",
          fecha: new Date().toISOString(),
        }),
      });
      console.log("[backup-sheet] response", { status: backupRes.status, ok: backupRes.ok });
    } catch (e) {
      console.error("[backup-sheet] fetch failed", e);
    }

    return { success: true, signedUrl: data.cv_url, filename: data.cv_filename };
  });


export const submitDemo = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const out: Record<string, string> = {};
    for (const [k, v] of data.entries()) {
      if (typeof v === "string") out[k] = v.slice(0, 2000);
    }
    if (!out.name || !out.empresa) throw new Error("Name and company are required");
    if (!out.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email)) {
      throw new Error("Invalid email");
    }
    if (!out.telefono) throw new Error("Teléfono de contacto es obligatorio");
    if (!out.posicion || !out.skills_requeridos) {
      throw new Error("Posición y skills requeridos son obligatorios");
    }
    if (!out.genero_buscado) out.genero_buscado = "Indiferente";
    return out;
  })
  .handler(async ({ data }) => {
    const MAKE_EMPRESA_WEBHOOK_URL = "https://hook.us2.make.com/yqnbhhmd1jt917w26k36y672jolhtol6";
    const res = await fetch(MAKE_EMPRESA_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    console.log("[make-empresas] response", { status: res.status, ok: res.ok });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Make webhook failed (status ${res.status}): ${text.slice(0, 200)}`);
    }
    return { success: true };
  });
