"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function TenantNav() {
  return (
    <nav className="flex h-16 items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/search" className="text-xl font-bold text-blue-600">
          AutoTennant
        </Link>
        <div className="flex gap-6">
          <Link href="/search" className="text-sm font-medium text-gray-700 hover:text-gray-900">
            Search
          </Link>
          <Link href="/applications" className="text-sm font-medium text-gray-700 hover:text-gray-900">
            My Applications
          </Link>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        Sign out
      </button>
    </nav>
  );
}
