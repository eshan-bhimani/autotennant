import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  OptimizedListingResponse,
  PhotoUploadResponse,
  PropertyCreate,
  PropertyListResponse,
  PropertyResponse,
  PropertyUpdate,
} from "@/types/api";

export const useProperties = () =>
  useQuery({
    queryKey: ["properties"],
    queryFn: () => api.get<PropertyListResponse>("/properties").then((r) => r.data),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

export const useProperty = (id: string) =>
  useQuery({
    queryKey: ["properties", id],
    queryFn: () => api.get<PropertyResponse>(`/properties/${id}`).then((r) => r.data),
    enabled: !!id,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PropertyCreate) =>
      api.post<PropertyResponse>("/properties", data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

export const useUpdateProperty = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PropertyUpdate) =>
      api.put<PropertyResponse>(`/properties/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties", id] });
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/properties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

export const useOptimizeListing = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<OptimizedListingResponse>(`/properties/${id}/optimize`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", id] });
    },
  });
};

export const usePhotoUploadUrl = (id: string) =>
  useMutation({
    mutationFn: () =>
      api.post<PhotoUploadResponse>(`/properties/${id}/photos`).then((r) => r.data),
  });

export const useConfirmPhoto = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (s3_key: string) =>
      api.patch(`/properties/${id}/photos`, { s3_key }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", id] });
    },
  });
};
