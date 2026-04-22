"use client";

import { motion } from "framer-motion";
import { durations, easings } from "@/lib/design-tokens";

interface ScoreBarProps {
  score: number | null;
}

export default function ScoreBar({ score }: ScoreBarProps) {
  if (score === null) {
    return <span className="text-sm text-text-muted">Pending</span>;
  }

  let tone = "from-rose-500 to-rose-600";
  if (score >= 70) tone = "from-emerald-500 to-emerald-600";
  else if (score >= 40) tone = "from-amber-500 to-amber-600";

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-28 overflow-hidden rounded-full bg-card-light">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${tone}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: durations.slow, ease: easings.emphasized }}
        />
      </div>
      <span className="text-sm font-semibold tabular-nums text-text-primary">{score}</span>
    </div>
  );
}
