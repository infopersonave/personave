import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Review = {
  id: string;
  nombre: string;
  tipo: "candidato" | "empresa" | string;
  empresa_relacionada: string | null;
  texto: string;
  rating: number;
  created_at: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="h-4 w-4"
          fill={n <= rating ? "#1F3864" : "none"}
          stroke="#1F3864"
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: Review }) {
  const isCandidato = r.tipo === "candidato";
  return (
    <article
      className="bg-white rounded-lg p-6 flex flex-col gap-3 shrink-0 w-[85%] sm:w-[380px] md:w-auto snap-center"
      style={{ boxShadow: "0 2px 8px rgba(31, 56, 100, 0.08)", color: "#333333" }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-base" style={{ color: "#1F3864" }}>
          {r.nombre}
        </h3>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full text-white shrink-0"
          style={{ backgroundColor: "#1F3864" }}
        >
          {isCandidato ? "Candidato" : "Empresa"}
        </span>
      </div>
      <Stars rating={r.rating} />
      <p className="text-sm leading-relaxed">"{r.texto}"</p>
      {isCandidato && r.empresa_relacionada ? (
        <p className="text-xs font-medium mt-auto pt-2" style={{ color: "#1F3864" }}>
          Colocado en {r.empresa_relacionada}
        </p>
      ) : null}
    </article>
  );
}

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from("reviews" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (!alive) return;
      if (error) {
        console.error("[Reviews]", error);
        setReviews([]);
      } else {
        setReviews((data ?? []) as unknown as Review[]);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!loading && reviews.length === 0) return null;

  return (
    <section className="py-24" style={{ backgroundColor: "#DCE6F1" }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#1F3864" }}>
            Lo que dicen de nosotros
          </h2>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-6 h-48 animate-pulse"
                style={{ boxShadow: "0 2px 8px rgba(31, 56, 100, 0.08)" }}
              />
            ))}
          </div>
        ) : (
          <div className="md:grid md:grid-cols-3 md:gap-5 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0 md:overflow-visible -mx-6 px-6 md:mx-0 md:px-0">
            {reviews.map((r) => (
              <ReviewCard key={r.id} r={r} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
