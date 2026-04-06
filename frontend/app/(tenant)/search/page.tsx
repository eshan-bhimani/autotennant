"use client";

import { useState } from "react";
import { usePropertySearch } from "@/hooks/usePropertySearch";
import PropertyCard from "@/components/tenant/PropertyCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

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
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Find Your Next Home</h1>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by city, address, or keywords..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {isLoading && <LoadingSpinner className="mt-12" />}

      {data && (
        <>
          <p className="mt-6 text-sm text-gray-500">
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
                className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {data.page} of {Math.ceil(data.total / data.per_page)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(data.total / data.per_page)}
                className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {!isLoading && !data && searchTerm && (
        <p className="mt-12 text-center text-gray-500">No results found.</p>
      )}
    </div>
  );
}
