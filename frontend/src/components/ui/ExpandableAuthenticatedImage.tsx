"use client";

import { useState } from "react";
import { useAuthenticatedImage } from "@/hooks/useAuthenticatedImage";
import { ImageLightbox } from "@/components/ui/ImageLightbox";

type ExpandableAuthenticatedImageProps = {
  src: string;
  alt: string;
  className?: string;
  downloadFilename?: string;
  expandHint?: string;
};

export function ExpandableAuthenticatedImage({
  src,
  alt,
  className = "",
  downloadFilename = "pixelforge-image.png",
  expandHint = "Click to expand",
}: ExpandableAuthenticatedImageProps) {
  const { objectUrl, blob, error, isLoading } = useAuthenticatedImage(src);
  const [isOpen, setIsOpen] = useState(false);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-sm text-slate-500 ${className}`}
      >
        Failed to load image
      </div>
    );
  }

  if (isLoading || !objectUrl) {
    return (
      <div
        className={`animate-pulse bg-slate-200 ${className}`}
        aria-label="Loading image"
      />
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`group relative block cursor-zoom-in overflow-hidden ${className}`}
        title={expandHint}
      >
        <img src={objectUrl} alt={alt} className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex items-end justify-center bg-black/0 pb-2 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
          <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
            {expandHint}
          </span>
        </span>
      </button>

      <ImageLightbox
        isOpen={isOpen}
        imageUrl={objectUrl}
        blob={blob}
        alt={alt}
        downloadFilename={downloadFilename}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
