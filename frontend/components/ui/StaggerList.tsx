"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { durations, easings, motion as motionTokens } from "@/lib/design-tokens";

interface StaggerListProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate" | "variants"> {
  /** Delay between child animations, in seconds. */
  stagger?: number;
  /** Delay before first child animates. */
  delayChildren?: number;
  /** Animate when in view instead of on mount. */
  whenInView?: boolean;
}

/**
 * Wrapper that orchestrates a staggered entrance for its StaggerItem children.
 * Children must be StaggerItem to inherit the variant.
 */
export function StaggerList({
  children,
  stagger = motionTokens.stagger,
  delayChildren = 0,
  whenInView = false,
  ...rest
}: StaggerListProps) {
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: stagger,
        delayChildren,
      },
    },
  };

  if (whenInView) {
    return (
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" {...rest}>
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  /** Vertical offset of the hidden state, in px. Defaults to 12. */
  offset?: number;
}

export function StaggerItem({ children, offset = 12, ...rest }: StaggerItemProps) {
  const item = {
    hidden: { opacity: 0, y: offset },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: durations.default, ease: easings.entrance },
    },
  };

  return (
    <motion.div variants={item} {...rest}>
      {children}
    </motion.div>
  );
}

export default StaggerList;
