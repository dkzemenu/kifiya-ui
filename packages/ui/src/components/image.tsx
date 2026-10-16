"use client";

import { ImageOff } from "lucide-react";
import { useState, type ImgHTMLAttributes, type ReactNode } from "react";

import { cn } from "../lib/cn";
import { Skeleton } from "../primitives/skeleton";

export type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "alt"> & {
  src: string;
  /** Describes the image; pass `""` for a purely decorative one. */
  alt: string;
  /** Shown instead of a broken image when it fails to load. */
  fallback?: ReactNode;
  /** Width / height of the frame, e.g. `16 / 9` or `1`. Without it the image keeps its own size. */
  aspectRatio?: number;
  /** How the image fills a frame with `aspectRatio`. */
  fit?: "cover" | "contain";
  /** Classes for the frame around the image. */
  frameClassName?: string;
};

type Status = "loading" | "loaded" | "failed";

/**
 * An image with a loading skeleton and a fallback when it fails to load.
 * Apps on Next.js can keep using `next/image` where they need its optimisation.
 */
export function Image({
  src,
  alt,
  fallback,
  aspectRatio,
  fit = "cover",
  frameClassName,
  className,
  onLoad,
  onError,
  ...props
}: ImageProps) {
  // Keyed by `src`, so a new source starts loading again.
  const [state, setState] = useState<{ src: string; status: Status }>({
    src,
    status: "loading",
  });
  const status = state.src === src ? state.status : "loading";

  return (
    <span
      data-slot="image"
      data-status={status}
      className={cn(
        "relative inline-block overflow-hidden rounded-(--radius-box)",
        aspectRatio ? "w-full" : "",
        frameClassName,
      )}
      style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined}
    >
      {status === "failed" ? (
        <span
          role={alt ? "img" : undefined}
          aria-label={alt || undefined}
          className={cn(
            "flex size-full min-h-16 items-center justify-center gap-2 bg-(--surface-muted) text-xs text-(--text-muted)",
            className,
          )}
        >
          {fallback ?? <ImageOff className="size-5" aria-hidden />}
        </span>
      ) : (
        <>
          {status === "loading" ? (
            <Skeleton className="absolute inset-0 rounded-none" aria-hidden />
          ) : null}
          <img
            src={src}
            alt={alt}
            className={cn(
              aspectRatio ? "size-full" : "",
              aspectRatio && fit === "cover" ? "object-cover" : "",
              aspectRatio && fit === "contain" ? "object-contain" : "",
              status === "loading" ? "opacity-0" : "opacity-100",
              "transition-opacity",
              className,
            )}
            onLoad={(event) => {
              setState({ src, status: "loaded" });
              onLoad?.(event);
            }}
            onError={(event) => {
              setState({ src, status: "failed" });
              onError?.(event);
            }}
            {...props}
          />
        </>
      )}
    </span>
  );
}
