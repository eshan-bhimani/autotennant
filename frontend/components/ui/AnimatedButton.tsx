"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { durations, easings } from "@/lib/design-tokens";

type Variant = "primary" | "secondary" | "ghost" | "glass";
type Size = "sm" | "md" | "lg";

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-[0_4px_14px_rgba(79,124,232,0.30)] hover:bg-primary-hover",
  secondary:
    "border border-border-light bg-white text-text-primary hover:bg-card-light",
  ghost: "text-text-secondary hover:bg-card-light hover:text-text-primary",
  glass:
    "border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-[15px]",
};

/**
 * Opinionated motion-enabled button. For purely visual elements (Links, divs),
 * reach for motion.button/motion.a directly — this wraps the common case.
 */
const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={disabled || loading ? undefined : { scale: 1.02 }}
        whileTap={disabled || loading ? undefined : { scale: 0.98 }}
        transition={{ duration: durations.fast, ease: easings.standard }}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
            <span>Loading…</span>
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  },
);
AnimatedButton.displayName = "AnimatedButton";

export default AnimatedButton;
