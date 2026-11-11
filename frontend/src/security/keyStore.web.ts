// Web: expo-secure-store has no browser implementation, so fall back to localStorage.
export async function getItem(key: string): Promise<string | null> {
  try { return globalThis.localStorage?.getItem(key) ?? null; } catch { return null; }
}
export async function setItem(key: string, value: string) {
  try { globalThis.localStorage?.setItem(key, value); } catch { /* storage blocked */ }
}
