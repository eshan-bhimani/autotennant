import { useQuery } from "@tanstack/react-query";

export interface ZillowListing {
  zpid: string;
  address: string;
  price: number | string;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  livingArea: number;
  livingAreaUnit: string;
  latitude: number;
  longitude: number;
  imgSrc: string | null;
  detailUrl: string | null;
  listingStatus: string;
  propertyType: string;
  daysOnZillow: number;
}

interface ZillowSearchResponse {
  results: ZillowListing[];
  totalResults: number;
  totalPages: number;
  currentPage: number;
}

interface SearchParams {
  location: string;
  page?: number;
  minPrice?: string;
  maxPrice?: string;
  beds?: string;
  baths?: string;
  sort?: string;
}

export const useZillowSearch = (params: SearchParams) => {
  const query = new URLSearchParams({ location: params.location });
  if (params.page) query.set("page", String(params.page));
  if (params.minPrice) query.set("minPrice", params.minPrice);
  if (params.maxPrice) query.set("maxPrice", params.maxPrice);
  if (params.beds) query.set("beds", params.beds);
  if (params.baths) query.set("baths", params.baths);
  if (params.sort) query.set("sort", params.sort);

  return useQuery<ZillowSearchResponse>({
    queryKey: ["zillow-search", params],
    queryFn: () =>
      fetch(`/api/zillow/search?${query.toString()}`).then((r) => r.json()),
    enabled: params.location.length >= 2,
    staleTime: 60_000,
  });
};
