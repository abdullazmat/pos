import { useLanguage } from "@/lib/context/LanguageContext";
import { useTranslatedToast } from "./useTranslatedToast";
import { useCallback } from "react";

export function useTranslatedError() {
  const { t } = useLanguage();
  const toast = useTranslatedToast();

  const getErrorMessage = useCallback(
    (errorKey: string, namespace: string = "errors"): string => {
      const message = t(errorKey, namespace);
      return String(message);
    },
    [t],
  );

  const handleError = useCallback(
    (
      error: unknown,
      defaultKey: string = "generic",
      showToast: boolean = true,
    ) => {
      let errorKey = defaultKey;

      if (typeof error === "string") {
        errorKey = error;
      } else if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes("not found")) {
          errorKey = "notFound";
        } else if (message.includes("unauthorized")) {
          errorKey = "unauthorized";
        } else if (message.includes("forbidden")) {
          errorKey = "forbidden";
        } else if (message.includes("validation")) {
          errorKey = "validationError";
        } else if (message.includes("network") || message.includes("fetch")) {
          errorKey = "networkError";
        } else if (message.includes("server")) {
          errorKey = "serverError";
        }
      }

      const message = getErrorMessage(errorKey);

      if (showToast) {
        toast.error(errorKey);
      }

      return message;
    },
    [t, toast, getErrorMessage],
  );

  return { getErrorMessage, handleError };
}
