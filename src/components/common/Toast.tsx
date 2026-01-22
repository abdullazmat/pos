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
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-blue-600";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className={`${color} text-white px-4 py-2 rounded-lg shadow-lg`}>
        {message}
      </div>
    </div>
  );
}
