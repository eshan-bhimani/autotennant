import AdminGuard from "@/components/shared/AdminGuard";
import AdminShell from "@/components/shared/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
