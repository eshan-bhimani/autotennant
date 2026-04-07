import AppShell from "@/components/shared/AppShell";
import RouteGuard from "@/components/shared/RouteGuard";

export default function LandlordLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRole="landlord">
      <AppShell>{children}</AppShell>
    </RouteGuard>
  );
}
