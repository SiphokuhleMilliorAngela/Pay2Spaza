import { signTx, newNonce } from '../security/sign';
import { saveTx, getPending, setStatus, Tx } from '../database/db';
import { api } from '../api';
import { Strings } from '../i18n/strings';

const OFFLINE_LIMIT = 200, OFFLINE_MAX = 5; // prototype values, must match the backend rules

export async function pay(opts: { merchantId: string; amount: number; online: boolean; t: Strings }) {
  const { merchantId, amount, online, t } = opts;
  if (!online) {
    if (amount > OFFLINE_LIMIT) throw new Error(t.limitAmount);
    if ((await getPending()).length >= OFFLINE_MAX) throw new Error(t.limitCount);
  }
  const base = {
    transactionId: `P2S-${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`.toUpperCase(),
    merchantId, customerId: 'CUS-DEMO', deviceId: 'DEV-DEMO', amount, currency: 'ZAR',
    channel: 'QR' as const, nonce: newNonce(), offline: !online, createdAt: new Date().toISOString(),
  };
  const { signature, publicKey } = await signTx(base);
  const tx: Tx = { ...base, signature, publicKey, status: 'LOCAL_PENDING' };
  await saveTx(tx);
  if (!online) return { kind: 'pending' as const, reason: null };
  const [r] = await api.submitTransactions([tx]);
  if (!r) return { kind: 'pending' as const, reason: null }; // server unreachable: stays queued
  await setStatus(tx.transactionId, r.status);
  return { kind: r.status === 'CONFIRMED' ? ('confirmed' as const) : ('rejected' as const), reason: r.reason ?? null };
}
