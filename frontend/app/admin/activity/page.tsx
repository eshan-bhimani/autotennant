"use client";

import { motion } from "framer-motion";
import { useAdminActivity } from "@/hooks/useAdmin";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function AdminActivityPage() {
  const { data, isLoading } = useAdminActivity();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease }}>
      <h1 className="text-[28px] font-bold text-white">Activity Feed</h1>
      <p className="mt-1 text-sm text-white/60">Live stream of events across the platform.</p>

      <div className="mt-6 space-y-2">
        {isLoading && <p className="py-8 text-center text-sm text-white/40">Loading…</p>}
        {!isLoading &&
          (data ?? []).map((item, i) => (
            <motion.div
              key={`${item.kind}-${item.timestamp}-${i}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
              className="flex items-start gap-4 rounded-[16px] border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl"
            >
              <div
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                  item.kind === "user_registered"
                    ? "bg-blue-400"
                    : item.kind === "rent_payment"
                      ? "bg-emerald-400"
                      : "bg-violet-400"
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/60">
                    {item.kind.replace(/_/g, " ")}
                  </span>
                  <p className="text-sm text-white">{item.message}</p>
                </div>
                <p className="mt-0.5 text-[11px] text-white/40">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
      </div>
    </motion.div>
  );
}
