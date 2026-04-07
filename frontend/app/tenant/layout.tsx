import AppShell from "@/components/shared/AppShell";
import RouteGuard from "@/components/shared/RouteGuard";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRole="tenant">
      <AppShell>{children}</AppShell>
    </RouteGuard>
  );
}
