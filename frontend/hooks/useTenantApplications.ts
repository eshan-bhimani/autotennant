import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  ApplicationCreate,
  ApplicationListResponse,
  ApplicationResponse,
} from "@/types/api";

export const useTenantApplications = () =>
  useQuery({
    queryKey: ["myApplications"],
    queryFn: () =>
      api.get<ApplicationListResponse>("/applications/my").then((r) => r.data),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ApplicationCreate) =>
      api.post<ApplicationResponse>("/applications", data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
    },
  });
};
