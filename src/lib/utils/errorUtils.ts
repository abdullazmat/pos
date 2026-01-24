export interface TranslatedError {
  key: string;
  namespace: string;
  statusCode?: number;
}

export function getErrorKey(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Map common error messages to translation keys
    if (message.includes("not found") || message.includes("404")) {
      return "notFound";
    }
    if (message.includes("unauthorized") || message.includes("401")) {
      return "unauthorized";
    }
    if (message.includes("forbidden") || message.includes("403")) {
      return "forbidden";
    }
    if (message.includes("validation")) {
      return "validationError";
    }
    if (message.includes("network") || message.includes("fetch")) {
      return "networkError";
    }
    if (message.includes("server") || message.includes("500")) {
      return "serverError";
    }
  }

  return "generic";
}

export function createTranslatedError(
  error: unknown,
  namespace: string = "errors",
): TranslatedError {
  return {
    key: getErrorKey(error),
    namespace,
  };
}
