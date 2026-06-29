"use client";

import { useEffect, useState } from "react";
import { fetchAuthenticatedBlob } from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";

export function useAuthenticatedImage(src: string) {
  const { token } = useAuth();
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let blobUrl: string | null = null;

    setObjectUrl(null);
    setBlob(null);
    setError(false);
    setIsLoading(true);

    fetchAuthenticatedBlob(src, token)
      .then((imageBlob) => {
        if (!active) return;
        blobUrl = URL.createObjectURL(imageBlob);
        setBlob(imageBlob);
        setObjectUrl(blobUrl);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [src, token]);

  return { objectUrl, blob, error, isLoading };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
