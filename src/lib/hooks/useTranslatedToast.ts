import { useLanguage } from "@/lib/context/LanguageContext";
import { showToast } from "@/lib/utils/toastUtils";
import { useCallback } from "react";

export function useTranslatedToast() {
  const { t } = useLanguage();

  const success = useCallback(
    (key: string, namespace: string = "messages", duration?: number) => {
      const message = t(key, namespace);
      showToast(String(message), "success", duration);
    },
    [t],
  );

  const error = useCallback(
    (key: string, namespace: string = "errors", duration?: number) => {
      const message = t(key, namespace);
      showToast(String(message), "error", duration);
    },
    [t],
  );

  const warning = useCallback(
    (key: string, namespace: string = "messages", duration?: number) => {
      const message = t(key, namespace);
      showToast(String(message), "warning", duration);
    },
    [t],
  );

  const info = useCallback(
    (key: string, namespace: string = "messages", duration?: number) => {
      const message = t(key, namespace);
      showToast(String(message), "info", duration);
    },
    [t],
  );

  return { success, error, warning, info };
}
