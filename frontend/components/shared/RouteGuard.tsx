"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function RouteGuard({
  requiredRole,
  children,
}: {
  requiredRole: "landlord" | "tenant";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { activeRole, isAuthenticated } = useAppStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    if (activeRole !== requiredRole) {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [activeRole, isAuthenticated, requiredRole, router]);

  if (!ready) return null;
  return <>{children}</>;
}
