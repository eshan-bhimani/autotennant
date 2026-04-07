"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import { useZillowSearch, ZillowListing } from "@/hooks/useZillowSearch";
import PropertyCard from "@/components/tenant/PropertyCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

function ZillowCard({ listing }: { listing: ZillowListing }) {
  const price =
    typeof listing.price === "number"
      ? `$${listing.price.toLocaleString()}`
      : listing.price || "–";

  return (
    <motion.div
      className="group overflow-hidden rounded-[20px] border border-border-light bg-white transition-all hover:border-primary/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
    >
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-card-light to-white">
        {listing.imgSrc ? (
          <img
            src={listing.imgSrc}
            alt={listing.address}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg className="h-12 w-12 text-text-muted/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}
        {listing.daysOnZillow != null && listing.daysOnZillow <= 3 && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
            New
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
          Zillow
        </span>
      </div>
      <div className="p-5">
        <p className="text-base font-semibold text-text-primary">{price}<span className="text-sm font-normal text-text-muted">/mo</span></p>
        <p className="mt-1 text-sm text-text-secondary line-clamp-1">{listing.address}</p>
        <div className="mt-3 flex items-center gap-4 text-sm text-text-muted">
          {listing.bedrooms != null && (
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              {listing.bedrooms} bd
            </span>
          )}
          {listing.bathrooms != null && (
            <span>{listing.bathrooms} ba</span>
          )}
          {listing.livingArea != null && (
            <span>{listing.livingArea.toLocaleString()} sqft</span>
          )}
        </div>
        {listing.detailUrl && (
          <a
            href={listing.detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View on Zillow
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        )}
      </div>
    </motion.div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [source, setSource] = useState<"all" | "autotenant" | "zillow">("all");
  const [filters, setFilters] = useState({ beds: "", baths: "", minPrice: "", maxPrice: "" });

  const { data: internalData, isLoading: internalLoading } = usePropertySearch(searchTerm, page);
  const { data: zillowData, isLoading: zillowLoading } = useZillowSearch({
    location: searchTerm || "Atlanta, GA",
    page,
    beds: filters.beds,
    baths: filters.baths,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  });

  const isLoading = (source !== "zillow" && internalLoading) || (source !== "autotenant" && zillowLoading);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
    setPage(1);
  };

  const zillowResults = zillowData?.results ?? [];
  const internalResults = internalData?.items ?? [];

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
            Find Your Next Home
          </motion.h1>
          <p className="mt-1 text-sm text-text-secondary">Search listings from AutoTenant and Zillow in one place.</p>
        </div>
      </div>

      {/* Search + Filters */}
      <form onSubmit={handleSearch} className="mt-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city, state, or zip code..."
              className="w-full rounded-btn border border-border-light py-3 pl-11 pr-4 text-[15px] text-text-primary focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15"
            />
          </div>
          <button
            type="submit"
            className="rounded-btn bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,124,232,0.30)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            Search
          </button>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Source toggle */}
          <div className="flex rounded-btn border border-border-light bg-white p-1">
            {([["all", "All"], ["autotenant", "AutoTenant"], ["zillow", "Zillow"]] as const).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => { setSource(val); setPage(1); }}
                className={`rounded-[8px] px-3.5 py-1.5 text-xs font-semibold transition ${
                  source === val
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <select
            value={filters.beds}
            onChange={(e) => setFilters((f) => ({ ...f, beds: e.target.value }))}
            className="rounded-btn border border-border-light bg-white px-3 py-2 text-sm text-text-primary"
          >
            <option value="">Beds</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>

          <select
            value={filters.baths}
            onChange={(e) => setFilters((f) => ({ ...f, baths: e.target.value }))}
            className="rounded-btn border border-border-light bg-white px-3 py-2 text-sm text-text-primary"
          >
            <option value="">Baths</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
          </select>

          <select
            value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
            className="rounded-btn border border-border-light bg-white px-3 py-2 text-sm text-text-primary"
          >
            <option value="">Max Price</option>
            <option value="1000">$1,000</option>
            <option value="1500">$1,500</option>
            <option value="2000">$2,000</option>
            <option value="2500">$2,500</option>
            <option value="3000">$3,000</option>
            <option value="5000">$5,000</option>
          </select>
        </div>
      </form>

      {isLoading && <LoadingSpinner className="mt-12" />}

      {!isLoading && (
        <div className="mt-6">
          {/* AutoTenant listings */}
          {source !== "zillow" && internalResults.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-text-primary">AutoTenant Listings</h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  {internalData?.total ?? 0}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {internalResults.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </>
          )}

          {/* Zillow listings */}
          {source !== "autotenant" && zillowResults.length > 0 && (
            <>
              <div className={`flex items-center gap-2 ${source !== "zillow" && internalResults.length > 0 ? "mt-10" : ""}`}>
                <h2 className="text-lg font-semibold text-text-primary">Zillow Listings</h2>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600">
                  {zillowData?.totalResults ?? 0}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {zillowResults.map((listing) => (
                  <ZillowCard key={listing.zpid} listing={listing} />
                ))}
              </div>

              {/* Zillow pagination */}
              {(zillowData?.totalPages ?? 1) > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-btn border border-border-light px-4 py-2 text-sm font-medium text-text-primary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4 text-sm text-text-secondary">
                    Page {zillowData?.currentPage ?? 1} of {zillowData?.totalPages ?? 1}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= (zillowData?.totalPages ?? 1)}
                    className="rounded-btn border border-border-light px-4 py-2 text-sm font-medium text-text-primary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty states */}
          {source !== "zillow" && internalResults.length === 0 && source !== "autotenant" && zillowResults.length === 0 && searchTerm && (
            <motion.div
              className="mt-8 rounded-[20px] border border-dashed border-border-light bg-gradient-to-br from-white to-card-light p-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <p className="mt-4 text-base font-medium text-text-primary">No listings found</p>
              <p className="mt-1 text-sm text-text-secondary">Try adjusting your search or filters.</p>
            </motion.div>
          )}

          {!searchTerm && source !== "zillow" && internalResults.length === 0 && zillowResults.length === 0 && (
            <motion.div
              className="mt-8 rounded-[20px] border border-dashed border-border-light bg-gradient-to-br from-white to-card-light p-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <p className="mt-4 text-base font-medium text-text-primary">Search for a location</p>
              <p className="mt-1 text-sm text-text-secondary">Enter a city, state, or zip code to browse available rentals.</p>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
