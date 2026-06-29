"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";

const NAV_LINKS = [
  { href: "/generate", label: "Generate" },
  { href: "/products", label: "Products" },
  { href: "/account", label: "Account" },
];

export function AppHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold text-slate-900">
          PixelForge <span className="text-brand-600">AI</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4">
          {isAuthenticated ? (
            <>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    pathname === link.href
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <span className="hidden text-sm text-slate-500 sm:inline">
                {user?.username}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                Sign out
              </button>
            </>
          ) : !isLoading ? (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Sign up
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
