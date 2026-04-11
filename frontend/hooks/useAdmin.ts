import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface AdminStats {
  total_users: number;
  total_landlords: number;
  total_tenants: number;
  total_properties: number;
  listed_properties: number;
  occupied_properties: number;
  total_applications: number;
  approved_applications: number;
  active_leases: number;
  gross_payment_volume: number;
  platform_revenue: number;
  paid_count: number;
  pending_count: number;
  overdue_count: number;
}

export interface AdminUserRow {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  created_at: string;
}

export interface AdminPropertyRow {
  id: string;
  address_line1: string;
  city: string;
  state: string;
  monthly_rent: number | null;
  status: string;
  landlord_name: string;
}

export interface AdminPaymentRow {
  id: string;
  lease_id: string;
  amount: number;
  platform_fee: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  tenant_name: string;
  landlord_name: string;
  property_address: string;
}

export interface AdminActivityItem {
  timestamp: string;
  kind: string;
  message: string;
}

export const useAdminStats = () =>
  useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api.get<AdminStats>("/admin/stats").then((r) => r.data),
    refetchInterval: 30_000,
  });

export const useAdminUsers = (role?: string) =>
  useQuery({
    queryKey: ["admin", "users", role],
    queryFn: () =>
      api
        .get<AdminUserRow[]>("/admin/users", { params: { role } })
        .then((r) => r.data),
  });

export const useAdminProperties = () =>
  useQuery({
    queryKey: ["admin", "properties"],
    queryFn: () =>
      api.get<AdminPropertyRow[]>("/admin/properties").then((r) => r.data),
  });

export const useAdminPayments = () =>
  useQuery({
    queryKey: ["admin", "payments"],
    queryFn: () =>
      api.get<AdminPaymentRow[]>("/admin/payments").then((r) => r.data),
    refetchInterval: 30_000,
  });

export const useAdminActivity = () =>
  useQuery({
    queryKey: ["admin", "activity"],
    queryFn: () =>
      api.get<AdminActivityItem[]>("/admin/activity").then((r) => r.data),
    refetchInterval: 15_000,
  });
