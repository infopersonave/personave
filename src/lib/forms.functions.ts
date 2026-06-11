import { createServerFn } from "@tanstack/react-start";

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
    const { uploadCVAndSign, submitWeb3Forms } = await import("./forms.server");
    const signedUrl = await uploadCVAndSign(data.file, data.ext, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      linkedin: data.linkedin,
      oportunidades: data.oportunidades,
    });
    try {
      await submitWeb3Forms({
      subject: "Nuevo CV en Persona",
      from_name: "Persona - Profesionales",
      name: data.name,
      email: data.email,
      phone: data.phone,
      linkedin: data.linkedin,
      oportunidades: data.oportunidades,
      cv_url: signedUrl,
      cv_filename: data.file.name,
      });
    } catch (error) {
      console.warn("CV stored, but notification failed", error);
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
