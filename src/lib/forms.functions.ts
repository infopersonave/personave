import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const WEB3FORMS_URL = "https://api.web3forms.com/submit";
const MAX_CV_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTS = ["pdf", "doc", "docx"];

function getKey() {
  const key = process.env.WEB3FORMS_ACCESS_KEY;
  if (!key) throw new Error("WEB3FORMS_ACCESS_KEY not configured");
  return key;
}

async function submitWeb3Forms(fields: Record<string, string>) {
  const fd = new FormData();
  fd.append("access_key", getKey());
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  const res = await fetch(WEB3FORMS_URL, { method: "POST", body: fd });
  const data = (await res.json()) as { success?: boolean; message?: string };
  if (!data.success) throw new Error(data.message || "Web3Forms submission failed");
}

export const submitCV = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const file = data.get("cv");
    if (!(file instanceof File)) throw new Error("CV file is required");
    if (file.size === 0) throw new Error("Empty file");
    if (file.size > MAX_CV_BYTES) throw new Error("File exceeds 10MB");
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTS.includes(ext)) throw new Error("Invalid file type");
    const name = String(data.get("name") ?? "").trim().slice(0, 200);
    const email = String(data.get("email") ?? "").trim().slice(0, 200);
    if (!name || !email) throw new Error("Name and email are required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email");
    return {
      file,
      ext,
      name,
      email,
      phone: String(data.get("phone") ?? "").trim().slice(0, 50),
      linkedin: String(data.get("linkedin") ?? "").trim().slice(0, 300),
      oportunidades: String(data.get("oportunidades") ?? "").trim().slice(0, 2000),
    };
  })
  .handler(async ({ data }) => {
    const path = `${crypto.randomUUID()}.${data.ext}`;
    const bytes = new Uint8Array(await data.file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("cvs")
      .upload(path, bytes, { contentType: data.file.type || "application/octet-stream", upsert: false });
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // 30-day signed URL — short enough to limit leak window
    const { data: signed, error: signedError } = await supabaseAdmin.storage
      .from("cvs")
      .createSignedUrl(path, 60 * 60 * 24 * 30);
    if (signedError || !signed) throw new Error("Could not create signed URL");

    await submitWeb3Forms({
      subject: "Nuevo CV en Persona",
      from_name: "Persona - Profesionales",
      name: data.name,
      email: data.email,
      phone: data.phone,
      linkedin: data.linkedin,
      oportunidades: data.oportunidades,
      cv_url: signed.signedUrl,
      cv_filename: data.file.name,
    });

    return { success: true };
  });

export const submitDemo = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const out: Record<string, string> = {};
    for (const [k, v] of data.entries()) {
      if (typeof v === "string") out[k] = v.slice(0, 2000);
    }
    if (!out.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email)) {
      throw new Error("Invalid email");
    }
    return out;
  })
  .handler(async ({ data }) => {
    await submitWeb3Forms({
      subject: "Nueva solicitud de demo - Persona Empresas",
      from_name: "Persona - Empresas",
      ...data,
    });
    return { success: true };
  });
