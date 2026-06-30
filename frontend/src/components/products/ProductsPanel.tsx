"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ApiError,
  deleteProduct,
  enhanceProduct,
  fetchProductHistory,
  fetchStyles,
  uploadProduct,
} from "@/lib/api";
import { ExpandableAuthenticatedImage } from "@/components/ui/ExpandableAuthenticatedImage";
import { Button } from "@/components/ui/Button";
import type { StyleId, StylePreset } from "@/types/generation";
import type { ProductImage } from "@/types/product";

const PROVIDERS = [
  { id: "", label: "Default provider" },
  { id: "huggingface", label: "Hugging Face" },
  { id: "stability", label: "Stability AI" },
] as const;

export function ProductsPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [styles, setStyles] = useState<StylePreset[]>([]);
  const [history, setHistory] = useState<ProductImage[]>([]);
  const [selected, setSelected] = useState<ProductImage | null>(null);
  const [style, setStyle] = useState<StyleId>("luxury");
  const [scenePrompt, setScenePrompt] = useState("");
  const [provider, setProvider] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([fetchStyles(), fetchProductHistory()])
      .then(([stylePresets, historyResponse]) => {
        setStyles(stylePresets);
        setHistory(historyResponse.items);
        if (historyResponse.items.length > 0) {
          setSelected(historyResponse.items[0]);
        }
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load data.");
      })
      .finally(() => setIsLoadingHistory(false));
  }, []);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setIsUploading(true);

    try {
      const product = await uploadProduct(file);
      setSelected(product);
      setHistory((current) => [product, ...current]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleEnhance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    setError("");
    setIsEnhancing(true);

    try {
      const product = await enhanceProduct({
        product_id: selected.id,
        style,
        scene_prompt: scenePrompt.trim() || null,
        provider: provider ? (provider as "huggingface" | "stability") : null,
      });
      setSelected(product);
      setHistory((current) =>
        current.map((item) => (item.id === product.id ? product : item)),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Enhancement failed.");
    } finally {
      setIsEnhancing(false);
    }
  }

  async function handleDelete(productId: number) {
    const confirmed = window.confirm("Delete this product from your history?");
    if (!confirmed) return;

    setError("");
    setDeletingId(productId);

    try {
      await deleteProduct(productId);
      const remaining = history.filter((item) => item.id !== productId);
      setHistory(remaining);
      if (selected?.id === productId) {
        setSelected(remaining[0] ?? null);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Upload product</h2>
          <p className="mt-1 text-sm text-slate-600">
            JPEG, PNG, or WebP up to 10 MB.
          </p>

          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
            />
            {isUploading ? (
              <p className="mt-2 text-sm text-slate-500">Uploading...</p>
            ) : null}
          </div>
        </div>

        <form
          onSubmit={handleEnhance}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-slate-900">Enhance options</h2>
          <p className="mt-1 text-sm text-slate-600">
            Remove the background and place your product in a styled scene.
          </p>

          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="product" className="block text-sm font-medium text-slate-700">
                Product
              </label>
              <select
                id="product"
                value={selected?.id ?? ""}
                onChange={(event) => {
                  const product = history.find(
                    (item) => item.id === Number(event.target.value),
                  );
                  setSelected(product ?? null);
                }}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="" disabled>
                  Select a product
                </option>
                {history.map((item) => (
                  <option key={item.id} value={item.id}>
                    #{item.id} — {item.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="enhance-style" className="block text-sm font-medium text-slate-700">
                Style preset
              </label>
              <select
                id="enhance-style"
                value={style}
                onChange={(event) => setStyle(event.target.value as StyleId)}
                required
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                {styles.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} — {preset.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="scene" className="block text-sm font-medium text-slate-700">
                Scene prompt (optional)
              </label>
              <textarea
                id="scene"
                rows={3}
                maxLength={500}
                placeholder="Marble countertop with soft morning light..."
                value={scenePrompt}
                onChange={(event) => setScenePrompt(event.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="enhance-provider" className="block text-sm font-medium text-slate-700">
                Provider
              </label>
              <select
                id="enhance-provider"
                value={provider}
                onChange={(event) => setProvider(event.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                {PROVIDERS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" isLoading={isEnhancing} disabled={!selected}>
              Enhance product
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Preview</h2>
          {!selected ? (
            <p className="mt-4 text-sm text-slate-500">
              Upload a product to get started.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Original
                </p>
                <ExpandableAuthenticatedImage
                  src={selected.original_url}
                  alt="Original product"
                  className="aspect-square w-full rounded-xl"
                  downloadFilename={`product-${selected.id}-original.png`}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Enhanced
                </p>
                {selected.enhanced_url ? (
                  <ExpandableAuthenticatedImage
                    src={selected.enhanced_url}
                    alt="Enhanced product"
                    className="aspect-square w-full rounded-xl"
                    downloadFilename={`product-${selected.id}-enhanced.png`}
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
                    {selected.status === "processing"
                      ? "Processing..."
                      : selected.status === "failed"
                        ? selected.error_message ?? "Enhancement failed"
                        : "Not enhanced yet"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">History</h2>
          {isLoadingHistory ? (
            <p className="mt-4 text-sm text-slate-500">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No uploads yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {history.map((item) => (
                <li
                  key={item.id}
                  className={`rounded-xl border p-3 transition ${
                    selected?.id === item.id
                      ? "border-brand-300 bg-brand-50"
                      : "border-slate-100"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex shrink-0 gap-2">
                      <ExpandableAuthenticatedImage
                        src={item.original_url}
                        alt={`Product ${item.id} original`}
                        className="h-20 w-20 rounded-lg"
                        downloadFilename={`product-${item.id}-original.png`}
                        expandHint="Original"
                      />
                      {item.enhanced_url ? (
                        <ExpandableAuthenticatedImage
                          src={item.enhanced_url}
                          alt={`Product ${item.id} enhanced`}
                          className="h-20 w-20 rounded-lg"
                          downloadFilename={`product-${item.id}-enhanced.png`}
                          expandHint="Enhanced"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-100 px-1 text-center text-[10px] leading-tight text-slate-500">
                          {item.status === "processing"
                            ? "Processing..."
                            : item.status === "failed"
                              ? "Failed"
                              : "Not enhanced"}
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="text-left"
                      >
                        <p className="text-sm font-medium text-slate-900">
                          Product #{item.id}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.status}
                          {item.style ? ` · ${item.style}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-brand-600">
                          View in preview
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="mt-2 self-start text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-60"
                      >
                        {deletingId === item.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
