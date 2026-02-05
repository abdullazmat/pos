"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

export default function Toast({
  message,
  type = "info",
  open,
  onClose,
  duration = 3000,
}: {
  message: string;
  type?: ToastType;
  open: boolean;
  onClose: () => void;
  duration?: number;
}) {
  const [visible, setVisible] = useState(open);
  useEffect(() => {
    setVisible(open);
    if (open) {
      const t = setTimeout(() => {
        setVisible(false);
        onClose();
      }, duration);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open, duration, onClose]);

  if (!visible) return null;

  const color =
    type === "success"
      ? "bg-emerald-600"
      : type === "error"
        ? "bg-rose-600"
        : "bg-blue-600";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]">
      <div
        className={`${color} vp-toast text-white px-4 py-2 rounded-xl shadow-lg border border-white/10`}
      >
        {message}
      </div>
    </div>
  );
}
