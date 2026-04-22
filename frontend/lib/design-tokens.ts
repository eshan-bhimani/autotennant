/**
 * Design tokens — single source of truth for palette, spacing, radii, and
 * motion presets. Keep in sync with tailwind.config.ts so Tailwind classes and
 * Framer Motion transitions pull from the same values.
 */

export const colors = {
  primary: {
    DEFAULT: "#4F7CE8",
    hover: "#3D6AD6",
    soft: "rgba(79,124,232,0.10)",
    ring: "rgba(79,124,232,0.25)",
  },
  accent: {
    violet: "#7C3AED",
    teal: "#10B981",
    amber: "#F59E0B",
    rose: "#F43F5E",
  },
  surface: {
    canvas: "#FFFFFF",
    raised: "#FAFBFE",
    sunken: "#F5F6FA",
    card: "#F0F2F8",
    cardHover: "#E8ECF5",
    navBg: "#F9FAFB",
    dark: "#0B1628",
    darker: "#0A1324",
  },
  border: {
    DEFAULT: "#E5E7EB",
    subtle: "#F3F4F6",
    strong: "#D1D5DB",
    onDark: "rgba(255,255,255,0.10)",
  },
  text: {
    primary: "#0F0F0F",
    secondary: "#6B7280",
    muted: "#9CA3AF",
    onDark: "#FFFFFF",
    onDarkMuted: "rgba(255,255,255,0.60)",
  },
  glass: {
    light: "rgba(255,255,255,0.72)",
    lightBorder: "rgba(255,255,255,0.18)",
    strong: "rgba(255,255,255,0.85)",
    sm: "rgba(255,255,255,0.55)",
    dark: "rgba(11,22,40,0.70)",
    darkBorder: "rgba(255,255,255,0.08)",
  },
  state: {
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#4F7CE8",
  },
} as const;

/** Spacing scale in rems — matches Tailwind defaults with named aliases. */
export const spacing = {
  px: "1px",
  xs: "0.25rem", // 4
  sm: "0.5rem", // 8
  md: "0.75rem", // 12
  lg: "1rem", // 16
  xl: "1.5rem", // 24
  "2xl": "2rem", // 32
  "3xl": "3rem", // 48
  "4xl": "4rem", // 64
  "5xl": "6rem", // 96
} as const;

export const radius = {
  none: "0",
  sm: "6px",
  md: "10px",
  input: "10px",
  btn: "12px",
  icon: "12px",
  panel: "16px",
  card: "20px",
  cardLg: "24px",
  modal: "24px",
  chip: "20px",
  full: "9999px",
} as const;

export const shadow = {
  soft: "0 2px 8px rgba(0,0,0,0.05)",
  card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
  cardHover:
    "0 8px 24px rgba(79,124,232,0.10), 0 2px 8px rgba(0,0,0,0.04)",
  elevated: "0 12px 40px rgba(0,0,0,0.12)",
  glow: "0 0 20px rgba(79,124,232,0.25)",
  glowLg: "0 0 40px rgba(79,124,232,0.20)",
  glass: "0 1px 0 rgba(255,255,255,0.5) inset, 0 8px 32px rgba(15,23,42,0.06)",
} as const;

/**
 * Motion presets for Framer Motion. Keep durations short — SaaS motion is a
 * supporting actor, not the main event.
 */
export const easings = {
  /** Default easing for most UI motion. */
  standard: [0.25, 0.1, 0.25, 1] as const,
  /** Entrance, "out" curve — for elements appearing. */
  entrance: [0.22, 1, 0.36, 1] as const,
  /** Exit, "in" curve — for elements leaving. */
  exit: [0.4, 0, 1, 1] as const,
  /** Emphasized, for hero-ish entrances. */
  emphasized: [0.2, 0.8, 0.2, 1] as const,
} as const;

export const durations = {
  instant: 0.1,
  fast: 0.15,
  base: 0.25,
  default: 0.4,
  slow: 0.6,
  hero: 0.8,
} as const;

export const motion = {
  /** Standard fade-up entrance. */
  fadeUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: durations.default, ease: easings.entrance },
  },
  /** Subtler fade-in without translation. */
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: durations.base, ease: easings.standard },
  },
  /** Scale-in for modals and popovers. */
  scaleIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: { duration: durations.base, ease: easings.standard },
  },
  /** Spring for layout shifts and drag feedback. */
  spring: { type: "spring", stiffness: 320, damping: 28 } as const,
  /** Default stagger delay for list children (seconds). */
  stagger: 0.06,
  /** Button press/hover scale. */
  button: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: durations.fast, ease: easings.standard },
  },
} as const;

export type Motion = typeof motion;
export type Easing = typeof easings[keyof typeof easings];
