import { createFileRoute } from "@tanstack/react-router";

// Public permanent URL for CV files stored in the private "cvs" bucket.
// URL pattern: /api/public/cv/{submissionId}/{filename}
// This proxies through the service role so the bucket itself can stay private
// (no INSERT/UPDATE/DELETE from anon), while giving Make.com / Google Sheets a
// stable, non-expiring link to the uploaded CV.
export const Route = createFileRoute("/api/public/cv/$submissionId/$filename")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const submissionId = String(params.submissionId ?? "");
        const filename = String(params.filename ?? "");

        // Basic path-traversal / shape guard: submissionId must be a UUID-ish token,
        // filename must be a simple "cv.<ext>" produced by our upload code.
        if (!/^[a-f0-9-]{8,64}$/i.test(submissionId)) {
          return new Response("Not found", { status: 404 });
        }
        if (!/^cv\.[a-z0-9]{1,8}$/i.test(filename)) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const path = `submissions/${submissionId}/${filename}`;
        const { data, error } = await supabaseAdmin.storage.from("cvs").download(path);
        if (error || !data) {
          return new Response("Not found", { status: 404 });
        }

        const ext = filename.split(".").pop()?.toLowerCase() ?? "";
        const contentType =
          ext === "pdf" ? "application/pdf" :
          ext === "doc" ? "application/msword" :
          ext === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
          ext === "png" ? "image/png" :
          ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
          ext === "webp" ? "image/webp" :
          ext === "heic" ? "image/heic" :
          "application/octet-stream";

        return new Response(data.stream(), {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `inline; filename="${filename}"`,
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
