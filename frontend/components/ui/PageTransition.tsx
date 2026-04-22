"use client";

import { motion } from "framer-motion";
import { durations, easings } from "@/lib/design-tokens";

/**
 * Wraps a route's root element to fade it in on navigation. Keep it subtle —
 * a page flash is worse than no animation. 200–300ms is the sweet spot.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: durations.base, ease: easings.entrance }}
    >
      {children}
    </motion.div>
  );
}
