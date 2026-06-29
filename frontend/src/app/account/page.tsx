"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { AccountPanel } from "@/components/account/AccountPanel";

export default function AccountPage() {
  return (
    <RequireAuth>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Account</h1>
          <p className="mt-2 text-slate-600">
            Manage your profile, credentials, and account settings.
          </p>
        </div>
        <AccountPanel />
      </main>
    </RequireAuth>
  );
}
