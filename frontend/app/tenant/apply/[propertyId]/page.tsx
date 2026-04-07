"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubmitApplication } from "@/hooks/useTenantApplications";
import api from "@/lib/api";
import type { PropertyResponse, PropertySearchResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { formatCurrency } from "@/lib/utils";

const applySchema = z.object({
  annual_income: z.coerce.number().min(0, "Income must be positive"),
  employer_name: z.string().min(1, "Employer name is required"),
  employment_status: z.enum(["EMPLOYED", "SELF_EMPLOYED", "STUDENT", "OTHER"]),
  confirm: z.literal(true, {
    errorMap: () => ({ message: "You must confirm the information is accurate" }),
  }),
});

type ApplyForm = z.infer<typeof applySchema>;

export default function ApplyPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const router = useRouter();
  const submitApp = useSubmitApplication();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const { data: property, isLoading: propertyLoading } = useQuery({
    queryKey: ["publicProperty", propertyId],
    queryFn: () =>
      api.get<PropertySearchResponse>(`/properties/search`, { params: { q: propertyId } }).then((r) => {
        const found = r.data.items?.find((p: PropertyResponse) => p.id === propertyId);
        return found ?? null;
      }),
  });

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<ApplyForm>({
    resolver: zodResolver(applySchema),
    defaultValues: { employment_status: "EMPLOYED" },
  });

  const handleNext = async () => {
    const valid = await trigger(["annual_income", "employer_name", "employment_status"]);
    if (valid) setStep(2);
  };

  const onSubmit = async () => {
    setError(null);
    try {
      await submitApp.mutateAsync({ property_id: propertyId });
      router.push("/applications");
    } catch {
      setError("Failed to submit application. You may have already applied.");
    }
  };

  if (propertyLoading) return <LoadingSpinner className="mt-20" />;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Apply for Rental</h1>
      {property && (
        <div className="mt-2 rounded-lg border bg-white p-4">
          <p className="font-medium">{property.address_line1}</p>
          <p className="text-sm text-gray-500">
            {property.city}, {property.state} {property.zip}
          </p>
          {property.monthly_rent !== null && (
            <p className="mt-1 text-sm font-medium text-blue-600">
              {formatCurrency(property.monthly_rent)}/mo
            </p>
          )}
        </div>
      )}

      {/* Step indicators */}
      <div className="mt-6 flex gap-2">
        <div
          className={`h-1 flex-1 rounded ${step >= 1 ? "bg-blue-600" : "bg-gray-200"}`}
        />
        <div
          className={`h-1 flex-1 rounded ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold">Step 1: Employment & Income</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Employment Status
              </label>
              <select
                {...register("employment_status")}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="EMPLOYED">Employed</option>
                <option value="SELF_EMPLOYED">Self-Employed</option>
                <option value="STUDENT">Student</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Employer Name
              </label>
              <input
                {...register("employer_name")}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.employer_name && (
                <p className="mt-1 text-sm text-red-600">{errors.employer_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Annual Income ($)
              </label>
              <input
                {...register("annual_income")}
                type="number"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.annual_income && (
                <p className="mt-1 text-sm text-red-600">{errors.annual_income.message}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold">Step 2: Review & Submit</h2>
            <p className="text-sm text-gray-600">
              By submitting this application, a background and credit check will be
              initiated through TransUnion SmartMove. You will be redirected to complete
              payment for the screening (~$35-40).
            </p>

            <label className="flex items-start gap-2">
              <input
                {...register("confirm")}
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                I confirm all information provided is accurate and I authorize a
                background check.
              </span>
            </label>
            {errors.confirm && (
              <p className="text-sm text-red-600">{errors.confirm.message}</p>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitApp.isPending}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitApp.isPending ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
