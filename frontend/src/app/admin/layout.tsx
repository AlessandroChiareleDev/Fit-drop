import { Sidebar } from "@/components/layout/sidebar";
import { AuthGuard } from "@/components/auth-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="relative flex min-h-screen">
        {/* Background effect */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute -top-40 right-1/4 h-[400px] w-[600px] rounded-full bg-primary/4 blur-[120px]" />
        </div>
        <Sidebar />
        <main className="relative z-10 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl space-y-6 p-6 pt-20 lg:pt-6">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
