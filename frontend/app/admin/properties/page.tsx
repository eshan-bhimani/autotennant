"use client";

import { motion } from "framer-motion";
import { useAdminProperties } from "@/hooks/useAdmin";
import { formatCurrency } from "@/lib/utils";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function AdminPropertiesPage() {
  const { data, isLoading } = useAdminProperties();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease }}>
      <h1 className="text-[28px] font-bold text-white">Properties</h1>
      <p className="mt-1 text-sm text-white/60">Every property listed on AutoTenant.</p>

      <div className="mt-6 overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/[0.02] text-left">
            <tr>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">Address</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">Landlord</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">Rent</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">Status</th>
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
              (data ?? []).map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                  <td className="px-5 py-3 text-sm text-white">
                    <p className="font-medium">{p.address_line1}</p>
                    <p className="text-[11px] text-white/50">
                      {p.city}, {p.state}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-sm text-white/70">{p.landlord_name}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-white">
                    {p.monthly_rent ? formatCurrency(p.monthly_rent) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        p.status === "LISTED"
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : p.status === "OCCUPIED"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
