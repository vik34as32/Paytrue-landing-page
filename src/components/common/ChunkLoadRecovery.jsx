"use client";

import { useEffect } from "react";

const RELOAD_KEY = "paytrue_chunk_reload";

function isChunkLoadError(reason) {
  if (!reason) return false;
  const name = reason.name || "";
  const message = String(reason.message || reason);
  return (
    name === "ChunkLoadError" ||
    message.includes("Failed to load chunk") ||
    message.includes("Loading chunk") ||
    message.includes("ChunkLoadError")
  );
}

/**
 * Recovers from stale Turbopack/Webpack chunks after hot reload or cache mismatch.
 * Reloads once per session to fetch fresh chunk manifests.
 */
export default function ChunkLoadRecovery() {
  useEffect(() => {
    const handleRejection = (event) => {
      if (!isChunkLoadError(event.reason)) return;

      const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY);
      if (alreadyReloaded) return;

      sessionStorage.setItem(RELOAD_KEY, "1");
      event.preventDefault?.();
      window.location.reload();
    };

    const handleError = (event) => {
      if (!isChunkLoadError(event.error)) return;

      const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY);
      if (alreadyReloaded) return;

      sessionStorage.setItem(RELOAD_KEY, "1");
      window.location.reload();
    };

    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null;
}
