export const ADMIN_EMAIL = "valeskastw39@gmail.com";
export const ADMIN_PASSWORD = "lyricusabbayouth2026";
export const AUTH_STORAGE_KEY = "lyricus_admin_auth";

export function checkAuthCredentials(email?: string, password?: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export function isClientAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return false;
  try {
    const data = JSON.parse(stored);
    return data.email === ADMIN_EMAIL && data.password === ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

export function setClientAuth(email: string, pass: string): boolean {
  if (email === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ email, password: pass, timestamp: Date.now() })
    );
    return true;
  }
  return false;
}

export function removeClientAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return {};
  try {
    const data = JSON.parse(stored);
    return {
      "x-auth-email": data.email || "",
      "x-auth-password": data.password || "",
    };
  } catch {
    return {};
  }
}
