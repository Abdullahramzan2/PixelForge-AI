"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ApiError,
  createTextToImage,
  deleteGeneration,
  fetchGenerationHistory,
  fetchStyles,
} from "@/lib/api";
import { ExpandableAuthenticatedImage } from "@/components/ui/ExpandableAuthenticatedImage";
import { Button } from "@/components/ui/Button";
import type { Generation, StyleId, StylePreset } from "@/types/generation";

const PROVIDERS = [
  { id: "", label: "Default provider" },
  { id: "huggingface", label: "Hugging Face" },
  { id: "stability", label: "Stability AI" },
] as const;

export function GeneratePanel() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<StyleId | "">("");
  const [provider, setProvider] = useState("");
  const [styles, setStyles] = useState<StylePreset[]>([]);
  const [history, setHistory] = useState<Generation[]>([]);
  const [latest, setLatest] = useState<Generation | null>(null);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([fetchStyles(), fetchGenerationHistory()])
      .then(([stylePresets, historyResponse]) => {
        setStyles(stylePresets);
        setHistory(historyResponse.items);
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "Failed to load data.");
      })
      .finally(() => setIsLoadingHistory(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsGenerating(true);

    try {
      const result = await createTextToImage({
        prompt: prompt.trim(),
        style: style || null,
        provider: provider ? (provider as "huggingface" | "stability") : null,
      });
      setLatest(result);
      setHistory((current) => [result, ...current]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDelete(generationId: number) {
    const confirmed = window.confirm("Delete this image from your history?");
    if (!confirmed) return;

    setError("");
    setDeletingId(generationId);

    try {
      await deleteGeneration(generationId);
      setHistory((current) => current.filter((item) => item.id !== generationId));
      if (latest?.id === generationId) {
        setLatest(null);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete image.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Create an image</h2>
        <p className="mt-1 text-sm text-slate-600">
          Describe what you want and optionally pick a style preset.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-700">
              Prompt
            </label>
            <textarea
              id="prompt"
              name="prompt"
              rows={4}
              required
              minLength={3}
              maxLength={2000}
              placeholder="A luxury watch on a marble surface with soft studio lighting..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="style" className="block text-sm font-medium text-slate-700">
              Style preset
            </label>
            <select
              id="style"
              value={style}
              onChange={(event) => setStyle(event.target.value as StyleId | "")}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">No preset</option>
              {styles.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} — {preset.description}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="provider" className="block text-sm font-medium text-slate-700">
              Provider
            </label>
            <select
              id="provider"
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

          <Button type="submit" isLoading={isGenerating}>
            Generate image
          </Button>
        </form>
      </section>

      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Preview</h2>
          {latest ? (
            <div className="mt-4 space-y-3">
              <ExpandableAuthenticatedImage
                src={latest.image_url}
                alt={latest.prompt}
                className="aspect-square w-full rounded-xl"
                downloadFilename={`generation-${latest.id}.png`}
              />
              <p className="text-sm text-slate-600">{latest.prompt}</p>
              <p className="text-xs text-slate-500">
                {latest.provider}
                {latest.style ? ` · ${latest.style}` : ""}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Your generated image will appear here.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">History</h2>
          {isLoadingHistory ? (
            <p className="mt-4 text-sm text-slate-500">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No generations yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 rounded-xl border border-slate-100 p-3"
                >
                  <ExpandableAuthenticatedImage
                    src={item.image_url}
                    alt={item.prompt}
                    className="h-20 w-20 shrink-0 rounded-lg"
                    downloadFilename={`generation-${item.id}.png`}
                    expandHint="Expand"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <p className="truncate text-sm font-medium text-slate-900">
                        {item.prompt}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(item.created_at).toLocaleString()}
                        {item.style ? ` · ${item.style}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="mt-2 self-start text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-60"
                    >
                      {deletingId === item.id ? "Deleting..." : "Delete"}
                    </button>
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
