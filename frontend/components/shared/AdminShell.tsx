"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Building2, CreditCard, Activity, LogOut } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { useAppStore } from "@/lib/store";

const nav = [
  { label: "Overview", href: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Users", href: "/admin/users", icon: <Users size={18} /> },
  { label: "Properties", href: "/admin/properties", icon: <Building2 size={18} /> },
  { label: "Payments", href: "/admin/payments", icon: <CreditCard size={18} /> },
  { label: "Activity", href: "/admin/activity", icon: <Activity size={18} /> },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAppStore();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setEmail(JSON.parse(raw).email ?? "");
      } catch {}
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0B1628] text-white">
      {/* Sidebar */}
      <aside className="flex w-[240px] flex-col border-r border-white/10 bg-[#0A1324]">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href="/">
            <Logo variant="dark" />
          </Link>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-primary/80">
            Admin Console
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-primary/20 to-violet-500/10 text-white shadow-[inset_0_0_0_1px_rgba(79,124,232,0.3)]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={active ? "text-primary" : ""}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600 text-xs font-semibold text-white">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">{email}</p>
              <button
                onClick={logout}
                className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-white/60 hover:text-white"
              >
                <LogOut size={10} /> Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
