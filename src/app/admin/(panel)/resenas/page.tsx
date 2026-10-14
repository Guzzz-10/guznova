import { PageTitle } from "@/components/admin/PageTitle";
import { ReviewsManager } from "@/components/admin/ReviewsManager";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Reseñas" };

export default async function AdminReviewsPage() {
  await requireAdmin();
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <>
      <PageTitle
        title="Reseñas"
        description="Las reseñas nuevas quedan pendientes. Solo se muestran en el sitio las que publiques."
      />
      <ReviewsManager
        reviews={reviews.map((r) => ({
          id: r.id,
          name: r.name,
          rating: r.rating,
          comment: r.comment,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
