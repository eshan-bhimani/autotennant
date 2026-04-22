"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import Logo from "@/components/shared/Logo";
import type { TokenResponse } from "@/types/api";

const testimonials = [
  { quote: "Set up took 5 minutes. By the end of the week I had 3 new applications screened and ranked automatically.", name: "James L.", role: "Landlord, 12 units" },
  { quote: "The AI screening alone saves me 10 hours a week. I can focus on growing my portfolio instead of paperwork.", name: "Priya M.", role: "Property Manager" },
  { quote: "Found my apartment, applied, and signed the lease \u2014 all through AutoTennant. Smooth from start to finish.", name: "Alex R.", role: "Tenant" },
];

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["LANDLORD", "TENANT"]),
  full_name: z.string().min(1, "Full name is required"),
  phone: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "LANDLORD" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<TokenResponse>("/auth/register", data);
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/";
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1.5 block w-full rounded-btn border border-white/10 bg-white/[0.06] px-4 py-3 text-[15px] text-white placeholder-white/30 focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/20";

  return (
    <div className="flex min-h-screen">
      {/* Left panel — gradient with branding */}
      <div
        className="hidden w-[45%] flex-col justify-between p-10 lg:flex"
        style={{
          background: "linear-gradient(135deg, #87CEEB 0%, #4F7CE8 50%, #7C3AED 100%)",
        }}
      >
        <Link href="/">
          <Logo variant="dark" />
        </Link>

        <div>
          <motion.h2
            className="max-w-[400px] text-[40px] font-bold leading-[1.1] text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
          >
            Start automating your rental workflow today.
          </motion.h2>

          {/* Stats */}
          <motion.div
            className="mt-6 flex items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {[
              { num: "10k+", label: "Properties managed" },
              { num: "98%", label: "Faster screening" },
              { num: "4.9", label: "User rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.num}</p>
                <p className="text-xs text-white/50">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Testimonial carousel */}
          <div className="relative mt-8 min-h-[140px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease }}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
              >
                <p className="text-[15px] leading-relaxed text-white/90">
                  &ldquo;{testimonials[testimonialIdx].quote}&rdquo;
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                    {testimonials[testimonialIdx].name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{testimonials[testimonialIdx].name}</p>
                    <p className="text-xs text-white/50">{testimonials[testimonialIdx].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="mt-4 flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === testimonialIdx ? "w-6 bg-white" : "w-1.5 bg-white/30"}`}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-white/40">
          &copy; {new Date().getFullYear()} AutoTenant
        </p>
      </div>

      {/* Right panel — form over a dark mesh with a frosted card */}
      <div className="bg-mesh-dark relative flex flex-1 items-center justify-center px-6 py-10">
        {/* Decorative accent blobs */}
        <div className="pointer-events-none absolute left-10 top-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
        <motion.div
          className="glass-dark relative w-full max-w-[460px] rounded-modal p-8 sm:p-10"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="lg:hidden mb-8">
            <Link href="/">
              <Logo variant="dark" />
            </Link>
          </div>

          <h1 className="text-[28px] font-bold text-white">Create your account</h1>
          <p className="mt-2 text-sm text-white/50">Get started in under a minute</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-white/70">I am a</label>
              <div className="mt-2 flex gap-3">
                {(["LANDLORD", "TENANT"] as const).map((role) => (
                  <label
                    key={role}
                    className={`flex flex-1 cursor-pointer items-center justify-center rounded-btn border px-4 py-3 text-sm font-semibold transition ${
                      selectedRole === role
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-white/10 bg-white/[0.04] text-white/50 hover:bg-white/[0.08]"
                    }`}
                  >
                    <input
                      {...register("role")}
                      type="radio"
                      value={role}
                      className="sr-only"
                    />
                    {role === "LANDLORD" ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        Landlord
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        Tenant
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-white/70">
                Full Name
              </label>
              <input
                {...register("full_name")}
                id="full_name"
                className={inputClass}
                placeholder="John Smith"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-400">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/70">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                id="email"
                className={inputClass}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/70">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`${inputClass} pr-11`}
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 mt-[3px] -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white/70">
                Phone <span className="text-white/30">(optional)</span>
              </label>
              <input
                {...register("phone")}
                type="tel"
                id="phone"
                placeholder="+1 (555) 123-4567"
                className={inputClass}
              />
            </div>

            {error && (
              <motion.p
                className="rounded-btn border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full rounded-btn bg-primary px-4 py-3 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(79,124,232,0.30)] disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              {loading ? "Creating account..." : "Create account"}
            </motion.button>

            <p className="text-center text-xs text-white/30">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
