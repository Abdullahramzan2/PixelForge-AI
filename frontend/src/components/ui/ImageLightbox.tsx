"use client";

import { useEffect } from "react";
import { downloadBlob } from "@/hooks/useAuthenticatedImage";

type ImageLightboxProps = {
  isOpen: boolean;
  imageUrl: string | null;
  blob: Blob | null;
  alt: string;
  downloadFilename: string;
  onClose: () => void;
};

export function ImageLightbox({
  isOpen,
  imageUrl,
  blob,
  alt,
  downloadFilename,
  onClose,
}: ImageLightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <div
        className="relative max-h-[90vh] max-w-5xl"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
        />

        <div className="mt-4 flex justify-center gap-3">
          {blob ? (
            <button
              type="button"
              onClick={() => downloadBlob(blob, downloadFilename)}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Download
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            Close
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-800 shadow hover:bg-slate-100 sm:-right-4 sm:-top-4"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
