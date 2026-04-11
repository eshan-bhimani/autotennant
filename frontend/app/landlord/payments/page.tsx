"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { CheckCircle2, Clock, AlertTriangle, DollarSign, ExternalLink } from "lucide-react";
import {
  useConnectStatus,
  useCreateConnectOnboarding,
  useLandlordPaymentStats,
  useLandlordPayments,
  type LandlordPaymentRow,
} from "@/hooks/usePayments";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { formatCurrency } from "@/lib/utils";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-500/10 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-500/10 text-blue-700 border-blue-200",
  LATE: "bg-red-500/10 text-red-700 border-red-200",
  FAILED: "bg-red-500/10 text-red-700 border-red-200",
  REFUNDED: "bg-zinc-500/10 text-zinc-700 border-zinc-200",
};

export default function LandlordPaymentsPage() {
  const { data: connect, isLoading: connectLoading } = useConnectStatus();
  const { data: stats } = useLandlordPaymentStats();
  const { data: payments, isLoading: paymentsLoading } = useLandlordPayments();
  const createOnboarding = useCreateConnectOnboarding();
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "late">("all");

  const filtered = useMemo<LandlordPaymentRow[]>(() => {
    if (!payments) return [];
    if (filter === "all") return payments;
    if (filter === "pending") return payments.filter((p) => p.status === "PENDING" || p.status === "PROCESSING");
    if (filter === "paid") return payments.filter((p) => p.status === "PAID");
    if (filter === "late") return payments.filter((p) => p.status === "LATE");
    return payments;
  }, [payments, filter]);

  const handleOnboard = async () => {
    try {
      const res = await createOnboarding.mutateAsync();
      window.location.href = res.onboarding_url;
    } catch (err: unknown) {
      alert(
        err instanceof Error && err.message
          ? err.message
          : "Stripe onboarding unavailable. Please configure your Stripe keys.",
      );
    }
  };

  const statCards = [
    {
      label: "Collected this month",
      value: formatCurrency(stats?.collected_this_month ?? 0),
      icon: <DollarSign size={18} />,
      accent: "from-emerald-500 to-green-600",
      featured: true,
    },
    {
      label: "Pending this month",
      value: formatCurrency(stats?.pending_this_month ?? 0),
      icon: <Clock size={18} />,
      accent: "from-amber-500 to-orange-600",
      featured: false,
    },
    {
      label: "Overdue total",
      value: formatCurrency(stats?.overdue_total ?? 0),
      icon: <AlertTriangle size={18} />,
      accent: "from-red-500 to-rose-600",
      featured: false,
    },
    {
      label: "Paid invoices",
      value: String(stats?.paid_count ?? 0),
      icon: <CheckCircle2 size={18} />,
      accent: "from-primary to-blue-600",
      featured: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease }}
    >
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            className="text-[28px] font-bold text-text-primary"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            Rent Collection
          </motion.h1>
          <p className="mt-1 text-sm text-text-secondary">
            Track rent payments, automated reminders, and Stripe payouts.
          </p>
        </div>
      </div>

      {/* Connect onboarding banner */}
      {!connectLoading && !connect?.onboarded && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="mt-6 overflow-hidden rounded-[20px] border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-violet-50 p-6"
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Action required
              </div>
              <h2 className="mt-3 text-lg font-semibold text-text-primary">
                Connect your bank to start collecting rent
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                AutoTenant uses Stripe Connect to route rent payments directly to your account. Takes 3 minutes.
              </p>
              <p className="mt-2 text-[12px] text-text-muted">
                Platform fee: 1.5% per successful payment · Stripe fees passed through.
              </p>
            </div>
            <button
              onClick={handleOnboard}
              disabled={createOnboarding.isPending}
              className="inline-flex shrink-0 items-center gap-2 rounded-btn bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,124,232,0.30)] transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-60"
            >
              {createOnboarding.isPending ? "Opening Stripe…" : "Connect Stripe"}
              <ExternalLink size={14} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Connect status (onboarded) */}
      {!connectLoading && connect?.onboarded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 flex items-center gap-3 rounded-btn border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <CheckCircle2 size={16} />
          <span>Stripe Connect active · payouts enabled · account {connect.account_id}</span>
        </motion.div>
      )}

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            className={`relative overflow-hidden rounded-[20px] p-6 ${
              s.featured
                ? "bg-gradient-to-br " + s.accent + " text-white"
                : "border border-border-light bg-white"
            }`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.5, ease }}
            whileHover={{ y: -2 }}
          >
            {s.featured && <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />}
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                s.featured
                  ? "bg-white/20 text-white"
                  : "bg-gradient-to-br " + s.accent + " text-white"
              }`}
            >
              {s.icon}
            </div>
            <p className={`mt-4 text-[13px] font-medium ${s.featured ? "text-white/70" : "text-text-secondary"}`}>
              {s.label}
            </p>
            <p className={`mt-1 text-[28px] font-bold leading-none ${s.featured ? "text-white" : "text-text-primary"}`}>
              {s.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-8 flex items-center gap-2">
        {(["all", "pending", "paid", "late"] as const).map((val) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`rounded-btn border px-4 py-2 text-xs font-semibold transition ${
              filter === val
                ? "border-primary bg-primary text-white"
                : "border-border-light bg-white text-text-secondary hover:border-primary/30"
            }`}
          >
            {val.charAt(0).toUpperCase() + val.slice(1)}
          </button>
        ))}
      </div>

      {/* Payment list */}
      {paymentsLoading ? (
        <LoadingSpinner className="mt-12" />
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-[20px] border border-dashed border-border-light bg-gradient-to-br from-white to-card-light p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
          <p className="mt-4 text-base font-medium text-text-primary">No rent payments yet</p>
          <p className="mt-1 text-sm text-text-secondary">
            Rent schedules are generated automatically when a lease is signed.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[20px] border border-border-light bg-white">
          <table className="w-full">
            <thead className="border-b border-border-light bg-card-light text-left">
              <tr>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  Tenant
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  Property
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  Due
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  Amount
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border-light last:border-0 hover:bg-card-light/30">
                  <td className="px-5 py-4 text-sm font-medium text-text-primary">{p.tenant_name}</td>
                  <td className="px-5 py-4 text-sm text-text-secondary">{p.property_address}</td>
                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {new Date(p.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-text-primary">
                    {formatCurrency(p.amount)}
                    <span className="ml-1 text-xs font-normal text-text-muted">
                      (fee {formatCurrency(p.platform_fee)})
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                        STATUS_STYLES[p.status] ?? ""
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
      )}
    </motion.div>
  );
}
