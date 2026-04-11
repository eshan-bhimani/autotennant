"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAdminUsers } from "@/hooks/useAdmin";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function AdminUsersPage() {
  const [role, setRole] = useState<string | undefined>(undefined);
  const { data, isLoading } = useAdminUsers(role);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease }}>
      <h1 className="text-[28px] font-bold text-white">Users</h1>
      <p className="mt-1 text-sm text-white/60">All registered accounts across the platform.</p>

      <div className="mt-6 flex gap-2">
        {[
          { val: undefined, label: "All" },
          { val: "LANDLORD", label: "Landlords" },
          { val: "TENANT", label: "Tenants" },
          { val: "ADMIN", label: "Admins" },
        ].map((r) => (
          <button
            key={r.label}
            onClick={() => setRole(r.val)}
            className={`rounded-btn border px-4 py-2 text-xs font-semibold transition ${
              role === r.val
                ? "border-primary bg-primary/20 text-white"
                : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/[0.02] text-left">
            <tr>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">Name</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">Email</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">Role</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-white/40">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading &&
              (data ?? []).map((u) => (
                <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                  <td className="px-5 py-3 text-sm font-medium text-white">{u.full_name ?? "—"}</td>
                  <td className="px-5 py-3 text-sm text-white/70">{u.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        u.role === "LANDLORD"
                          ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                          : u.role === "TENANT"
                            ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-white/50">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
