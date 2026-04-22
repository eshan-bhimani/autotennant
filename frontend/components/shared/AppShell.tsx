"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import Logo from "@/components/shared/Logo";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Eye,
  ScrollText,
  Settings,
  Search,
  ClipboardList,
  CreditCard,
  MessageSquare,
  Menu,
  X,
  ChevronRight,
  Bell,
  LogOut,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  group?: string;
}

const landlordNav: NavItem[] = [
  { label: "Dashboard", href: "/landlord/dashboard", icon: <LayoutDashboard size={18} />, group: "main" },
  { label: "My Properties", href: "/landlord/properties", icon: <Building2 size={18} />, group: "main" },
  { label: "Applications", href: "/landlord/applications", icon: <ClipboardList size={18} />, group: "main" },
  { label: "Viewings", href: "/landlord/viewings", icon: <Eye size={18} />, group: "manage" },
  { label: "Leases", href: "/landlord/leases", icon: <ScrollText size={18} />, group: "manage" },
  { label: "Payments", href: "/landlord/payments", icon: <CreditCard size={18} />, group: "manage" },
  { label: "Messages", href: "/landlord/messages", icon: <MessageSquare size={18} />, group: "manage" },
  { label: "Settings", href: "/landlord/settings", icon: <Settings size={18} />, group: "other" },
];

const tenantNav: NavItem[] = [
  { label: "Dashboard", href: "/tenant/dashboard", icon: <LayoutDashboard size={18} />, group: "main" },
  { label: "Search Properties", href: "/tenant/search", icon: <Search size={18} />, group: "main" },
  { label: "My Applications", href: "/tenant/applications", icon: <ClipboardList size={18} />, group: "main" },
  { label: "Viewings", href: "/tenant/viewings", icon: <Eye size={18} />, group: "manage" },
  { label: "My Leases", href: "/tenant/leases", icon: <ScrollText size={18} />, group: "manage" },
  { label: "Payments", href: "/tenant/payments", icon: <CreditCard size={18} />, group: "manage" },
  { label: "Messages", href: "/tenant/messages", icon: <MessageSquare size={18} />, group: "manage" },
  { label: "Settings", href: "/tenant/settings", icon: <Settings size={18} />, group: "other" },
];

const groupLabels: Record<string, string> = {
  main: "",
  manage: "Manage",
  other: "",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeRole, setActiveRole, logout } = useAppStore();
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [initials, setInitials] = useState("U");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setUserEmail(user.email);
      setUserName(user.full_name || "");
      const parts = (user.full_name || user.email || "U").split(" ");
      setInitials(parts.map((p: string) => p[0]).join("").slice(0, 2).toUpperCase());
    }
  }, []);

  const navItems = activeRole === "tenant" ? tenantNav : landlordNav;
  const currentPage = navItems.find((n) => pathname.startsWith(n.href))?.label ?? "Dashboard";

  const handleRoleSwitch = (role: "landlord" | "tenant") => {
    setActiveRole(role);
    router.push(`/${role}/dashboard`);
  };

  // Group nav items
  const groups = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group || "main";
    (acc[g] = acc[g] || []).push(item);
    return acc;
  }, {});

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5">
        <Link href="/" onClick={() => setSidebarOpen(false)}>
          <Logo variant="light" />
        </Link>
      </div>

      <div className="mx-4 mb-3 h-px bg-gradient-to-r from-transparent via-border-light to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            {groupLabels[group] && (
              <p className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                {groupLabels[group]}
              </p>
            )}
            {items.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "font-semibold text-primary"
                      : "text-text-secondary hover:bg-card-light hover:text-text-primary"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="navActiveIndicator"
                      className="absolute inset-0 rounded-[10px] bg-primary/[0.08]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${active ? "text-primary" : "text-text-secondary"}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Role switcher */}
      <div className="mx-3 mb-3">
        <div className="glass relative flex rounded-[10px] p-1 shadow-soft">
          {(["landlord", "tenant"] as const).map((role) => (
            <button
              key={role}
              onClick={() => handleRoleSwitch(role)}
              className="relative z-10 flex-1 rounded-[8px] px-3 py-1.5 text-xs font-semibold transition"
              style={{ color: activeRole === role ? "#fff" : "#6B7280" }}
            >
              {activeRole === role && (
                <motion.div
                  layoutId="sidebarRoleIndicator"
                  className="absolute inset-0 rounded-[8px] bg-primary shadow-glow"
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
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600 text-xs font-semibold text-white shadow-soft">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">
              {userName || userEmail}
            </p>
            <p className="truncate text-xs text-text-muted">
              {userName ? userEmail : (activeRole === "landlord" ? "Landlord" : "Tenant")}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-card-light hover:text-text-primary"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — frosted glass over a subtle gradient */}
      <aside
        className="relative hidden w-[250px] shrink-0 flex-col border-r border-white/40 lg:flex"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(250,251,254,0.92) 0%, rgba(240,243,250,0.85) 50%, rgba(232,236,245,0.88) 100%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 -z-10 backdrop-blur-xl" />
        {/* Accent blob */}
        <div className="pointer-events-none absolute -left-24 top-24 -z-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-32 -z-10 h-56 w-56 rounded-full bg-violet-400/15 blur-3xl" />
        <div className="flex h-screen flex-col">{sidebarContent}</div>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="glass-strong fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-white/30 lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute right-3 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-card-light hover:text-text-primary"
              >
                <X size={18} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="glass-strong sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-white/40 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-card-light hover:text-text-primary lg:hidden"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-sm">
              <span className="hidden text-text-muted sm:inline">
                {activeRole === "landlord" ? "Landlord" : "Tenant"}
              </span>
              <ChevronRight size={14} className="hidden text-text-muted sm:inline" />
              <span className="font-semibold text-text-primary">{currentPage}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-card-light hover:text-text-primary">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Avatar (desktop only, mobile has sidebar) */}
            <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600 text-xs font-semibold text-white lg:flex">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-mesh p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
