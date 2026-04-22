"use client";

import { useSession } from "next-auth/react";
import LandlordNav from "@/components/landlord/LandlordNav";
import TenantNav from "@/components/tenant/TenantNav";

/**
 * Legacy shared layout kept for compatibility. The app primarily uses AppShell
 * and AdminShell — avoid adding new imports of this component.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  // @ts-expect-error next-auth session shape varies by provider; tolerate either.
  const role = session?.user?.role;

  return (
    <div className="bg-mesh min-h-screen">
      {session && (
        <header className="glass-strong sticky top-0 z-30 border-b border-white/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {role === "TENANT" ? <TenantNav /> : <LandlordNav />}
          </div>
        </header>
      )}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
