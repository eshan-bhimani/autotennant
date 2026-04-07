"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import Logo from "@/components/shared/Logo";
import type { TokenResponse } from "@/types/api";

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
          <motion.p
            className="mt-4 max-w-[360px] text-base leading-relaxed text-white/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease }}
          >
            AI-powered screening, automated leases, and smart property management. Set up in under 5 minutes.
          </motion.p>

          <motion.div
            className="mt-8 flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
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
        </div>

        <p className="text-sm text-white/40">
          &copy; {new Date().getFullYear()} AutoTenant
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center bg-[#0B1628] px-6">
        <motion.div
          className="w-full max-w-[420px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
              <input
                {...register("password")}
                type="password"
                id="password"
                className={inputClass}
                placeholder="Min 8 characters"
              />
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
