// Web version of db.ts. expo-sqlite has no web support in this Expo SDK, so the
// browser keeps the same on-device queue and merchant cache in localStorage.
import type { Merchant } from '../api/types';
import type { Tx } from './types';
export type { Tx } from './types';

const TX_KEY = 'p2s_tx';
const MERCHANT_KEY = 'p2s_merchants';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function write(key: string, value: unknown) {
  try { globalThis.localStorage?.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
}

export async function saveTx(t: Tx) {
  const all = read<Tx[]>(TX_KEY, []);
  if (all.some(x => x.transactionId === t.transactionId || x.nonce === t.nonce)) throw new Error('Duplicate transaction');
  write(TX_KEY, [...all, t]);
}
export async function getPending(): Promise<Tx[]> {
  return read<Tx[]>(TX_KEY, []).filter(t => t.status === 'LOCAL_PENDING');
}
export async function setStatus(id: string, status: Tx['status']) {
  write(TX_KEY, read<Tx[]>(TX_KEY, []).map(t => (t.transactionId === id ? { ...t, status } : t)));
}
export async function history(): Promise<Tx[]> {
  return [...read<Tx[]>(TX_KEY, [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function cacheMerchant(m: Merchant) {
  write(MERCHANT_KEY, { ...read<Record<string, Merchant>>(MERCHANT_KEY, {}), [m.id]: m });
}
export async function getCachedMerchant(id: string): Promise<Merchant | null> {
  return read<Record<string, Merchant>>(MERCHANT_KEY, {})[id] ?? null;
}
