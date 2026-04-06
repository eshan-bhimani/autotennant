import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  ApplicationListResponse,
  ApplicationResponse,
  ApplicationStatusUpdate,
} from "@/types/api";

export const useApplications = (propertyId: string) =>
  useQuery({
    queryKey: ["applications", propertyId],
    queryFn: () =>
      api
        .get<ApplicationListResponse>(`/applications/property/${propertyId}`)
        .then((r) => r.data),
    enabled: !!propertyId,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

export const useApplication = (id: string) =>
  useQuery({
    queryKey: ["application", id],
    queryFn: () =>
      api.get<ApplicationResponse>(`/applications/${id}`).then((r) => r.data),
    enabled: !!id,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

export const useUpdateApplicationStatus = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ApplicationStatusUpdate) =>
      api
        .patch<ApplicationResponse>(`/applications/${id}/status`, data)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};
