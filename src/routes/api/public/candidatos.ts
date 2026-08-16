import { createFileRoute } from "@tanstack/react-router";

// Endpoint para Make.com: registra/actualiza candidatos en la tabla `candidatos`.
// POST /api/public/candidatos con header: x-persona-token: <MAKE_API_TOKEN>

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

export const Route = createFileRoute("/api/public/candidatos")({
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

        const nombre_completo = str(body["nombre_completo"], 200);
        const email = str(body["email"], 200)?.toLowerCase() ?? null;
        if (!nombre_completo) {
          return Response.json({ ok: false, error: "nombre_completo es obligatorio" }, { status: 400 });
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return Response.json({ ok: false, error: "email inválido" }, { status: 400 });
        }

        const fields = {
          nombre_completo,
          email,
          telefono: str(body["telefono"], 50),
          pais: str(body["pais"], 100),
          region: str(body["region"], 100),
          edad: num(body["edad"]),
          salario_esperado_usd: num(body["salario_esperado_usd"]),
          anos_experiencia: num(body["anos_experiencia"]),
          industria_principal: str(body["industria_principal"], 200),
          skills: str(body["skills"], 4000),
          resumen_ia: str(body["resumen_ia"], 8000),
          link_cv: str(body["link_cv"], 500),
          oportunidades_persona: str(body["oportunidades_persona"], 2000),
          linkedin: str(body["linkedin"], 300),
          origen: str(body["origen"], 50),
        };

        const ubicacion =
          fields.region && fields.pais
            ? `${fields.region}, ${fields.pais}`
            : (fields.region ?? fields.pais);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        try {
          if (email) {
            const { data: existing, error: selErr } = await supabaseAdmin
              .from("candidatos")
              .select("id")
              .eq("email", email)
              .limit(1)
              .maybeSingle();
            if (selErr) throw new Error(selErr.message);

            if (existing) {
              // Update sin tocar `estado` (puede haber sido cambiado manualmente).
              const patch: Record<string, unknown> = { ubicacion };
              for (const [k, v] of Object.entries(fields)) {
                if (v !== null) patch[k] = v;
              }
              const { error: updErr } = await supabaseAdmin
                .from("candidatos")
                .update(patch)
                .eq("id", existing.id);
              if (updErr) throw new Error(updErr.message);
              return Response.json({ ok: true, action: "updated", id: existing.id });
            }
          }

          const { data: inserted, error: insErr } = await supabaseAdmin
            .from("candidatos")
            .insert({ ...fields, ubicacion, estado: "activo" })
            .select("id")
            .single();
          if (insErr) throw new Error(insErr.message);
          return Response.json({ ok: true, action: "inserted", id: inserted.id });
        } catch (e) {
          console.error("[api/public/candidatos]", e);
          return Response.json(
            { ok: false, error: e instanceof Error ? e.message : "Error inesperado" },
            { status: 500 },
          );
        }
      },
    },
  },
});
