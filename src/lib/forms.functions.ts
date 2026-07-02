import { createServerFn } from "@tanstack/react-start";

const MAKE_CV_WEBHOOK_URL = "https://hook.us2.make.com/5hbzwu0mqd0r35vebv13lmtkqkhvgqdj";
const BACKUP_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyQ0y9UUquM_DydCFOOhDtQ0GMjgEQoDI2CZAZxg4VluPYtTjUeOrHUqz7P3_vdtyLaDw/exec";
const MAKE_DAMNIFICADOS_WEBHOOK_URL = "https://hook.us2.make.com/qogs1f0mq820iihb66ubch7p3o0elond";

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
    if (file instanceof File && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) throw new Error("File exceeds 5MB");
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (ext !== "pdf") throw new Error("Invalid file type");
      if (file.type && file.type !== "application/pdf") throw new Error("Invalid file type");
      cvFile = file;
    }
    return { nombre, telefono, correo, ubicacion, que_sabe_hacer, disponibilidad, cvFile };
  })
  .handler(async ({ data }) => {
    let cv_url = "";
    if (data.cvFile) {
      try {
        const { uploadCVAndSign } = await import("./forms.server");
        cv_url = await uploadCVAndSign(data.cvFile, "pdf", {
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

export const submitCV = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const file = data.get("cv");
    if (!(file instanceof File)) throw new Error("CV file is required");
    if (file.size === 0) throw new Error("Empty file");
    if (file.size > 5 * 1024 * 1024) throw new Error("File exceeds 5MB");
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const allowedExts = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "webp", "heic"];
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
    ];
    if (!allowedExts.includes(ext)) throw new Error("Invalid file type");
    if (file.type && !allowedTypes.includes(file.type)) throw new Error("Invalid file type");
    const name = String(data.get("name") ?? "")
      .trim()
      .slice(0, 200);
    const email = String(data.get("email") ?? "")
      .trim()
      .slice(0, 200);
    if (!name || !email) throw new Error("Name and email are required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
    return {
      file,
      ext,
      name,
      email,
      phone: String(data.get("phone") ?? "")
        .trim()
        .slice(0, 50),
      linkedin: String(data.get("linkedin") ?? "")
        .trim()
        .slice(0, 300),
      oportunidades: String(data.get("oportunidades") ?? "")
        .trim()
        .slice(0, 2000),
    };
  })
  .handler(async ({ data }) => {
    const { uploadCVAndSign } = await import("./forms.server");
    const metadata = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      linkedin: data.linkedin,
      oportunidades: data.oportunidades,
    };

    console.log("[submitCV] received file", {
      name: data.file.name,
      size: data.file.size,
      type: data.file.type,
      ext: data.ext,
    });

    let signedUrl = "";
    try {
      signedUrl = await uploadCVAndSign(data.file, data.ext, metadata);
      console.log("[submitCV] upload OK", { signedUrl, filename: data.file.name });
    } catch (e) {
      console.error("[submitCV] upload FAILED", e);
    }

    const payload = {
      ...metadata,
      cv_url: signedUrl,
      cv_filename: data.file.name,
    };

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

    // Backup: send a copy to Google Sheet. We await it so the serverless
    // function doesn't terminate before the request completes, but errors
    // here must NEVER break or throw in the main flow.
    try {
      const backupRes = await fetch(BACKUP_SHEET_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          nombre: data.name,
          email: data.email,
          cv_url: signedUrl,
          linkedin: data.linkedin || "",
          fecha: new Date().toISOString(),
        }),
      });
      console.log("[backup-sheet] response", { status: backupRes.status, ok: backupRes.ok });
    } catch (e) {
      console.error("[backup-sheet] fetch failed", e);
    }

    return { success: true, signedUrl, filename: data.file.name };
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
    if (!out.posicion || !out.skills_requeridos) {
      throw new Error("Posición y skills requeridos son obligatorios");
    }
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
