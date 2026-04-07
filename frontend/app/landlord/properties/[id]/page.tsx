"use client";

import { useParams } from "next/navigation";
import { useState, useCallback } from "react";
import { useProperty, useOptimizeListing, usePhotoUploadUrl, useConfirmPhoto, useUpdateProperty } from "@/hooks/useProperties";
import { useApplications } from "@/hooks/useApplications";
import ApplicationCard from "@/components/landlord/ApplicationCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { formatCurrency } from "@/lib/utils";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading } = useProperty(id);
  const { data: applications } = useApplications(id);
  const optimizeMutation = useOptimizeListing(id);
  const photoUrlMutation = usePhotoUploadUrl(id);
  const confirmPhotoMutation = useConfirmPhoto(id);
  const updateMutation = useUpdateProperty(id);
  const [optimizeResult, setOptimizeResult] = useState<{
    description: string;
    suggested_price: number;
    tags: string[];
  } | null>(null);

  const handleOptimize = async () => {
    const result = await optimizeMutation.mutateAsync();
    setOptimizeResult(result);
  };

  const handlePhotoUpload = useCallback(async () => {
    const { upload_url, s3_key } = await photoUrlMutation.mutateAsync();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      await fetch(upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      await confirmPhotoMutation.mutateAsync(s3_key);
    };
    input.click();
  }, [photoUrlMutation, confirmPhotoMutation]);

  const handleListProperty = async () => {
    await updateMutation.mutateAsync({ status: "LISTED" });
  };

  if (isLoading || !property) return <LoadingSpinner className="mt-20" />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{property.address_line1}</h1>
          <p className="text-gray-500">
            {property.city}, {property.state} {property.zip}
          </p>
        </div>
        <div className="flex gap-2">
          {property.status === "VACANT" && (
            <button
              onClick={handleListProperty}
              disabled={updateMutation.isPending}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              List Property
            </button>
          )}
          <button
            onClick={handlePhotoUpload}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Upload Photo
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          {property.photos.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {property.photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Property photo ${i + 1}`}
                  className="h-40 w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          {/* Details */}
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold">Details</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Bedrooms</span>
                <p className="font-medium">{property.bedrooms ?? "–"}</p>
              </div>
              <div>
                <span className="text-gray-500">Bathrooms</span>
                <p className="font-medium">{property.bathrooms ?? "–"}</p>
              </div>
              <div>
                <span className="text-gray-500">Monthly Rent</span>
                <p className="font-medium">
                  {property.monthly_rent !== null ? formatCurrency(property.monthly_rent) : "–"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Status</span>
                <p className="font-medium">{property.status}</p>
              </div>
            </div>
            {property.description && (
              <div className="mt-4">
                <span className="text-sm text-gray-500">Description</span>
                <p className="mt-1 text-sm">{property.description}</p>
              </div>
            )}
          </div>

          {/* AI Optimization */}
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">AI Listing Optimizer</h2>
              <button
                onClick={handleOptimize}
                disabled={optimizeMutation.isPending}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {optimizeMutation.isPending ? "Optimizing..." : "Optimize with AI"}
              </button>
            </div>
            {property.ai_optimized_description && !optimizeResult && (
              <div className="mt-4 rounded-lg bg-purple-50 p-4">
                <p className="text-sm font-medium text-purple-800">AI-Optimized Description</p>
                <p className="mt-1 text-sm text-purple-700">{property.ai_optimized_description}</p>
              </div>
            )}
            {optimizeResult && (
              <div className="mt-4 space-y-3 rounded-lg bg-purple-50 p-4">
                <div>
                  <p className="text-sm font-medium text-purple-800">AI-Optimized Description</p>
                  <p className="mt-1 text-sm text-purple-700">{optimizeResult.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-800">Suggested Price</p>
                  <p className="text-sm text-purple-700">{formatCurrency(optimizeResult.suggested_price)}/mo</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {optimizeResult.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-purple-200 px-2 py-1 text-xs text-purple-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Applicants sidebar */}
        <div>
          <h2 className="text-lg font-semibold">
            Applicants ({applications?.total ?? 0})
          </h2>
          <div className="mt-4 space-y-3">
            {applications?.items.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
            {(!applications || applications.items.length === 0) && (
              <p className="text-sm text-gray-500">No applications yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
