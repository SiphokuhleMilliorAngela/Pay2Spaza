import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type Role = 'customer' | 'owner';
export type Session = { role: Role; phone: string; merchantId?: string; token?: string };

const KEY = 'p2s_session';

interface Store { get(): Promise<string | null>; set(v: string): Promise<void>; del(): Promise<void>; }

// SecureStore does not exist in the web build (Netlify), so the web build falls back to localStorage.
const store: Store = Platform.OS === 'web'
  ? {
      get: async () => (typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null),
      set: async v => { localStorage.setItem(KEY, v); },
      del: async () => { localStorage.removeItem(KEY); },
    }
  : {
      get: () => SecureStore.getItemAsync(KEY),
      set: v => SecureStore.setItemAsync(KEY, v),
      del: () => SecureStore.deleteItemAsync(KEY),
    };

export async function loadSession(): Promise<Session | null> {
  try {
    const raw = await store.get();
    const s = raw ? JSON.parse(raw) : null;
    return s && (s.role === 'customer' || s.role === 'owner') && typeof s.phone === 'string' ? (s as Session) : null;
  } catch { return null; }
}
export const saveSession = (s: Session) => store.set(JSON.stringify(s));
export const clearSession = () => store.del();
