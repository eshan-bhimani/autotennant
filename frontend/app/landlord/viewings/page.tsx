"use client";

import { motion } from "framer-motion";

export default function ViewingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
    >
      <h1 className="text-2xl font-bold text-text-primary">Viewings</h1>
      <div className="mt-6 rounded-[20px] border border-dashed border-border-light bg-white p-12 text-center">
        <p className="text-text-secondary">No viewings scheduled yet.</p>
      </div>
    </motion.div>
  );
}
