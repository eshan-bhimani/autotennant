import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface ConnectStatus {
  onboarded: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  account_id: string | null;
}

export interface LandlordPaymentRow {
  id: string;
  lease_id: string;
  period_start: string;
  period_end: string;
  due_date: string;
  amount: number;
  platform_fee: number;
  status: "PENDING" | "PROCESSING" | "PAID" | "LATE" | "FAILED" | "REFUNDED";
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_at: string;
  tenant_name: string;
  property_address: string;
}

export interface TenantPaymentRow {
  id: string;
  lease_id: string;
  period_start: string;
  period_end: string;
  due_date: string;
  amount: number;
  platform_fee: number;
  status: "PENDING" | "PROCESSING" | "PAID" | "LATE" | "FAILED" | "REFUNDED";
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_at: string;
  property_address: string;
  landlord_name: string;
}

export interface PaymentStats {
  collected_this_month: number;
  pending_this_month: number;
  overdue_total: number;
  paid_count: number;
  pending_count: number;
  overdue_count: number;
}

export interface RentCheckoutResponse {
  checkout_url: string;
  session_id: string;
  amount: number;
  rent_payment_id: string;
}

export const useConnectStatus = () =>
  useQuery({
    queryKey: ["payments", "connect", "status"],
    queryFn: () =>
      api.get<ConnectStatus>("/payments/connect/status").then((r) => r.data),
    staleTime: 15_000,
  });

export const useCreateConnectOnboarding = () =>
  useMutation({
    mutationFn: () =>
      api
        .post<{ account_id: string; onboarding_url: string }>(
          "/payments/connect/onboard",
        )
        .then((r) => r.data),
  });

export const useLandlordPayments = () =>
  useQuery({
    queryKey: ["payments", "landlord"],
    queryFn: () =>
      api.get<LandlordPaymentRow[]>("/payments/landlord").then((r) => r.data),
    refetchInterval: 30_000,
  });

export const useLandlordPaymentStats = () =>
  useQuery({
    queryKey: ["payments", "landlord", "stats"],
    queryFn: () =>
      api.get<PaymentStats>("/payments/landlord/stats").then((r) => r.data),
    refetchInterval: 30_000,
  });

export const useTenantPayments = () =>
  useQuery({
    queryKey: ["payments", "tenant"],
    queryFn: () =>
      api.get<TenantPaymentRow[]>("/payments/tenant").then((r) => r.data),
    refetchInterval: 30_000,
  });

export const useGenerateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lease_id: string) =>
      api
        .post<{ status: string; created: number }>("/payments/schedule", {
          lease_id,
          months: 12,
        })
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};

export const usePayRent = () =>
  useMutation({
    mutationFn: (rent_payment_id: string) =>
      api
        .post<RentCheckoutResponse>(
          `/payments/rent/${rent_payment_id}/checkout`,
        )
        .then((r) => r.data),
  });
