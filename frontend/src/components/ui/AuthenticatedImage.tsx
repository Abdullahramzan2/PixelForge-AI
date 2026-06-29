"use client";

import { useAuthenticatedImage } from "@/hooks/useAuthenticatedImage";

type AuthenticatedImageProps = {
  src: string;
  alt: string;
  className?: string;
};

export function AuthenticatedImage({ src, alt, className = "" }: AuthenticatedImageProps) {
  const { objectUrl, error, isLoading } = useAuthenticatedImage(src);

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

  return <img src={objectUrl} alt={alt} className={className} />;
}
