"use client";

import { Loader2, AlertTriangle, Star } from "lucide-react";
import { useReviews } from "@/lib/api";
import { PageHeader } from "@/components/layout";

export default function ReviewsPage() {
  const { data: reviews, isLoading, error } = useReviews();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !reviews) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Falha ao carregar avaliações.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Avaliações" description={`${reviews.length} avaliações`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-xl border border-border-subtle bg-surface p-5"
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${
                    i < review.rating
                      ? "fill-warning text-warning"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
              <span className="ml-2 font-mono text-xs tabular-nums">
                {review.rating}/5
              </span>
            </div>
            {review.comment && (
              <p className="mt-3 text-sm text-foreground/80">{review.comment}</p>
            )}
            {review.experience_tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {review.experience_tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-primary-muted px-1.5 py-0.5 text-[10px] font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-3 font-mono text-[10px] text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
