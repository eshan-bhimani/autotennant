"use client";

/**
 * AutoTenant logo — house icon + wordmark.
 * `variant="light"` → dark text "Tenant" (for white/light backgrounds)
 * `variant="dark"`  → white text "Tenant" (for dark/colored backgrounds)
 */
export default function Logo({
  variant = "light",
  className = "",
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const tenantColor = variant === "light" ? "#1A1A2E" : "#FFFFFF";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* House icon */}
      <svg
        width="36"
        height="36"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="houseGrad" x1="10" y1="56" x2="54" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="roofGrad" x1="10" y1="28" x2="54" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
        </defs>

        {/* House body */}
        <rect x="14" y="30" width="36" height="28" rx="4" fill="url(#houseGrad)" />

        {/* Roof */}
        <path d="M8 30 L32 8 L56 30" stroke="url(#roofGrad)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Door */}
        <rect x="26" y="44" width="12" height="14" rx="2" fill="rgba(255,255,255,0.35)" />

        {/* Clock circle */}
        <circle cx="32" cy="34" r="7" stroke="white" strokeWidth="2" fill="none" opacity="0.9" />
        {/* Clock hands */}
        <line x1="32" y1="34" x2="32" y2="29.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
        <line x1="32" y1="34" x2="35.5" y2="34" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />

        {/* Decorative dots */}
        <circle cx="52" cy="10" r="2.5" fill="#8B5CF6" opacity="0.6" />
        <circle cx="48" cy="4" r="1.5" fill="#A78BFA" opacity="0.5" />
      </svg>

      {/* Wordmark */}
      <span className="text-[22px] font-bold tracking-[-0.01em]" style={{ fontStyle: "italic" }}>
        <span
          style={{
            background: "linear-gradient(135deg, #8B5CF6, #60A5FA)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Auto
        </span>
        <span style={{ color: tenantColor }}>Tenant</span>
      </span>
    </span>
  );
}
