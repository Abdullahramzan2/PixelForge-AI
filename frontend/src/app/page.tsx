"use client";

import Link from "next/link";
import { ShowcasePanel } from "@/components/auth/ShowcasePanel";
import { useAuth } from "@/context/AuthProvider";

export default function HomePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      <ShowcasePanel />

      <div className="flex w-full flex-col justify-center bg-gradient-to-br from-brand-50 via-white to-slate-100 px-6 py-12 lg:w-1/2 lg:px-12 xl:px-20">
        <div className="mx-auto w-full max-w-md text-center lg:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            PixelForge <span className="text-brand-600">AI</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Create realistic visuals and professional product images with AI.
            Describe what you want or upload a product photo to get started.
          </p>

          {!isLoading && isAuthenticated && user ? (
            <p className="mt-4 text-sm text-slate-600">
              Signed in as{" "}
              <span className="font-semibold text-slate-900">{user.username}</span>
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
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
