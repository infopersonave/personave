import { createServerFn } from "@tanstack/react-start";

const MAKE_CV_WEBHOOK_URL = "https://hook.us2.make.com/5hbzwu0mqd0r35vebv13lmtkqkhvgqdj";

export const submitCV = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const file = data.get("cv");
    if (!(file instanceof File)) throw new Error("CV file is required");
    if (file.size === 0) throw new Error("Empty file");
    if (file.size > 10 * 1024 * 1024) throw new Error("File exceeds 10MB");
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["pdf", "doc", "docx"].includes(ext)) throw new Error("Invalid file type");
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
    const { submitWeb3Forms, uploadCVAndSign } = await import("./forms.server");
    const metadata = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      linkedin: data.linkedin,
      oportunidades: data.oportunidades,
    };

    const signedUrl = await uploadCVAndSign(data.file, data.ext, metadata).catch(() => "");

    const fields = {
      subject: "Nuevo CV en Persona",
      from_name: "Persona - Profesionales",
      ...metadata,
      cv_filename: data.file.name,
      cv_type: data.file.type || "application/octet-stream",
      cv_size: String(data.file.size),
      cv_url: signedUrl,
    };

    // Encode file as base64 for Make payload
    const arrayBuffer = await data.file.arrayBuffer();
    const cv_base64 = Buffer.from(arrayBuffer).toString("base64");

    // PRIMARY: Make webhook — must succeed for the user to see success
    const makeResponse = await fetch(MAKE_CV_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...fields, cv_base64 }),
    });
    if (!makeResponse.ok) {
      throw new Error(`Make webhook failed: ${makeResponse.status}`);
    }

    // SECONDARY: Web3Forms — fail silently, don't block success
    try {
      await submitWeb3Forms(fields, "148c465d-a9d5-4344-8999-d3bec14267a6", [
        { name: "attachment", file: data.file },
      ]);
    } catch {
      // Copia secundaria: ignorar errores
    }

    return { success: true, signedUrl, filename: data.file.name };
  });

export const submitCVToMake = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Expected JSON object");
    }

    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (typeof value === "string") out[key] = value.slice(0, 8_000_000);
    }

    if (!out.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email)) {
      throw new Error("Invalid email");
    }

    return out;
  })
  .handler(async ({ data }) => {
    try {
      await fetch(MAKE_CV_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // Make es una copia secundaria: debe fallar en silencio.
    }

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
    const { submitWeb3Forms } = await import("./forms.server");
    await submitWeb3Forms({
      subject: "Nueva solicitud de demo - Persona Empresas",
      from_name: "Persona - Empresas",
      ...data,
    }, "d224beb4-6ad2-4d8c-ac78-07392bae269e");
    return { success: true };
  });
