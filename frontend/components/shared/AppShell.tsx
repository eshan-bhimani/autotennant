"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Eye,
  ScrollText,
  Settings,
  Search,
  ClipboardList,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const landlordNav: NavItem[] = [
  { label: "Dashboard", href: "/landlord/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "My Properties", href: "/landlord/properties", icon: <Building2 size={18} /> },
  { label: "Applications", href: "/landlord/applications", icon: <ClipboardList size={18} /> },
  { label: "Viewings", href: "/landlord/viewings", icon: <Eye size={18} /> },
  { label: "Leases", href: "/landlord/leases", icon: <ScrollText size={18} /> },
  { label: "Settings", href: "/landlord/settings", icon: <Settings size={18} /> },
];

const tenantNav: NavItem[] = [
  { label: "Search Properties", href: "/tenant/search", icon: <Search size={18} /> },
  { label: "My Applications", href: "/tenant/applications", icon: <ClipboardList size={18} /> },
  { label: "Viewings", href: "/tenant/viewings", icon: <Eye size={18} /> },
  { label: "My Leases", href: "/tenant/leases", icon: <ScrollText size={18} /> },
  { label: "Settings", href: "/tenant/settings", icon: <Settings size={18} /> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeRole, setActiveRole, logout } = useAppStore();
  const [userEmail, setUserEmail] = useState("");
  const [initials, setInitials] = useState("U");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setUserEmail(user.email);
      const parts = (user.full_name || user.email || "U").split(" ");
      setInitials(parts.map((p: string) => p[0]).join("").slice(0, 2).toUpperCase());
    }
  }, []);

  const navItems = activeRole === "tenant" ? tenantNav : landlordNav;

  const handleRoleSwitch = (role: "landlord" | "tenant") => {
    setActiveRole(role);
    router.push(`/${role}/dashboard`);
  };

  // Find current page title from nav or breadcrumb
  const currentPage = navItems.find((n) => pathname.startsWith(n.href))?.label ?? "Dashboard";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-[240px] flex-col border-r border-nav-border bg-nav-bg">
        <div className="px-5 py-5">
          <Link href="/" className="text-lg font-bold text-text-primary">
            AutoTennant
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-[#EFF6FF] font-semibold text-primary"
                    : "text-text-secondary hover:bg-card-light hover:text-text-primary"
                }`}
              >
                <span className={active ? "text-primary" : "text-text-secondary"}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Role switcher */}
        <div className="mx-3 mb-3">
          <div className="relative flex rounded-[10px] bg-white p-1">
            {(["landlord", "tenant"] as const).map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSwitch(role)}
                className="relative z-10 flex-1 rounded-[8px] px-3 py-1.5 text-xs font-semibold transition"
                style={{
                  color: activeRole === role ? "#fff" : "#6B7280",
                }}
              >
                {activeRole === role && (
                  <motion.div
                    layoutId="sidebarRoleIndicator"
                    className="absolute inset-0 rounded-[8px] bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 capitalize">{role}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User section */}
        <div className="border-t border-nav-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{userEmail}</p>
              <button
                onClick={logout}
                className="text-xs font-medium text-text-muted hover:text-text-primary"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header
          className="flex h-[60px] items-center justify-between border-b border-nav-border px-6"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          <h2 className="text-sm font-semibold text-text-primary">{currentPage}</h2>
          <div className="flex items-center gap-4">
            <button className="text-text-secondary hover:text-text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              {initials}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-white p-8">{children}</main>
      </div>
    </div>
  );
}
