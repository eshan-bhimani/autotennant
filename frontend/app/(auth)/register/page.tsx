"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import type { TokenResponse } from "@/types/api";

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
    "mt-1.5 block w-full rounded-input border-[1.5px] border-border-light px-3.5 py-2.5 text-[15px] text-text-primary focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15";

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <motion.div
        className="w-full max-w-md space-y-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-text-primary">
            AutoTennant
          </Link>
          <p className="mt-2 text-text-secondary">Create your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary">I am a</label>
            <div className="mt-2 flex gap-3">
              {(["LANDLORD", "TENANT"] as const).map((role) => (
                <label
                  key={role}
                  className={`flex flex-1 cursor-pointer items-center justify-center rounded-btn border-[1.5px] px-4 py-3 text-sm font-semibold transition ${
                    selectedRole === role
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border-light text-text-secondary hover:bg-card-light"
                  }`}
                >
                  <input
                    {...register("role")}
                    type="radio"
                    value={role}
                    className="sr-only"
                  />
                  {role === "LANDLORD" ? "Landlord" : "Tenant"}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-text-primary">
              Full Name
            </label>
            <input {...register("full_name")} id="full_name" className={inputClass} />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary">
              Email
            </label>
            <input {...register("email")} type="email" id="email" className={inputClass} />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary">
              Password
            </label>
            <input {...register("password")} type="password" id="password" className={inputClass} />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-primary">
              Phone <span className="text-text-muted">(optional)</span>
            </label>
            <input
              {...register("phone")}
              type="tel"
              id="phone"
              placeholder="+15551234567"
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full rounded-btn bg-primary px-4 py-3 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(79,124,232,0.30)] disabled:opacity-50"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            {loading ? "Creating account..." : "Create account"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
