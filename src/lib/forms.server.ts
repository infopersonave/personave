import { supabaseAdmin } from "@/integrations/supabase/client.server";

const WEB3FORMS_URL = "https://api.web3forms.com/submit";

export const MAX_CV_BYTES = 10 * 1024 * 1024;
export const ALLOWED_EXTS = ["pdf", "doc", "docx"];

type Web3FormsAttachment = {
  name: string;
  file: File;
};

export async function submitWeb3Forms(fields: Record<string, string>, accessKey?: string, attachments: Web3FormsAttachment[] = []) {
  const key = accessKey ?? process.env.WEB3FORMS_ACCESS_KEY;
  if (!key) throw new Error("WEB3FORMS_ACCESS_KEY not configured");
  const fd = new FormData();
  fd.append("access_key", key);
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  for (const attachment of attachments) {
    fd.append(attachment.name, attachment.file, attachment.file.name);
  }
  const res = await fetch(WEB3FORMS_URL, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: fd,
  });
  const text = await res.text();
  let data: { success?: boolean; message?: string } | null = null;
  try {
    data = JSON.parse(text) as { success?: boolean; message?: string };
  } catch {
    if (!res.ok) {
      console.error("[web3forms] non-JSON error", res.status, text.slice(0, 500));
      throw new Error(`Web3Forms ${res.status}: ${text.slice(0, 200)}`);
    }
    return;
  }
  if (!res.ok || !data.success) {
    console.error("[web3forms] error response", res.status, data);
    throw new Error(data.message || `Web3Forms submission failed (${res.status})`);
  }
}

export async function uploadCVAndSign(file: File, ext: string, metadata: Record<string, string>) {
  const submissionId = crypto.randomUUID();
  const path = `submissions/${submissionId}/cv.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await supabaseAdmin.storage
    .from("cvs")
    .upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const metadataFile = new File(
    [JSON.stringify({ ...metadata, cv_path: path, cv_filename: file.name, cv_size: String(file.size), created_at: new Date().toISOString() }, null, 2)],
    "metadata.json",
    { type: "application/json" },
  );
  const { error: metadataError } = await supabaseAdmin.storage
    .from("cvs")
    .upload(`submissions/${submissionId}/metadata.json`, metadataFile, {
      contentType: "application/json",
      upsert: false,
    });
  if (metadataError) throw new Error(`Metadata upload failed: ${metadataError.message}`);

  const { data: signed, error: signedError } = await supabaseAdmin.storage
    .from("cvs")
    .createSignedUrl(path, 60 * 60 * 24 * 30);
  if (signedError || !signed) throw new Error("Could not create signed URL");
  return signed.signedUrl;
}
