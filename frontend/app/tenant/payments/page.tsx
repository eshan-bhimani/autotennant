"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { CheckCircle2, Clock, AlertTriangle, DollarSign } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { usePayRent, useTenantPayments } from "@/hooks/usePayments";
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

export default function TenantPaymentsPage() {
  const params = useSearchParams();
  const { data, isLoading } = useTenantPayments();
  const payRent = usePayRent();
  const [paying, setPaying] = useState<string | null>(null);

  const payments = data ?? [];
  const nextDue = payments.find((p) => p.status === "PENDING" || p.status === "LATE");
  const statusFromUrl = params.get("status");

  const handlePay = async (rentPaymentId: string) => {
    setPaying(rentPaymentId);
    try {
      const res = await payRent.mutateAsync(rentPaymentId);
      window.location.href = res.checkout_url;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Unable to start checkout. Your landlord may not have completed Stripe setup.";
      alert(msg);
      setPaying(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease }}
    >
      <motion.h1
        className="text-[28px] font-bold text-text-primary"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        My Rent Payments
      </motion.h1>
      <p className="mt-1 text-sm text-text-secondary">
        Pay securely via Stripe. Payments route directly to your landlord.
      </p>

      {statusFromUrl === "success" && (
        <div className="mt-4 flex items-center gap-2 rounded-btn border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 size={16} />
          Payment received — a receipt has been emailed to you.
        </div>
      )}
      {statusFromUrl === "cancel" && (
        <div className="mt-4 flex items-center gap-2 rounded-btn border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle size={16} />
          Checkout cancelled. You can try again below.
        </div>
      )}

      {/* Next due callout */}
      {nextDue && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mt-6 overflow-hidden rounded-[20px] bg-gradient-to-br from-primary via-[#6366f1] to-violet-600 p-6 text-white shadow-[0_12px_32px_rgba(79,124,232,0.3)]"
        >
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
                {nextDue.status === "LATE" ? "Overdue" : "Next due"}
              </p>
              <p className="mt-2 text-4xl font-bold">{formatCurrency(nextDue.amount)}</p>
              <p className="mt-1 text-sm text-white/80">{nextDue.property_address}</p>
              <p className="text-sm text-white/70">
                Due {new Date(nextDue.due_date).toLocaleDateString()} · Paid to {nextDue.landlord_name}
              </p>
            </div>
            <button
              onClick={() => handlePay(nextDue.id)}
              disabled={paying === nextDue.id || payRent.isPending}
              className="inline-flex shrink-0 items-center gap-2 rounded-btn bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg transition-transform hover:scale-[1.04] active:scale-[0.97] disabled:opacity-60"
            >
              {paying === nextDue.id ? "Opening checkout…" : "Pay now"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Payment history */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text-primary">Payment history</h2>
        {isLoading ? (
          <LoadingSpinner className="mt-8" />
        ) : payments.length === 0 ? (
          <div className="mt-4 rounded-[20px] border border-dashed border-border-light bg-gradient-to-br from-white to-card-light p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <p className="mt-4 text-base font-medium text-text-primary">No rent payments scheduled</p>
            <p className="mt-1 text-sm text-text-secondary">
              Your rent schedule will appear here once your lease is active.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {payments.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between rounded-[16px] border border-border-light bg-white p-5 transition hover:border-primary/20 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      p.status === "PAID"
                        ? "bg-emerald-100 text-emerald-600"
                        : p.status === "LATE"
                          ? "bg-red-100 text-red-600"
                          : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {p.status === "PAID" ? (
                      <CheckCircle2 size={18} />
                    ) : p.status === "LATE" ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <Clock size={18} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{formatCurrency(p.amount)}</p>
                    <p className="text-sm text-text-secondary">{p.property_address}</p>
                    <p className="text-xs text-text-muted">
                      Due {new Date(p.due_date).toLocaleDateString()}
                      {p.paid_at && ` · Paid ${new Date(p.paid_at).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                      STATUS_STYLES[p.status] ?? ""
                    }`}
                  >
                    {p.status}
                  </span>
                  {(p.status === "PENDING" || p.status === "LATE" || p.status === "FAILED") && (
                    <button
                      onClick={() => handlePay(p.id)}
                      disabled={paying === p.id}
                      className="rounded-btn bg-primary px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.03] disabled:opacity-60"
                    >
                      {paying === p.id ? "…" : "Pay"}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
