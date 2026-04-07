"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import PropertyCard from "@/components/tenant/PropertyCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const ease = [0.22, 1, 0.36, 1] as const;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePropertySearch(searchTerm, page);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
    setPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
    >
      <h1 className="text-2xl font-bold text-text-primary">Find Your Next Home</h1>

      <form onSubmit={handleSearch} className="mt-6 flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by city, address, or keywords..."
          className="flex-1 rounded-input border-[1.5px] border-border-light px-4 py-3 text-[15px] text-text-primary focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15"
        />
        <button
          type="submit"
          className="rounded-btn bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,124,232,0.30)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
        >
          Search
        </button>
      </form>

      {isLoading && <LoadingSpinner className="mt-12" />}

      {data && (
        <>
          <p className="mt-6 text-sm text-text-muted">
            {data.total} result{data.total !== 1 ? "s" : ""} found
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {data.total > data.per_page && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-btn border-[1.5px] border-border-light px-4 py-2 text-sm font-medium text-text-primary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-sm text-text-secondary">
                Page {data.page} of {Math.ceil(data.total / data.per_page)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(data.total / data.per_page)}
                className="rounded-btn border-[1.5px] border-border-light px-4 py-2 text-sm font-medium text-text-primary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {!isLoading && !data && searchTerm && (
        <p className="mt-12 text-center text-text-secondary">No results found.</p>
      )}
    </motion.div>
  );
}
