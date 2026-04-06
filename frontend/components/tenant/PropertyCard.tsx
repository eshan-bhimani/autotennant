import Image from "next/image";
import Link from "next/link";
import type { PropertyResponse } from "@/types/api";
import { formatCurrency } from "@/lib/utils";

interface PropertyCardProps {
  property: PropertyResponse;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link
      href={`/apply/${property.id}`}
      className="block overflow-hidden rounded-lg border bg-white transition hover:shadow-md"
    >
      <div className="relative h-48 w-full bg-gray-200">
        {property.photos[0] ? (
          <Image
            src={property.photos[0]}
            alt={property.address_line1}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No photo
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold text-gray-900">
          {property.monthly_rent !== null
            ? `${formatCurrency(property.monthly_rent)}/mo`
            : "Price TBD"}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          {property.bedrooms ?? "–"} bd / {property.bathrooms ?? "–"} ba
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {property.address_line1}, {property.city}, {property.state} {property.zip}
        </p>
      </div>
    </Link>
  );
}
