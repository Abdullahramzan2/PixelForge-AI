"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthProvider";
import { ApiError } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    confirm_password: "",
  });
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

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Password and confirm password do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
        confirm_password: form.confirm_password,
      });
      router.push("/");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Signup failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout
      title="Create your account"
      subtitle="Start generating professional images with PixelForge AI"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            name="first_name"
            autoComplete="given-name"
            placeholder="John"
            value={form.first_name}
            onChange={(event) => updateField("first_name", event.target.value)}
            required
          />
          <Input
            label="Last name"
            name="last_name"
            autoComplete="family-name"
            placeholder="Doe"
            value={form.last_name}
            onChange={(event) => updateField("last_name", event.target.value)}
            required
          />
        </div>

        <Input
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="john@example.com"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          required
        />

        <Input
          label="Username"
          name="username"
          autoComplete="username"
          placeholder="johndoe"
          value={form.username}
          onChange={(event) => updateField("username", event.target.value)}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          minLength={8}
          required
        />

        <Input
          label="Confirm password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={form.confirm_password}
          onChange={(event) => updateField("confirm_password", event.target.value)}
          minLength={8}
          required
        />

        <Button type="submit" isLoading={isSubmitting}>
          Create account
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
