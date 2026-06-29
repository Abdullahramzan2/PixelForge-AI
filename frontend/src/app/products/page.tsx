"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { ProductsPanel } from "@/components/products/ProductsPanel";

export default function ProductsPage() {
  return (
    <RequireAuth>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Product Enhancement</h1>
          <p className="mt-2 text-slate-600">
            Upload a product photo and transform it into an ad-ready visual.
          </p>
        </div>
        <ProductsPanel />
      </main>
    </RequireAuth>
  );
}
