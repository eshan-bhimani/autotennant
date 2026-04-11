"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useAppStore } from "@/lib/store";
import Logo from "@/components/shared/Logo";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ─── Role Selector ─── */

function RoleSelector({
  selected,
  onChange,
}: {
  selected: "landlord" | "tenant" | null;
  onChange: (role: "landlord" | "tenant") => void;
}) {
  return (
    <div
      className="relative inline-flex gap-1 rounded-full p-[5px]"
      style={{
        background: "rgba(255, 255, 255, 0.18)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.35)",
      }}
    >
      {(["landlord", "tenant"] as const).map((role) => (
        <button
          key={role}
          onClick={() => onChange(role)}
          className="relative z-10 rounded-full px-7 py-2.5 text-[15px] font-medium transition"
          style={{
            color: selected === role ? "#0F0F0F" : "rgba(255,255,255,0.8)",
            fontWeight: selected === role ? 600 : 500,
          }}
        >
          {selected === role && (
            <motion.div
              layoutId="roleIndicator"
              className="absolute inset-0 rounded-full bg-white"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 capitalize">{role}</span>
        </button>
      ))}
    </div>
  );
}

/* ─── Integration Logos ─── */

const integrationLogos: { name: string; logo: React.ReactNode }[] = [
  {
    name: "TransUnion",
    logo: (
      <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none">
        <rect x="6" y="12" width="28" height="16" rx="3" fill="#00A3E0" />
        <text x="20" y="23" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="sans-serif">TU</text>
        <path d="M14 10 Q20 6 26 10" stroke="#00A3E0" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "DocuSign",
    logo: (
      <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none">
        <rect x="8" y="8" width="24" height="24" rx="4" fill="#FFD940" />
        <path d="M16 20 L19 23 L25 16" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Twilio",
    logo: (
      <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none">
        <circle cx="20" cy="20" r="14" fill="#F22F46" />
        <circle cx="15.5" cy="15.5" r="2.5" fill="white" />
        <circle cx="24.5" cy="15.5" r="2.5" fill="white" />
        <circle cx="15.5" cy="24.5" r="2.5" fill="white" />
        <circle cx="24.5" cy="24.5" r="2.5" fill="white" />
      </svg>
    ),
  },
  {
    name: "Google",
    logo: (
      <svg viewBox="0 0 40 40" className="h-7 w-7">
        <path d="M32.6 20.2c0-.7-.1-1.4-.2-2H20v3.8h7.1a6.1 6.1 0 01-2.6 4l4.2 3.3c2.5-2.3 3.9-5.7 3.9-9.1z" fill="#4285F4" />
        <path d="M20 33c3.5 0 6.5-1.2 8.7-3.2l-4.2-3.3c-1.2.8-2.7 1.3-4.5 1.3-3.4 0-6.3-2.3-7.3-5.4H8.3v3.4C10.5 30.3 14.9 33 20 33z" fill="#34A853" />
        <path d="M12.7 22.4c-.3-.8-.4-1.6-.4-2.4s.2-1.6.4-2.4v-3.4H8.3A13 13 0 007 20c0 2.1.5 4.1 1.4 5.9l4.3-3.5z" fill="#FBBC05" />
        <path d="M20 12.6c1.9 0 3.7.7 5 1.9l3.8-3.8C26.5 8.7 23.5 7 20 7c-5.1 0-9.5 2.7-11.7 6.8l4.4 3.4c1-3.1 3.9-5.4 7.3-5.4z" fill="#EA4335" />
      </svg>
    ),
  },
  {
    name: "Stripe",
    logo: (
      <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none">
        <rect x="6" y="6" width="28" height="28" rx="6" fill="#635BFF" />
        <path d="M18.5 15.5c0-1 .8-1.4 2.1-1.4 1.9 0 4.2.6 6.1 1.6V10c-2-.8-4.1-1.1-6.1-1.1-5 0-8.3 2.6-8.3 7 0 6.8 9.4 5.7 9.4 8.7 0 1.2-1 1.5-2.4 1.5-2.1 0-4.7-.9-6.8-2v5.8c2.3 1 4.6 1.4 6.8 1.4 5.1 0 8.6-2.5 8.6-7 0-7.3-9.4-6-9.4-8.8z" fill="white" />
      </svg>
    ),
  },
  {
    name: "Zillow",
    logo: (
      <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none">
        <rect x="6" y="6" width="28" height="28" rx="6" fill="#006AFF" />
        <path d="M14 15 L26 15 L20 10 Z" fill="white" />
        <rect x="15" y="17" width="10" height="13" rx="1" fill="white" />
        <rect x="18" y="22" width="4" height="8" rx="0.5" fill="#006AFF" />
      </svg>
    ),
  },
];

function IntegrationStrip() {
  return (
    <motion.div
      className="mt-10 flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9, duration: 0.5 }}
    >
      <p className="text-[13px] uppercase tracking-[0.08em] text-white/60">
        Works with your existing tools
      </p>
      <motion.div
        className="mt-4 flex gap-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07, delayChildren: 1 } } }}
      >
        {integrationLogos.map((i) => (
          <motion.div
            key={i.name}
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
            title={i.name}
          >
            {i.logo}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ─── Hero Section ─── */

function HeroSection() {
  const router = useRouter();
  const { activeRole, setActiveRole, isAuthenticated } = useAppStore();
  const [loggedIn, setLoggedIn] = useState(false);
  const [heroRole, setHeroRole] = useState<"landlord" | "tenant" | null>(null);
  const [clickedBtn, setClickedBtn] = useState<string | null>(null);

  useEffect(() => {
    const auth = isAuthenticated();
    setLoggedIn(auth);
    if (auth && activeRole) setHeroRole(activeRole);
  }, [activeRole, isAuthenticated]);

  const handleRoleSelect = (role: "landlord" | "tenant") => {
    setHeroRole(role);
    setActiveRole(role);
  };

  const handleDashboardClick = async (role: "landlord" | "tenant") => {
    setClickedBtn(role);
    setActiveRole(role);
    setHeroRole(role);
    await new Promise((r) => setTimeout(r, 220));
    router.push(`/${role}/dashboard`);
  };

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #87CEEB 0%, #B8D4E8 30%, #E8D5B7 70%, #F5C984 100%)",
        }}
      />

      {/* Hero content — nav is now fixed at top level */}
      <div className="h-16" /> {/* Spacer for fixed navbar */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        {loggedIn && (
          <motion.div className="mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5, ease }}>
            <RoleSelector selected={heroRole} onChange={handleRoleSelect} />
          </motion.div>
        )}

        {/* Two-tone headline */}
        <h1 className="font-display leading-[1.05] tracking-[-0.02em]" style={{ fontSize: "clamp(52px, 8vw, 88px)" }}>
          <motion.span className="block text-white" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
            Stop Searching.
          </motion.span>
          <motion.span className="block text-[#4F7CE8]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7, ease }}>
            Start Moving In.
          </motion.span>
        </h1>

        <motion.p className="mt-6 max-w-[520px] text-lg text-white/70" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7, ease }}>
          AI-powered tenant screening, automated leases, and smart property management. From listing to lease in days, not weeks.
        </motion.p>

        {/* CTAs */}
        {loggedIn ? (
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            {(["landlord", "tenant"] as const).map((role, i) => (
              <motion.button
                key={role}
                onClick={() => handleDashboardClick(role)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, scale: clickedBtn === role ? [0.96, 1.04, 1] : 1 }}
                whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(79,124,232,0.40)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ delay: clickedBtn ? 0 : 0.3 + i * 0.1, duration: clickedBtn === role ? 0.2 : 0.5, ease }}
                className={`flex items-center gap-2 rounded-btn px-7 py-3.5 text-[15px] font-semibold text-white transition ${heroRole === role ? "bg-primary shadow-[0_8px_24px_rgba(79,124,232,0.40)]" : "bg-primary shadow-[0_4px_14px_rgba(79,124,232,0.30)]"}`}
              >
                <span>{role === "landlord" ? "\u{1F3E0}" : "\u{1F511}"}</span>
                {role === "landlord" ? "Landlord Dashboard" : "Tenant Dashboard"}
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.7, ease }}>
            <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-btn bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-[0_4px_14px_rgba(79,124,232,0.30)] transition-transform hover:scale-[1.03] active:scale-[0.97]">
              Get started free
            </Link>
          </motion.div>
        )}

        {/* Integration logo strip */}
        <IntegrationStrip />
      </div>

      {/* Product mockup */}
      <motion.div className="relative z-10 mx-auto -mb-32 w-full max-w-4xl px-6" initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.9, ease }}>
        <div className="overflow-hidden rounded-xl border border-white/20 bg-gray-900 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
            <span className="ml-4 text-xs text-white/40">AutoTennant Dashboard</span>
          </div>
          <div className="grid grid-cols-3 gap-3 p-5">
            <div className="rounded-lg bg-white/10 p-4"><p className="text-xs text-white/50">Total Properties</p><p className="mt-1 text-2xl font-bold text-white">12</p></div>
            <div className="rounded-lg bg-white/10 p-4"><p className="text-xs text-white/50">Active Listings</p><p className="mt-1 text-2xl font-bold text-white">8</p></div>
            <div className="rounded-lg bg-white/10 p-4"><p className="text-xs text-white/50">Applications</p><p className="mt-1 text-2xl font-bold text-white">34</p></div>
            <div className="col-span-3 rounded-lg bg-white/5 p-4">
              <div className="flex items-center justify-between text-xs text-white/40"><span>123 Main St</span><span className="rounded-full bg-green-500/20 px-2 py-0.5 text-green-400">LISTED</span></div>
              <div className="mt-2 flex items-center justify-between text-xs text-white/40"><span>456 Oak Ave</span><span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-blue-400">OCCUPIED</span></div>
              <div className="mt-2 flex items-center justify-between text-xs text-white/40"><span>789 Pine Rd</span><span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-yellow-400">VACANT</span></div>
            </div>
          </div>
        </div>
        <div className="absolute -right-4 bottom-8 w-64 rounded-2xl p-4 text-white sm:right-4" style={{ background: "rgba(30, 30, 40, 0.72)", backdropFilter: "blur(24px) saturate(160%)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <p className="text-xs font-medium text-white/60">AI Assistant</p>
          <p className="mt-2 text-sm text-white/90">&ldquo;Best applicant for 123 Main St?&rdquo;</p>
          <div className="mt-3 rounded-xl bg-white/10 p-3">
            <p className="text-xs leading-relaxed text-white/80"><span className="font-semibold text-white">Sarah Chen</span> — Score 94. Verified income $85k, clean credit, 3yr rental history. Recommended.</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Features Bento Grid ─── */

const bentoContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const bentoItem = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };

function FeaturesSection() {
  return (
    <section id="features" className="bg-white px-6 py-[100px] sm:px-10">
      <motion.div className="mx-auto max-w-5xl" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease }}>
        <h2 className="text-center font-sans font-extrabold leading-[1.1] tracking-[-0.03em] text-text-primary" style={{ fontSize: "clamp(36px, 5vw, 60px)" }}>Everything you need to manage tenants</h2>
        <p className="mx-auto mt-4 max-w-[560px] text-center text-base leading-relaxed text-text-secondary">From screening applicants to signing leases, AutoTennant handles the entire rental workflow with AI.</p>
      </motion.div>
      <motion.div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2" variants={bentoContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        {/* Blue card */}
        <motion.div className="flex flex-col justify-between rounded-card bg-primary p-8 md:row-span-2" variants={bentoItem} whileHover={{ y: -3 }} style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }}>
          <div className="rounded-card-inner bg-white/10 p-5">
            <div className="rounded-xl p-4" style={{ background: "rgba(30, 30, 40, 0.72)", backdropFilter: "blur(24px) saturate(160%)", border: "1px solid rgba(255,255,255,0.15)" }}>
              {[{ score: 94, name: "Sarah Chen", detail: "Income verified, clean credit", bg: "bg-green-500/20", text: "text-green-400" },
                { score: 67, name: "Mike Ross", detail: "Pending employment check", bg: "bg-yellow-500/20", text: "text-yellow-400" },
                { score: 38, name: "Jay Park", detail: "Credit issues flagged", bg: "bg-red-500/20", text: "text-red-400" }].map((a, idx) => (
                <div key={a.name} className={`flex items-center gap-3 ${idx > 0 ? "mt-3" : ""}`}>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${a.bg} text-sm font-bold ${a.text}`}>{a.score}</div>
                  <div><p className="text-sm font-semibold text-white">{a.name}</p><p className="text-xs text-white/60">{a.detail}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6"><h3 className="text-[24px] font-bold leading-tight text-white">AI screens every applicant instantly</h3><p className="mt-2 text-sm leading-relaxed text-white/70">Background checks, credit scores, and income verification — processed and scored in seconds, not days.</p></div>
        </motion.div>
        {/* Ranked applicants */}
        <motion.div className="flex flex-col justify-between rounded-card bg-card-light p-8" variants={bentoItem} whileHover={{ y: -3 }}>
          <div className="rounded-card-inner bg-white p-4" style={{ border: "1px solid #E5E7EB" }}>
            {[{ rank: 1, name: "Sarah Chen", score: 94 }, { rank: 2, name: "Alex Rivera", score: 88 }, { rank: 3, name: "Jordan Lee", score: 82 }].map((a, i) => (
              <div key={a.name} className={`flex items-center justify-between ${i < 2 ? "border-b border-border-light pb-3" : ""} ${i > 0 ? "pt-3" : ""}`}>
                <div className="flex items-center gap-2"><span className="text-sm font-semibold text-text-primary">#{a.rank}</span><span className="text-sm text-text-primary">{a.name}</span></div>
                <span className="rounded-chip bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">Score {a.score}</span>
              </div>
            ))}
          </div>
          <div className="mt-6"><h3 className="text-[24px] font-bold leading-tight text-text-primary">Qualified applicants ranked automatically</h3><p className="mt-2 text-sm leading-relaxed text-text-secondary">See your best candidates at a glance, ranked by AI confidence score.</p></div>
        </motion.div>
        {/* Lease signing */}
        <motion.div className="flex flex-col justify-between rounded-card bg-card-light p-8" variants={bentoItem} whileHover={{ y: -3 }}>
          <div className="rounded-card-inner bg-white p-4" style={{ border: "1px solid #E5E7EB" }}>
            <div className="flex items-center gap-3 border-b border-border-light pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-icon bg-green-50"><svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div><p className="text-sm font-semibold text-text-primary">Lease signed</p><p className="text-xs text-text-muted">123 Main St - Sarah Chen</p></div>
            </div>
            <div className="flex items-center gap-3 pt-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-icon bg-blue-50"><svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div><p className="text-sm font-semibold text-text-primary">Awaiting signature</p><p className="text-xs text-text-muted">456 Oak Ave - Alex Rivera</p></div>
            </div>
          </div>
          <div className="mt-6"><h3 className="text-[24px] font-bold leading-tight text-text-primary">Lease signed in minutes</h3><p className="mt-2 text-sm leading-relaxed text-text-secondary">Digital lease generation and e-signatures powered by DocuSign.</p></div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Floating Feature Tags ─── */

const featurePills = [
  { label: "AI applicant screening", x: "4%", y: "8%", rotate: -2 },
  { label: "Automated lease signing", x: "58%", y: "4%", rotate: 1.5 },
  { label: "Background + credit checks", x: "1%", y: "32%", rotate: 1 },
  { label: "Viewing self-scheduling", x: "62%", y: "28%", rotate: -1.5 },
  { label: "Qualification scoring", x: "8%", y: "56%", rotate: -1 },
  { label: "Vacancy listing distribution", x: "54%", y: "52%", rotate: 2 },
  { label: "Tenant communication", x: "2%", y: "78%", rotate: 1.5 },
  { label: "Rent collection tracking", x: "60%", y: "76%", rotate: -2.5 },
  { label: "Document verification", x: "28%", y: "18%", rotate: 3 },
  { label: "Fair housing compliance", x: "30%", y: "68%", rotate: -1 },
  { label: "Real-time notifications", x: "78%", y: "56%", rotate: 1 },
  { label: "Portfolio analytics", x: "76%", y: "12%", rotate: -1.5 },
];

function FloatingTagsSection() {
  return (
    <section className="bg-white px-6 py-[100px] sm:px-10">
      <motion.div className="mx-auto max-w-5xl" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease }}>
        <h2 className="text-center font-sans font-extrabold leading-[1.1] tracking-[-0.03em] text-text-primary" style={{ fontSize: "clamp(36px, 5vw, 60px)" }}>
          Everything a landlord used to do manually.
        </h2>
      </motion.div>
      <div className="relative mx-auto mt-14 hidden h-[320px] max-w-5xl md:block">
        {featurePills.map((pill, i) => (
          <motion.span
            key={pill.label}
            className="absolute whitespace-nowrap rounded-full border border-border-light bg-card-light px-5 py-2.5 text-sm font-medium text-gray-700"
            style={{ left: pill.x, top: pill.y, rotate: `${pill.rotate}deg` }}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            {pill.label}
          </motion.span>
        ))}
        {/* Center stat */}
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <span className="text-5xl font-extrabold text-primary">12+</span>
          <span className="mt-1 text-sm font-medium text-text-secondary">tasks automated</span>
        </div>
      </div>
      {/* Mobile fallback: simple grid */}
      <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2 md:hidden">
        {featurePills.map((pill) => (
          <span key={pill.label} className="rounded-full border border-border-light bg-card-light px-4 py-2 text-sm font-medium text-gray-700">
            {pill.label}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ─── Dashboard Mockup Section ─── */

function DashboardMockupSection() {
  return (
    <section className="px-6 py-[100px] sm:px-10" style={{ background: "#F0F2F8" }}>
      <motion.div className="mx-auto max-w-5xl text-center" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease }}>
        <h2 className="font-sans text-[48px] font-extrabold leading-[1.1] tracking-[-0.03em] text-text-primary">Your properties, fully automated.</h2>
        <p className="mx-auto mt-4 mb-12 max-w-[480px] text-lg leading-relaxed text-text-secondary">The only platform that takes you from vacant to signed lease without lifting a finger.</p>
      </motion.div>

      <motion.div
        className="mx-auto max-w-[1000px] overflow-hidden rounded-2xl"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10)", border: "1px solid rgba(0,0,0,0.08)" }}
        initial={{ opacity: 0, y: 48, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease }}
      >
        {/* Title bar */}
        <div className="flex h-11 items-center gap-2 bg-[#E8E8E8] px-4">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          <div className="mx-auto flex h-6 w-[40%] items-center justify-center rounded-md bg-[#D4D4D4] text-xs text-[#666]">app.autotennant.com</div>
        </div>
        {/* Dashboard content */}
        <div className="flex bg-white">
          {/* Mini sidebar */}
          <div className="hidden w-48 shrink-0 border-r border-nav-border bg-nav-bg p-4 sm:block">
            <p className="text-sm font-bold text-text-primary">AutoTennant</p>
            <nav className="mt-6 space-y-1">
              {["Dashboard", "Properties", "Applications", "Leases"].map((item, i) => (
                <div key={item} className={`rounded-[8px] px-3 py-2 text-xs font-medium ${i === 0 ? "bg-[#EFF6FF] text-primary" : "text-text-secondary"}`}>{item}</div>
              ))}
            </nav>
          </div>
          {/* Main area */}
          <div className="flex-1 p-6">
            {/* Stat row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-[16px] bg-primary p-4"><p className="text-[11px] text-white/70">Properties</p><p className="mt-0.5 text-xl font-bold text-white">12</p></div>
              <div className="rounded-[16px] border border-border-light p-4"><p className="text-[11px] text-text-secondary">Applications</p><p className="mt-0.5 text-xl font-bold text-text-primary">34</p></div>
              <div className="rounded-[16px] border border-border-light p-4"><p className="text-[11px] text-text-secondary">Avg Score</p><p className="mt-0.5 text-xl font-bold text-text-primary">78</p></div>
              <div className="rounded-[16px] border border-border-light p-4"><p className="text-[11px] text-text-secondary">Days Saved</p><p className="mt-0.5 text-xl font-bold text-text-primary">42</p></div>
            </div>
            {/* Property card */}
            <div className="mt-4 overflow-hidden rounded-[16px] bg-card-light">
              <div className="flex h-20 items-center justify-center bg-white/60 text-text-muted/30">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
              </div>
              <div className="p-3"><p className="text-xs font-semibold text-text-primary">123 Main St</p><div className="mt-1 flex items-center justify-between"><span className="text-xs text-text-muted">$2,400/mo</span><span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-primary">LISTED</span></div></div>
            </div>
            {/* Applicant row */}
            <div className="mt-3 flex items-center justify-between rounded-btn border border-nav-border bg-white p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-nav-bg text-xs font-bold text-primary">94</div>
                <div><p className="text-xs font-semibold text-text-primary">Sarah Chen</p><p className="text-[10px] text-text-muted">123 Main St</p></div>
              </div>
              <span className="rounded-chip bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-700">APPROVED</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Hub-and-Spoke Integration Diagram ─── */

const spokeNodes = [
  { angle: -90,  label: "TransUnion", action: "SCREENS",  bg: "#3B82F6", icon: (
    <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
  )},
  { angle: -30,  label: "DocuSign",   action: "SIGNS",     bg: "#1E3A5F", icon: (
    <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
  )},
  { angle: 30,   label: "Zillow",     action: "LISTS",     bg: "#2563EB", icon: (
    <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
  )},
  { angle: 90,   label: "Stripe",     action: "CHARGES",   bg: "#7C3AED", icon: (
    <span className="text-[28px] font-bold text-white italic">S</span>
  )},
  { angle: 150,  label: "Twilio",     action: "NOTIFIES",  bg: "#EF4444", icon: (
    <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
  )},
  { angle: 210,  label: "Google",     action: "SCHEDULES", bg: "#EAB308", icon: (
    <svg className="h-9 w-9 text-[#1A1A2E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
  )},
];

function HubSpokeDiagram() {
  const cx = 350, cy = 300, radius = 220;
  const nodeSize = 80;

  return (
    <section className="overflow-hidden bg-[#0B1628] px-6 py-[100px] sm:px-10">
      <motion.div
        className="mx-auto max-w-5xl text-center"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease }}
      >
        <h2
          className="font-sans font-extrabold leading-[1.1] tracking-[-0.03em] text-white"
          style={{ fontSize: "clamp(36px, 5vw, 60px)" }}
        >
          One platform. Zero subscriptions.
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-base leading-relaxed text-white/50">
          AutoTenant replaces the entire stack landlords currently juggle.
        </p>
      </motion.div>

      <div className="relative mx-auto mt-16 flex justify-center">
        <div className="relative" style={{ width: 700, height: 600 }}>
          {/* Decorative background dots */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/10"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
            />
          ))}

          {/* SVG lines — dashed spokes from each node to center */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 700 600"
            fill="none"
          >
            {/* Decorative rings around center */}
            <circle cx={cx} cy={cy} r={60} stroke="rgba(139,92,246,0.15)" strokeWidth={1} fill="none" />
            <circle cx={cx} cy={cy} r={100} stroke="rgba(139,92,246,0.08)" strokeWidth={1} fill="none" />

            {spokeNodes.map((node, i) => {
              const rad = (node.angle * Math.PI) / 180;
              const ex = cx + Math.cos(rad) * radius;
              const ey = cy + Math.sin(rad) * radius;

              return (
                <motion.line
                  key={node.label}
                  x1={cx}
                  y1={cy}
                  x2={ex}
                  y2={ey}
                  stroke="rgba(139,92,246,0.35)"
                  strokeWidth={2}
                  strokeDasharray="8 6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1.4,
                    ease: "easeInOut",
                    delay: i * 0.15,
                  }}
                />
              );
            })}
          </svg>

          {/* Center hub — AutoTenant logo */}
          <motion.div
            className="absolute flex flex-col items-center justify-center"
            style={{
              left: cx - 44,
              top: cy - 44,
              width: 88,
              height: 88,
            }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease }}
          >
            <div
              className="flex h-[88px] w-[88px] items-center justify-center rounded-full"
              style={{
                background: "radial-gradient(circle at 40% 40%, rgba(139,92,246,0.3), rgba(79,124,232,0.15))",
                border: "2px solid rgba(139,92,246,0.35)",
                boxShadow: "0 0 60px rgba(139,92,246,0.2)",
              }}
            >
              {/* Mini house icon */}
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
                <defs>
                  <linearGradient id="hubHouseGrad" x1="10" y1="56" x2="54" y2="8" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
                <rect x="14" y="30" width="36" height="28" rx="4" fill="url(#hubHouseGrad)" />
                <path d="M8 30 L32 8 L56 30" stroke="#8B5CF6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <rect x="26" y="44" width="12" height="14" rx="2" fill="rgba(255,255,255,0.35)" />
                <circle cx="32" cy="34" r="7" stroke="white" strokeWidth="2" fill="none" opacity="0.9" />
                <line x1="32" y1="34" x2="32" y2="29.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
                <line x1="32" y1="34" x2="35.5" y2="34" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
              </svg>
            </div>
          </motion.div>

          {/* Outer nodes — large rounded squares */}
          {spokeNodes.map((node, i) => {
            const rad = (node.angle * Math.PI) / 180;
            const ex = cx + Math.cos(rad) * radius;
            const ey = cy + Math.sin(rad) * radius;

            return (
              <motion.div
                key={node.label}
                className="absolute flex flex-col items-center"
                style={{
                  left: ex - nodeSize / 2,
                  top: ey - nodeSize / 2,
                  width: nodeSize,
                }}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.4 + i * 0.12,
                  duration: 0.5,
                  ease,
                }}
              >
                <div
                  className="flex items-center justify-center rounded-2xl shadow-lg"
                  style={{
                    width: nodeSize,
                    height: nodeSize,
                    background: node.bg,
                    boxShadow: `0 8px 32px ${node.bg}40`,
                  }}
                >
                  {node.icon}
                </div>
                <span className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">
                  {node.action}
                </span>
                <span className="text-xs font-medium text-white/70">
                  {node.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Social Proof / Testimonials ─── */

const testimonials = [
  {
    quote: "We went from juggling 5 different tools to just AutoTenant. Screening, leases, payments — all in one place.",
    name: "Marcus T.",
    role: "Property Manager",
    initials: "MT",
    color: "bg-primary",
  },
  {
    quote: "AutoTenant feels like hiring an operations team overnight. We scaled from 8 to 35 units without adding staff.",
    name: "Sofia R.",
    role: "Real Estate Investor",
    initials: "SR",
    color: "bg-violet-500",
  },
  {
    quote: "A tenant applied at 11pm — by 8am I had a full background check, credit report, and AI score. Game changer.",
    name: "David K.",
    role: "Independent Landlord",
    initials: "DK",
    color: "bg-emerald-500",
  },
];

function SocialProofSection() {
  return (
    <section id="testimonials" className="overflow-hidden bg-[#0B1628] px-6 py-[100px] sm:px-10">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease }}
      >
        {/* Heading */}
        <div className="text-center">
          <h2
            className="font-sans font-extrabold leading-[1.1] tracking-[-0.03em] text-white"
            style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
          >
            Trusted by landlords everywhere
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-base leading-relaxed text-white/50">
            Real results from real property managers using AutoTenant.
          </p>
        </div>

        {/* Stats row */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Rating card */}
          <motion.div
            className="rounded-[20px] border border-white/10 bg-white/[0.04] p-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
          >
            <div className="flex items-baseline gap-1">
              <span className="text-[48px] font-bold text-white">4.9</span>
              <span className="text-lg text-white/40">/5</span>
            </div>
            <div className="mt-2 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {/* Avatar stack */}
            <div className="mt-6 flex items-center">
              <div className="flex -space-x-2">
                {["bg-primary", "bg-violet-500", "bg-emerald-500", "bg-amber-500"].map((bg, i) => (
                  <div key={i} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0B1628] text-[10px] font-bold text-white ${bg}`}>
                    {["MT", "SR", "DK", "JL"][i]}
                  </div>
                ))}
              </div>
              <span className="ml-2 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-xs font-semibold text-white/60">
                +2,400
              </span>
            </div>
            <p className="mt-2 text-sm text-white/40">average rating across all users</p>
          </motion.div>

          {/* Testimonial card */}
          <motion.div
            className="rounded-[20px] border border-white/10 bg-white/[0.04] p-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5, ease }}
          >
            <p className="text-lg font-medium leading-relaxed text-white/80">
              &ldquo;{testimonials[0].quote}&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white ${testimonials[0].color}`}>
                {testimonials[0].initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{testimonials[0].name}</p>
                <p className="text-xs text-white/40">{testimonials[0].role}</p>
              </div>
            </div>
          </motion.div>

          {/* Stat card */}
          <motion.div
            className="rounded-[20px] border border-white/10 bg-white/[0.04] p-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5, ease }}
          >
            <div className="flex items-baseline gap-0.5">
              <span className="text-[48px] font-bold text-white">73</span>
              <span className="text-2xl font-bold text-primary">%</span>
            </div>
            <p className="mt-1 text-sm text-white/40">faster time-to-lease on average</p>
          </motion.div>
        </div>

        {/* Bottom row — more testimonials + stat */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Testimonial 2 */}
          <motion.div
            className="rounded-[20px] border border-white/10 bg-white/[0.04] p-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5, ease }}
          >
            <p className="text-lg font-medium leading-relaxed text-white/80">
              &ldquo;{testimonials[1].quote}&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white ${testimonials[1].color}`}>
                {testimonials[1].initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{testimonials[1].name}</p>
                <p className="text-xs text-white/40">{testimonials[1].role}</p>
              </div>
            </div>
          </motion.div>

          {/* Middle stat */}
          <motion.div
            className="flex flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.04] p-8 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5, ease }}
          >
            <div className="flex items-baseline gap-0.5">
              <span className="text-[48px] font-bold text-white">5</span>
              <span className="text-2xl font-bold text-primary">min</span>
            </div>
            <p className="mt-1 text-sm text-white/40">average response time to applicants</p>
          </motion.div>

          {/* Testimonial 3 */}
          <motion.div
            className="rounded-[20px] border border-white/10 bg-white/[0.04] p-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5, ease }}
          >
            <p className="text-lg font-medium leading-relaxed text-white/80">
              &ldquo;{testimonials[2].quote}&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white ${testimonials[2].color}`}>
                {testimonials[2].initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{testimonials[2].name}</p>
                <p className="text-xs text-white/40">{testimonials[2].role}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── How It Works ─── */

function HowItWorksSection() {
  const steps = [
    { num: "1", title: "List your property", desc: "Add details and let AI generate an optimized listing.", mockup: (<div className="space-y-2"><div className="h-3 w-3/4 rounded bg-white/60" /><div className="h-3 w-full rounded bg-white/40" /><div className="h-3 w-5/6 rounded bg-white/40" /><div className="mt-3 h-8 w-1/2 rounded-btn bg-primary/80" /></div>) },
    { num: "2", title: "Screen applicants", desc: "AI screens, scores, and ranks every applicant.", mockup: (<div className="space-y-2">{[94, 82, 67].map((s) => (<div key={s} className="flex items-center gap-2"><div className={`h-6 w-6 rounded-full text-center text-[10px] font-bold leading-6 ${s > 80 ? "bg-primary/20 text-primary" : "bg-yellow-100 text-yellow-700"}`}>{s}</div><div className="h-2.5 flex-1 rounded bg-white/50" /></div>))}</div>) },
    { num: "3", title: "Sign & manage", desc: "Generate leases, collect e-signatures, manage everything.", mockup: (<div className="space-y-2">{[true, true, false].map((done, i) => (<div key={i} className="flex items-center gap-2">{done ? <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <div className="h-4 w-4 rounded border-2 border-white/40" />}<div className={`h-2.5 rounded ${done ? "w-3/4 bg-white/50" : "w-1/2 bg-white/40"}`} /></div>))}</div>) },
  ];

  return (
    <section id="how-it-works" className="bg-white px-6 py-[100px] sm:px-10">
      <motion.div className="mx-auto max-w-5xl" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease }}>
        <h2 className="text-center font-sans font-extrabold leading-[1.1] tracking-[-0.03em] text-text-primary" style={{ fontSize: "clamp(36px, 5vw, 60px)" }}>How it works</h2>
        <p className="mx-auto mt-4 max-w-[560px] text-center text-base leading-relaxed text-text-secondary">Three simple steps from vacant property to signed lease.</p>
      </motion.div>
      <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div key={step.num} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: i * 0.12, duration: 0.6, ease }}>
            <div className="rounded-[20px] bg-card-light p-5"><div className="rounded-card-inner bg-white/60 p-5">{step.mockup}</div></div>
            <div className="mt-4 flex items-start gap-3 px-1"><span className="text-2xl font-bold text-text-primary">{step.num}.</span><div><h3 className="text-lg font-bold text-text-primary">{step.title}</h3><p className="mt-1 text-sm leading-relaxed text-text-secondary">{step.desc}</p></div></div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── FAQ ─── */

const faqs = [
  { q: "What is AutoTennant?", a: "AutoTennant is an AI-powered property management platform that automates the entire rental workflow \u2014 from listing your property and screening applicants to signing leases and managing tenants." },
  { q: "How does the AI screening work?", a: "When a tenant applies, our AI instantly runs background checks, verifies income and employment, and analyzes credit history. It generates a confidence score (0\u2013100) so you can compare applicants at a glance." },
  { q: "Is AutoTennant free to use?", a: "AutoTennant offers a free trial so you can explore the full platform. After the trial, affordable plans are available for landlords of all sizes." },
  { q: "How are leases handled?", a: "AutoTennant generates lease agreements based on your property details. Tenants sign digitally via DocuSign, and both parties receive a copy instantly." },
  { q: "Can tenants use AutoTennant too?", a: "Yes! Tenants can search listings, submit applications, track status, and sign leases \u2014 all from their own dashboard." },
  { q: "Is my data secure?", a: "All data is encrypted in transit and at rest. We use JWT authentication, secure credential storage, and SOC 2 compliant infrastructure." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border-light">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-5 text-left">
        <span className="text-base font-semibold text-text-primary">{q}</span>
        <motion.svg className="ml-4 h-5 w-5 flex-shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease }} className="overflow-hidden">
            <p className="pb-5 text-[15px] leading-relaxed text-text-secondary">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQSection() {
  return (
    <section className="bg-white px-6 py-[100px] sm:px-10">
      <motion.div className="mx-auto max-w-3xl" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease }}>
        <h2 className="text-center font-sans font-extrabold leading-[1.1] tracking-[-0.03em] text-text-primary" style={{ fontSize: "clamp(36px, 5vw, 60px)" }}>Frequently asked questions</h2>
        <p className="mx-auto mt-4 max-w-[560px] text-center text-base leading-relaxed text-text-secondary">Everything you need to know about AutoTennant.</p>
        <div className="mt-12 border-t border-border-light">{faqs.map((faq) => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}</div>
      </motion.div>
    </section>
  );
}

/* ─── CTA ─── */

function CTASection() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => { setLoggedIn(useAppStore.getState().isAuthenticated()); }, []);

  return (
    <section className="bg-white px-6 py-[100px] sm:px-10">
      <motion.div className="mx-auto max-w-3xl text-center" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease }}>
        <h2 className="font-sans font-extrabold leading-[1.1] tracking-[-0.03em] text-text-primary" style={{ fontSize: "clamp(36px, 5vw, 60px)" }}>Ready to automate your rentals?</h2>
        <p className="mx-auto mt-4 max-w-[560px] text-base leading-relaxed text-text-secondary">Join landlords who save hours every week with AI-powered tenant management.</p>
        {!loggedIn && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/register" className="inline-flex rounded-btn bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-[0_4px_14px_rgba(79,124,232,0.30)] transition-transform hover:scale-[1.03] active:scale-[0.97]">Get started free</Link>
            <Link href="/login" className="inline-flex rounded-btn border-[1.5px] border-gray-300 px-7 py-3.5 text-base font-semibold text-text-primary transition-transform hover:scale-[1.03] active:scale-[0.97]">Sign in</Link>
          </div>
        )}
      </motion.div>
    </section>
  );
}

/* ─── Pricing ─── */

const tiers = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    name: "Starter",
    slug: "starter",
    monthly: 99,
    annual: 59,
    unit: "property",
    range: "1–3 Properties",
    highlight: false,
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    name: "Growth",
    slug: "growth",
    monthly: 79,
    annual: 47,
    unit: "property",
    range: "4–20 Properties",
    highlight: true,
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
      </svg>
    ),
    name: "Portfolio",
    slug: "portfolio",
    monthly: 49,
    annual: 29,
    unit: "property",
    range: "21+ Properties",
    highlight: false,
  },
];

const pricingFeatures = [
  "AI-powered tenant screening & scoring",
  "Automated lease generation & e-signatures",
  "Smart listing optimization",
  "Maintenance request management",
  "Real-time applicant notifications",
  "Background & credit checks included",
  "Dedicated support & onboarding",
  "Revenue analytics dashboard",
];

function PricingSection() {
  const [annual, setAnnual] = useState(true);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleCheckout = async (slug: string) => {
    setLoadingTier(slug);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: slug, billing: annual ? "annual" : "monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Stripe not configured — fall back to registration
        window.location.href = `/register?plan=${slug}&billing=${annual ? "annual" : "monthly"}`;
      }
    } catch {
      window.location.href = `/register?plan=${slug}&billing=${annual ? "annual" : "monthly"}`;
    }
  };

  return (
    <section id="pricing" className="bg-[#0B1628] px-6 py-[100px] sm:px-10">
      <motion.div
        className="mx-auto max-w-6xl"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease }}
      >
        <h2
          className="font-sans font-extrabold leading-[1.1] tracking-[-0.03em] text-white"
          style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
        >
          Subscription Pricing Plans
        </h2>
        <p className="mt-3 max-w-[560px] text-base leading-relaxed text-white/50">
          AutoTenant replaces a stack of subscriptions with one unified platform.
        </p>

        {/* Toggle */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${!annual ? "text-white" : "text-white/40"}`}>
            Monthly
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className="relative h-8 w-14 rounded-full transition-colors duration-300"
            style={{ background: annual ? "#4F7CE8" : "rgba(255,255,255,0.2)" }}
          >
            <motion.div
              className="absolute top-1 h-6 w-6 rounded-full bg-white shadow"
              animate={{ left: annual ? 30 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm font-medium ${annual ? "text-white" : "text-white/40"}`}>
            Annually
          </span>
          {annual && (
            <motion.span
              className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              Save 40%
            </motion.span>
          )}
        </div>

        {/* Cards + Features */}
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
          {/* Tier cards */}
          <div className="space-y-4">
            {tiers.map((tier, i) => {
              const price = annual ? tier.annual : tier.monthly;
              return (
                <motion.div
                  key={tier.name}
                  className={`relative overflow-hidden rounded-[20px] p-6 transition-all ${
                    tier.highlight
                      ? "border-2 border-primary/60 bg-white/[0.08]"
                      : "border border-white/10 bg-white/[0.04]"
                  }`}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease }}
                  whileHover={{ scale: 1.02 }}
                >
                  {tier.highlight && (
                    <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white">
                      POPULAR
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white/70">
                      {tier.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{tier.name}</p>
                      <p className="text-xs text-white/40">{tier.range}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-[36px] font-bold text-white">${price}</span>
                    <span className="text-sm text-white/40">/{tier.unit}/mo</span>
                  </div>
                  {annual && (
                    <span className="mt-1 inline-block rounded-full bg-green-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-green-400">
                      -40%
                    </span>
                  )}
                  <button
                    onClick={() => handleCheckout(tier.slug)}
                    disabled={loadingTier === tier.slug}
                    className={`mt-4 w-full rounded-btn py-2.5 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${
                      tier.highlight
                        ? "bg-primary text-white shadow-[0_4px_14px_rgba(79,124,232,0.30)]"
                        : "border border-white/20 bg-white/10 text-white hover:bg-white/15"
                    }`}
                  >
                    {loadingTier === tier.slug ? "Redirecting..." : "Select Plan"}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Feature list */}
          <motion.div
            className="rounded-[20px] border border-white/10 bg-white/[0.04] p-8"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5, ease }}
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-white/40">
              All plans include
            </p>
            <div className="mt-6 space-y-5">
              {pricingFeatures.map((feature, i) => (
                <motion.div
                  key={feature}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.4, ease }}
                >
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[15px] leading-snug text-white/80">{feature}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-btn bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-[0_4px_14px_rgba(79,124,232,0.30)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
              >
                Get started free
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Sticky Navbar ─── */

function StickyNavbar() {
  const router = useRouter();
  const { activeRole, setActiveRole, isAuthenticated } = useAppStore();
  const [loggedIn, setLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setLoggedIn(isAuthenticated());
  }, [activeRole, isAuthenticated]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 sm:px-10"
      style={{
        background: scrolled
          ? "rgba(255, 255, 255, 0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
        boxShadow: scrolled ? "0 1px 8px rgba(0,0,0,0.04)" : "none",
      }}
    >
      <Logo variant={scrolled ? "light" : "dark"} />

      <div className="flex items-center gap-6">
        {loggedIn && (
          <div className="hidden items-center gap-1 sm:flex">
            {(["landlord", "tenant"] as const).map((role) => (
              <button
                key={role}
                onClick={() => { setActiveRole(role); router.push(`/${role}/dashboard`); }}
                className="rounded-btn px-4 py-2 text-sm font-medium capitalize transition-colors duration-200"
                style={{
                  color: activeRole === role
                    ? scrolled ? "#4F7CE8" : "#FFFFFF"
                    : scrolled ? "#6B7280" : "rgba(255,255,255,0.7)",
                  background: activeRole === role
                    ? scrolled ? "rgba(79,124,232,0.1)" : "rgba(255,255,255,0.18)"
                    : "transparent",
                }}
              >
                {role}
              </button>
            ))}
          </div>
        )}

        <div className="hidden items-center gap-6 sm:flex">
          <a
            href="#features"
            className="text-sm font-medium transition-colors duration-300"
            style={{ color: scrolled ? "#6B7280" : "rgba(255,255,255,0.8)" }}
          >
            Features
          </a>
          <a
            href="#testimonials"
            className="text-sm font-medium transition-colors duration-300"
            style={{ color: scrolled ? "#6B7280" : "rgba(255,255,255,0.8)" }}
          >
            Testimonials
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium transition-colors duration-300"
            style={{ color: scrolled ? "#6B7280" : "rgba(255,255,255,0.8)" }}
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium transition-colors duration-300"
            style={{ color: scrolled ? "#6B7280" : "rgba(255,255,255,0.8)" }}
          >
            Pricing
          </a>
          {loggedIn ? (
            <button
              onClick={() => useAppStore.getState().logout()}
              className="rounded-btn border px-5 py-2.5 text-sm font-semibold transition-all duration-300"
              style={{
                borderColor: scrolled ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.4)",
                color: scrolled ? "#0F0F0F" : "#FFFFFF",
              }}
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-btn px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300"
              style={{
                background: scrolled ? "#4F7CE8" : "rgba(79,124,232,0.9)",
                boxShadow: "0 4px 14px rgba(79,124,232,0.30)",
              }}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ─── Page ─── */

export default function HomePage() {
  return (
    <>
      <StickyNavbar />
      <HeroSection />
      <FeaturesSection />
      <FloatingTagsSection />
      <DashboardMockupSection />
      <HubSpokeDiagram />
      <SocialProofSection />
      <HowItWorksSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <footer className="border-t border-border-light bg-white px-6 py-8 text-center text-sm text-text-muted">
        &copy; {new Date().getFullYear()} AutoTennant. All rights reserved.
      </footer>
    </>
  );
}
