"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthProvider";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-600">Loading...</p>
      </main>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ identifier: identifier.trim(), password });
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout
      title="Welcome back"
      subtitle="Sign in with your email or username"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref="/signup"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <Input
          label="Email or username"
          name="identifier"
          type="text"
          autoComplete="username"
          placeholder="john@example.com or johndoe"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <Button type="submit" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link href="/" className="text-slate-500 hover:text-slate-700">
          Back to home
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
