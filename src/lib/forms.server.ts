import { supabaseAdmin } from "@/integrations/supabase/client.server";

const WEB3FORMS_URL = "https://api.web3forms.com/submit";

export const MAX_CV_BYTES = 10 * 1024 * 1024;
export const ALLOWED_EXTS = ["pdf", "doc", "docx"];

export async function submitWeb3Forms(fields: Record<string, string>) {
  const key = process.env.WEB3FORMS_ACCESS_KEY;
  if (!key) throw new Error("WEB3FORMS_ACCESS_KEY not configured");
  const fd = new FormData();
  fd.append("access_key", key);
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  const res = await fetch(WEB3FORMS_URL, { method: "POST", body: fd });
  const data = (await res.json()) as { success?: boolean; message?: string };
  if (!data.success) throw new Error(data.message || "Web3Forms submission failed");
}

export async function uploadCVAndSign(file: File, ext: string) {
  const path = `${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await supabaseAdmin.storage
    .from("cvs")
    .upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data: signed, error: signedError } = await supabaseAdmin.storage
    .from("cvs")
    .createSignedUrl(path, 60 * 60 * 24 * 30);
  if (signedError || !signed) throw new Error("Could not create signed URL");
  return signed.signedUrl;
}
