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
  // Require the runtime JS validator located in /lib/afip/validateAfip.js
  // Use absolute path to ensure it resolves correctly at runtime
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const validator = require(
    path.resolve(process.cwd(), "lib/afip/validateAfip.js"),
  );
  if (!validator || typeof validator.validateAfip !== "function") {
    return {
      ok: false,
      issues: [
        { code: "VALIDATOR_MISSING", message: "Validator module not found" },
      ],
    };
  }

  try {
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
