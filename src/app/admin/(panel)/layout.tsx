import { AdminShell } from "@/components/admin/AdminShell";
import { FeedbackProvider } from "@/components/admin/Feedback";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const pending = await prisma.review.count({ where: { status: "PENDIENTE" } });
  return (
    <MotionProvider>
      <FeedbackProvider>
        <AdminShell pendingReviews={pending} userName={user.name || user.username}>
          {children}
        </AdminShell>
      </FeedbackProvider>
    </MotionProvider>
  );
}
