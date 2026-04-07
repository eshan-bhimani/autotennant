"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useProperties, useCreateProperty } from "@/hooks/useProperties";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { formatCurrency } from "@/lib/utils";
import type { PropertyCreate } from "@/types/api";

const propertySchema = z.object({
  address_line1: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "Use 2-letter state code"),
  zip: z.string().min(5, "ZIP is required"),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().min(0).optional(),
  monthly_rent: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
});

type PropertyForm = z.infer<typeof propertySchema>;

export default function PropertiesPage() {
  const { data, isLoading } = useProperties();
  const createProperty = useCreateProperty();
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PropertyForm>({ resolver: zodResolver(propertySchema) });

  const onSubmit = async (formData: PropertyForm) => {
    await createProperty.mutateAsync(formData as PropertyCreate);
    reset();
    setShowForm(false);
  };

  if (isLoading) return <LoadingSpinner className="mt-20" />;

  const properties = data?.items ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Add Property"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 rounded-lg border bg-white p-6 space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                {...register("address_line1")}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.address_line1 && (
                <p className="mt-1 text-sm text-red-600">{errors.address_line1.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                {...register("city")}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input
                {...register("state")}
                placeholder="FL"
                maxLength={2}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ZIP</label>
              <input
                {...register("zip")}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.zip && (
                <p className="mt-1 text-sm text-red-600">{errors.zip.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
              <input
                {...register("bedrooms")}
                type="number"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
              <input
                {...register("bathrooms")}
                type="number"
                step="0.5"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Monthly Rent ($)</label>
              <input
                {...register("monthly_rent")}
                type="number"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register("description")}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={createProperty.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createProperty.isPending ? "Creating..." : "Create Property"}
          </button>
        </form>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((prop) => (
          <Link
            key={prop.id}
            href={`/properties/${prop.id}`}
            className="block rounded-lg border bg-white p-6 transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{prop.address_line1}</p>
                <p className="text-sm text-gray-500">
                  {prop.city}, {prop.state} {prop.zip}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  prop.status === "LISTED"
                    ? "bg-green-100 text-green-800"
                    : prop.status === "OCCUPIED"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {prop.status}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
              <span>{prop.bedrooms ?? "–"} bd</span>
              <span>{prop.bathrooms ?? "–"} ba</span>
              <span>
                {prop.monthly_rent !== null ? `${formatCurrency(prop.monthly_rent)}/mo` : "–"}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {prop.application_count} application{prop.application_count !== 1 ? "s" : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
