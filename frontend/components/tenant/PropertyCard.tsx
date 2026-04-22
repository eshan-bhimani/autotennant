"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BedDouble, Bath, MapPin } from "lucide-react";
import type { PropertyResponse } from "@/types/api";
import { formatCurrency } from "@/lib/utils";
import { durations, easings } from "@/lib/design-tokens";

interface PropertyCardProps {
  property: PropertyResponse;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const photo = property.photos[0];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: durations.base, ease: easings.standard }}
    >
      <Link
        href={`/apply/${property.id}`}
        className="group block overflow-hidden rounded-card border border-border-light bg-white shadow-card transition-shadow hover:shadow-card-hover"
      >
        <div className="relative h-48 w-full overflow-hidden bg-card-light">
          {photo ? (
            <Image
              src={photo}
              alt={property.address_line1}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              No photo
            </div>
          )}
          {/* Glass price pill overlay */}
          {property.monthly_rent !== null && (
            <div className="glass-sm absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-text-primary shadow-soft">
              {formatCurrency(property.monthly_rent)}/mo
            </div>
          )}
        </div>
        <div className="p-5">
          <p className="text-[15px] font-semibold text-text-primary group-hover:text-primary">
            {property.address_line1}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
            <MapPin size={12} />
            {property.city}, {property.state} {property.zip}
          </p>
          <div className="mt-4 flex items-center gap-4 border-t border-border-subtle pt-4 text-sm text-text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <BedDouble size={14} className="text-text-muted" />
              {property.bedrooms ?? "–"} bd
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bath size={14} className="text-text-muted" />
              {property.bathrooms ?? "–"} ba
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
