"use client";

import { useEffect, useState } from "react";
import { CAROUSEL_INTERVAL_MS, SHOWCASE_IMAGES } from "@/lib/showcase-images";

type ImageCarouselProps = {
  className?: string;
  showLabel?: boolean;
};

export function ImageCarousel({
  className = "",
  showLabel = true,
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % SHOWCASE_IMAGES.length);
    }, CAROUSEL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  const activeImage = SHOWCASE_IMAGES[activeIndex];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {SHOWCASE_IMAGES.map((image, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          loading={index === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {showLabel ? (
        <div className="absolute bottom-6 left-6 z-10 rounded-full bg-black/40 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
          {activeImage.label}
        </div>
      ) : null}

      <div className="absolute bottom-6 right-6 z-10 flex gap-1.5">
        {SHOWCASE_IMAGES.map((image, index) => (
          <span
            key={image.src}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
