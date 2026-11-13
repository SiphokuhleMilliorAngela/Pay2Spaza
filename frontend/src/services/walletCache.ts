import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api';
import { WalletInfo } from '../api/types';

// The wallet as the phone last saw it while online. The offline allowance can never be more than this.
type Cached = { customerId: string; balance: number; allowance: number; at: string };
const KEY = 'p2s_wallet';

interface Store { get(): Promise<string | null>; set(v: string): Promise<void>; }
const store: Store = Platform.OS === 'web'
  ? { get: async () => (typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null), set: async v => { localStorage.setItem(KEY, v); } }
  : { get: () => SecureStore.getItemAsync(KEY), set: v => SecureStore.setItemAsync(KEY, v) };

export async function cachedWallet(customerId: string): Promise<Cached | null> {
  try {
    const raw = await store.get();
    const c = raw ? (JSON.parse(raw) as Cached) : null;
    return c && c.customerId === customerId ? c : null;
  } catch { return null; }
}

// Asks the server for the wallet and remembers it. Null means the server could not be reached.
export async function refreshWallet(customerId: string): Promise<WalletInfo | null> {
  const w = await api.getWallet(customerId);
  if (w) {
    await store.set(JSON.stringify({ customerId, balance: w.balance, allowance: w.offlineAllowance, at: new Date().toISOString() })).catch(() => {});
  }
  return w;
}
