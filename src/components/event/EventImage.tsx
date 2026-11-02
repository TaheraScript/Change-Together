"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { RefreshCw } from "lucide-react";

const DEFAULT_IMAGE = "/images/gallery/community-garden.jpg";

export default function EventImage({
  src,
  alt,
  fallback,
}: {
  src?: string;
  alt: string;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const resolvedSrc = src ?? DEFAULT_IMAGE;

  const handleRetry = () => {
    setFailed(false);
    setRetryCount((prev) => prev + 1);
  };

  if (!resolvedSrc || (failed && retryCount >= 3)) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-50 via-white to-amber-50 text-[#16A34A]">
        {fallback}
      </div>
    );
  }

  if (failed && retryCount < 3) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <button
          type="button"
          onClick={handleRetry}
          aria-label="Retry loading image"
          className="flex items-center justify-center"
        >
          <RefreshCw size={34} strokeWidth={1.6} />
        </button>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolvedSrc}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}
