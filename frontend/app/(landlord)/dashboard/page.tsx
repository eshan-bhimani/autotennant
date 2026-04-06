"use client";

import Link from "next/link";
import { useProperties } from "@/hooks/useProperties";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const { data, isLoading } = useProperties();

  if (isLoading) return <LoadingSpinner className="mt-20" />;

  const properties = data?.items ?? [];
  const totalApplications = properties.reduce((sum, p) => sum + p.application_count, 0);
  const listedCount = properties.filter((p) => p.status === "LISTED").length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/properties"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Manage Properties
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-gray-500">Total Properties</p>
          <p className="mt-1 text-3xl font-bold">{properties.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-gray-500">Active Listings</p>
          <p className="mt-1 text-3xl font-bold">{listedCount}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-gray-500">Total Applications</p>
          <p className="mt-1 text-3xl font-bold">{totalApplications}</p>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-gray-900">Your Properties</h2>
      {properties.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed bg-white p-12 text-center">
          <p className="text-gray-500">No properties yet.</p>
          <Link
            href="/properties"
            className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Add your first property
          </Link>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Rent</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Applications</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {properties.map((prop) => (
                <tr key={prop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link href={`/properties/${prop.id}`} className="font-medium text-blue-600 hover:text-blue-500">
                      {prop.address_line1}
                    </Link>
                    <p className="text-sm text-gray-500">{prop.city}, {prop.state}</p>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {prop.monthly_rent !== null ? formatCurrency(prop.monthly_rent) : "–"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        prop.status === "LISTED"
                          ? "bg-green-100 text-green-800"
                          : prop.status === "OCCUPIED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {prop.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{prop.application_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
