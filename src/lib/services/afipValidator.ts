import path from "path";

type ValidateResult = {
  ok: boolean;
  issues: Array<{ code: string; message: string }>;
  details?: any;
};

export function validateAfipFiles(opts: {
  certPath: string;
  keyPath: string;
  cuit?: string;
}): ValidateResult {
  // Prevent execution in browser environment
  if (typeof window !== "undefined") {
    return { ok: false, issues: [{ code: "NODE_ONLY", message: "This validator only runs on the server" }] };
  }

  try {
    // Build absolute path at runtime so webpack doesn't try to bundle it.
    // Using path.join avoids the "critical dependency" warning.
    const modulePath = path.join(process.cwd(), "lib", "afip", "validateAfip.js");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const validator = require(modulePath);

    if (!validator || typeof validator.validateAfip !== "function") {
      return {
        ok: false,
        issues: [
          { code: "VALIDATOR_MISSING", message: "Validator module not found" },
        ],
      };
    }

    const result = validator.validateAfip({
      certPath: opts.certPath,
      keyPath: opts.keyPath,
      cuit: opts.cuit,
    });
    return result as ValidateResult;
  } catch (e: any) {
    return {
      ok: false,
      issues: [
        {
          code: "VALIDATOR_ERROR",
          message: e && e.message ? e.message : String(e),
        },
      ],
    };
  }
}
