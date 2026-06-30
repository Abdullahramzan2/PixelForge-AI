"use client";

import Link from "next/link";
import { ImageCarousel } from "@/components/auth/ImageCarousel";
import { useAuth } from "@/context/AuthProvider";

export default function HomePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2 md:h-screen md:overflow-hidden">
      {/* Left: rotating showcase images */}
      <div className="relative min-h-[45vh] md:min-h-0 md:h-full">
        <ImageCarousel className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
      </div>

      {/* Right: sign in / sign up */}
      <div className="flex flex-col justify-center bg-gradient-to-br from-brand-50 via-white to-slate-100 px-6 py-12 md:px-12 md:py-0 xl:px-20">
        <div className="mx-auto w-full max-w-md text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            PixelForge <span className="text-brand-600">AI</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Create realistic visuals and professional product images with AI.
          </p>

          {!isLoading && isAuthenticated && user ? (
            <p className="mt-4 text-sm text-slate-600">
              Signed in as{" "}
              <span className="font-semibold text-slate-900">{user.username}</span>
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            {!isLoading && isAuthenticated ? (
              <>
                <Link
                  href="/generate"
                  className="rounded-lg bg-brand-600 px-6 py-3 text-center text-sm font-semibold text-white shadow hover:bg-brand-700"
                >
                  Generate Image
                </Link>
                <Link
                  href="/products"
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Enhance Product
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg bg-brand-600 px-6 py-3 text-center text-sm font-semibold text-white shadow hover:bg-brand-700"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
