import { isTokenExpiredSoon, decodeJwt } from "./token";

interface FetchOptions extends RequestInit {
  skipRefresh?: boolean;
}

/**
 * Enhanced fetch wrapper that automatically refreshes access token when expired
 */
export async function apiFetch(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  const { skipRefresh = false, ...fetchOptions } = options;

  // Get current token
  let token = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  console.log(
    `[API FETCH] Starting request to: ${url}, skipRefresh: ${skipRefresh}, hasToken: ${!!token}`,
  );

  // Check if token is expired or will expire soon (within 30 seconds)
  if (token && !skipRefresh && isTokenExpiredSoon(token)) {
    console.log("[API FETCH] Token expiring soon, attempting refresh...");

    if (refreshToken) {
      try {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          // Update stored tokens
          if (data.data?.accessToken) {
            localStorage.setItem("accessToken", data.data.accessToken);
            token = data.data.accessToken;
            console.log("[API FETCH] Token refreshed successfully");
          }
          if (data.data?.refreshToken) {
            localStorage.setItem("refreshToken", data.data.refreshToken);
          }
        } else {
          console.warn(
            "[API FETCH] Token refresh failed, proceeding with current token",
          );
        }
      } catch (error) {
        console.error("[API FETCH] Token refresh error:", error);
        // Continue with current token anyway
      }
    }
  }

  // Set authorization header if token exists
  const headers = new Headers(fetchOptions.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
    console.log(
      `[API FETCH] Set Authorization header with token (length: ${token.length})`,
    );
  } else {
    console.warn("[API FETCH] No token available!");
  }

  // Make the actual request
  console.log(`[API FETCH] Making request to: ${url}`);
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  console.log(
    `[API FETCH] Response received - status: ${response.status}, ok: ${response.ok}`,
  );

  // If we get a 401 and haven't already tried refresh, try refreshing and retrying once
  if (response.status === 401 && !skipRefresh && refreshToken) {
    console.log("[API FETCH] Got 401, attempting token refresh...");

    try {
      const refreshResponse = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        if (data.data?.accessToken) {
          localStorage.setItem("accessToken", data.data.accessToken);
          token = data.data.accessToken;

          // Retry the original request with new token
          console.log("[API FETCH] Retrying request with refreshed token");
          return apiFetch(url, { ...options, skipRefresh: true });
        }
      }
    } catch (error) {
      console.error("[API FETCH] Refresh attempt failed:", error);
    }

    // If refresh failed, redirect to login
    console.log("[API FETCH] Refresh failed, redirecting to login");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  }

  return response;
}
