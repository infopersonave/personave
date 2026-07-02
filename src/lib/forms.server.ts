import { supabaseAdmin } from "@/integrations/supabase/client.server";

const WEB3FORMS_URL = "https://api.web3forms.com/submit";

export const MAX_CV_BYTES = 10 * 1024 * 1024;
export const ALLOWED_EXTS = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "webp", "heic"];

type Web3FormsAttachment = {
  name: string;
  file: File;
};

export async function submitWeb3Forms(fields: Record<string, string>, accessKey?: string, attachments: Web3FormsAttachment[] = []) {
  const key = accessKey ?? process.env.WEB3FORMS_ACCESS_KEY;
  if (!key) throw new Error("WEB3FORMS_ACCESS_KEY not configured");

  // Web3Forms requires multipart/form-data for file attachments — JSON API does not support files.
  const fd = new FormData();
  fd.append("access_key", key);
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  for (const a of attachments) {
    fd.append(a.name, a.file, a.file.name);
  }

  console.log("[web3forms] sending", {
    url: WEB3FORMS_URL,
    fieldCount: Object.keys(fields).length,
    attachmentCount: attachments.length,
    attachmentInfo: attachments.map((a) => ({ name: a.name, filename: a.file.name, size: a.file.size, type: a.file.type })),
  });

  const res = await fetch(WEB3FORMS_URL, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: fd,
  });

  const text = await res.text();
  console.log("[web3forms] response FULL", {
    status: res.status,
    ok: res.ok,
    contentType: res.headers.get("content-type"),
    body: text,
  });

  let data: { success?: boolean; message?: string } | null = null;
  try {
    data = JSON.parse(text) as { success?: boolean; message?: string };
  } catch {
    throw new Error(`Web3Forms ${res.status} (non-JSON response): ${text.slice(0, 300)}`);
  }
  if (!res.ok || !data.success) {
    throw new Error(data.message || `Web3Forms submission failed (status ${res.status}): ${text.slice(0, 200)}`);
  }
  console.log("[web3forms] SUCCESS confirmed", { status: res.status, message: data.message });
}

export async function uploadCVAndSign(file: File, ext: string, metadata: Record<string, string>) {
  const submissionId = crypto.randomUUID();
  const path = `submissions/${submissionId}/cv.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  console.log("[uploadCVAndSign] uploading", {
    path,
    incomingFileName: file.name,
    incomingFileSize: file.size,
    incomingFileType: file.type,
    bytesLength: bytes.length,
    firstBytes: new TextDecoder().decode(bytes.slice(0, 16)),
  });
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
