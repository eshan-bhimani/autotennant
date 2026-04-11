"use client";

import { motion } from "framer-motion";
import { useAdminPayments } from "@/hooks/useAdmin";
import { formatCurrency } from "@/lib/utils";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STATUS_COLORS: Record<string, string> = {
  PAID: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  PROCESSING: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  LATE: "border-red-500/30 bg-red-500/10 text-red-300",
  FAILED: "border-red-500/30 bg-red-500/10 text-red-300",
  REFUNDED: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
};

export default function AdminPaymentsPage() {
  const { data, isLoading } = useAdminPayments();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease }}>
      <h1 className="text-[28px] font-bold text-white">Payments</h1>
      <p className="mt-1 text-sm text-white/60">All rent payments flowing through Stripe Connect.</p>

      <div className="mt-6 overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/[0.02] text-left">
            <tr>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">Tenant</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">Landlord</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">Property</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">Amount</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">Fee</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/50">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-white/40">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading &&
              (data ?? []).map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                  <td className="px-5 py-3 text-sm text-white">{p.tenant_name}</td>
                  <td className="px-5 py-3 text-sm text-white/70">{p.landlord_name}</td>
                  <td className="px-5 py-3 text-xs text-white/50">{p.property_address}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-white">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-5 py-3 text-xs text-emerald-300">
                    {formatCurrency(p.platform_fee)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        STATUS_COLORS[p.status] ?? "border-white/10 text-white/60"
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
