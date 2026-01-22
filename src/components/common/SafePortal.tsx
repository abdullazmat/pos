"use client";

import { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";

interface SafePortalProps {
  children: ReactNode;
  containerId?: string;
}

export function SafePortal({
  children,
  containerId = "root-portal",
}: SafePortalProps) {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Wait for DOM to be fully ready
    queueMicrotask(() => {
      let el = document.getElementById(containerId);

      // Create container if it doesn't exist
      if (!el) {
        el = document.createElement("div");
        el.id = containerId;
        el.style.cssText = "display: contents;";

        // Ensure body exists
        if (document.body) {
          document.body.appendChild(el);
        }
      }

      setContainer(el);
      setMounted(true);
    });

    return () => {
      // Cleanup: remove empty container on unmount
      if (
        container &&
        container.id === containerId &&
        !container.hasChildNodes()
      ) {
        try {
          container.parentNode?.removeChild(container);
        } catch (e) {
          // Silently catch removeChild errors
          console.debug("SafePortal cleanup skipped", e);
        }
      }
    };
  }, [containerId, container]);

  if (!mounted || !container) return null;

  try {
    return createPortal(children, container);
  } catch (error) {
    console.error("SafePortal error:", error);
    return null;
  }
}
