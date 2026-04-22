"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { durations, easings } from "@/lib/design-tokens";

type Direction = "up" | "down" | "left" | "right" | "none";

interface FadeInProps extends Omit<HTMLMotionProps<"div">, "initial" | "animate" | "transition"> {
  /** Delay before the animation starts, in seconds. */
  delay?: number;
  /** Direction the element fades in from. */
  direction?: Direction;
  /** Distance to translate, in px. Defaults to 12. */
  offset?: number;
  /** Duration in seconds. */
  duration?: number;
  /** Animate when in view (scroll-triggered) instead of on mount. */
  whenInView?: boolean;
}

function directionToOffset(direction: Direction, offset: number) {
  switch (direction) {
    case "up":
      return { y: offset };
    case "down":
      return { y: -offset };
    case "left":
      return { x: offset };
    case "right":
      return { x: -offset };
    default:
      return {};
  }
}

/**
 * Standard fade-in entrance. Use for hero headings, banners, and isolated
 * blocks. For lists, prefer StaggerList + StaggerItem.
 */
export default function FadeIn({
  children,
  delay = 0,
  direction = "up",
  offset = 12,
  duration = durations.default,
  whenInView = false,
  ...rest
}: FadeInProps) {
  const hidden = { opacity: 0, ...directionToOffset(direction, offset) };
  const shown = { opacity: 1, x: 0, y: 0 };
  const transition = { duration, delay, ease: easings.entrance };

  if (whenInView) {
    return (
      <motion.div
        initial={hidden}
        whileInView={shown}
        viewport={{ once: true, margin: "-80px" }}
        transition={transition}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div initial={hidden} animate={shown} transition={transition} {...rest}>
      {children}
    </motion.div>
  );
}
