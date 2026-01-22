// Tiny client-side helpers for JWT handling in the browser
export function decodeJwt<T = any>(token: string | null): T | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload as T;
  } catch {
    return null;
  }
}

export function isTokenExpiredSoon(
  token: string | null,
  skewSeconds = 30
): boolean {
  const payload = decodeJwt<{ exp?: number }>(token);
  if (!payload?.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - now <= skewSeconds;
}
