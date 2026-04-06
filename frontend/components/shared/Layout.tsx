"use client";

import { useSession } from "next-auth/react";
import LandlordNav from "@/components/landlord/LandlordNav";
import TenantNav from "@/components/tenant/TenantNav";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      {session && (
        <header className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Nav selection would be based on user role from API */}
            <LandlordNav />
          </div>
        </header>
      )}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
