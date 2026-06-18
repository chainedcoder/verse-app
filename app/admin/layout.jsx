import "../admin.css";
import "../admin-table.css";
import { TimerProvider } from "@/components/admin/context/TimerContext";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";

export const metadata = {
  title: 'Admin Dashboard — Verse',
  description: 'Platform management and analytics.',
};

export default async function AdminLayout({ children }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch actual real database counts and metrics for admin-system timed tasks
  const [pendingReports, newestFeatured, unsecuredMods] = await Promise.all([
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.poem.findFirst({
      where: { featured: true },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    }),
    prisma.user.count({
      where: {
        role: { in: ["ADMIN", "MODERATOR"] },
        mfaEnabled: false
      }
    })
  ]);

  // Use fixed inset-0 to break out of the global container, and our native .admin-layout class
  return (
    <div className="admin-layout fixed inset-0 z-[9999]">
      <TimerProvider
        pendingReportsCount={pendingReports}
        newestFeaturedTime={newestFeatured?.createdAt ? newestFeatured.createdAt.toISOString() : null}
        unsecuredModsCount={unsecuredMods}
      >
        <Sidebar />
        <div style={{ flex: 1, overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </TimerProvider>
    </div>
  );
}
