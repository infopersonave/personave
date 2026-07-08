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
          className={`h-4 w-4 ${n <= rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: Review }) {
  const isCandidato = r.tipo === "candidato";
  return (
    <article className="glass-strong rounded-2xl p-7 flex flex-col gap-3 shrink-0 w-[85%] sm:w-[380px] md:w-auto snap-center hover:-translate-y-1 transition-transform">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-lg">{r.nombre}</h3>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-brand text-white shrink-0">
          {isCandidato ? "Candidato" : "Empresa"}
        </span>
      </div>
      <Stars rating={r.rating} />
      <p className="text-muted-foreground leading-relaxed">"{r.texto}"</p>
      {isCandidato && r.empresa_relacionada ? (
        <p className="text-sm font-medium mt-auto pt-2 text-gradient">
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
    <section className="py-24 bg-bg-light">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-4xl md:text-5xl font-bold">
            Lo que <span className="text-gradient">dicen de nosotros</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="glass-strong rounded-2xl p-7 h-48 animate-pulse" />
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
