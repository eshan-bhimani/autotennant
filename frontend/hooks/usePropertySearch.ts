import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PropertySearchResponse } from "@/types/api";

export const usePropertySearch = (query: string, page: number = 1, perPage: number = 20) =>
  useQuery({
    queryKey: ["propertySearch", query, page, perPage],
    queryFn: () =>
      api
        .get<PropertySearchResponse>("/properties/search", {
          params: { q: query, skip: (page - 1) * perPage, limit: perPage },
        })
        .then((r) => r.data),
    enabled: query.length > 0,
  });
