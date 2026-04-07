"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ApplicationsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
    >
      <h1 className="text-2xl font-bold text-text-primary">Applications</h1>
      <p className="mt-2 text-sm text-text-secondary">
        View applications from individual property pages.
      </p>
      <div className="mt-6 rounded-[20px] border border-dashed border-border-light bg-white p-12 text-center">
        <p className="text-text-secondary">
          Select a property to view its applications.
        </p>
      </div>
    </motion.div>
  );
}
