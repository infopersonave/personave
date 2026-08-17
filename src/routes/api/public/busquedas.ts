import { createFileRoute } from "@tanstack/react-router";

// Endpoint para Make.com: registra búsquedas nuevas en la tabla `busquedas`.
// POST /api/public/busquedas con header: x-persona-token: <MAKE_API_TOKEN>

function str(v: unknown, max: number): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().slice(0, max);
  return s === "" ? null : s;
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/busquedas")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env["MAKE_API_TOKEN"];
        if (!expected) {
          return Response.json({ ok: false, error: "Server not configured" }, { status: 500 });
        }
        const provided = request.headers.get("x-persona-token") ?? "";
        if (!timingSafeEqual(provided, expected)) {
          return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
        }

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
        }

        const empresa = str(body["empresa"], 200);
        if (!empresa) {
          return Response.json({ ok: false, error: "empresa es obligatorio" }, { status: 400 });
        }

        const email = str(body["email"], 200)?.toLowerCase() ?? null;
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return Response.json({ ok: false, error: "email inválido" }, { status: 400 });
        }

        const fields = {
          empresa,
          email,
          nombre_contacto: str(body["nombre_contacto"], 200),
          telefono_contacto: str(body["telefono_contacto"], 50),
          cargo_contacto: str(body["cargo_contacto"], 200),
          posicion_buscada: str(body["posicion_buscada"], 200),
          seniority: str(body["seniority"], 100),
          skills_requeridos: str(body["skills_requeridos"], 4000),
          skills_deseables: str(body["skills_deseables"], 4000),
          anos_experiencia_minimos: num(body["anos_experiencia_minimos"]),
          industria_preferida: str(body["industria_preferida"], 200),
          modalidad: str(body["modalidad"], 100),
          genero_buscado: str(body["genero_buscado"], 50),
          num_vacantes: num(body["num_vacantes"]),
          ubicacion: str(body["ubicacion"], 200),
          rango_salarial: str(body["rango_salarial"], 100),
          descripcion_rol: str(body["descripcion_rol"], 8000),
          estado: "pendiente",
        };

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        try {
          const { data: inserted, error: insErr } = await supabaseAdmin
            .from("busquedas")
            .insert(fields as never)
            .select("id")
            .single();
          if (insErr) throw new Error(insErr.message);
          return Response.json({ ok: true, id: inserted.id });
        } catch (e) {
          console.error("[api/public/busquedas]", e);
          return Response.json(
            { ok: false, error: e instanceof Error ? e.message : "Error inesperado" },
            { status: 500 },
          );
        }
      },
    },
  },
});
