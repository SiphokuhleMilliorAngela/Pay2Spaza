import { signTx, newNonce } from '../security/sign';
import { saveTx, getPending, setStatus, Tx } from '../database/db';
import { api } from '../api';
import { Strings } from '../i18n/strings';

// Prototype offline allowance: R200 in total and 5 payments until the phone syncs.
// In production the allowance would be reserved in the customer's wallet; here it is simulated on the phone.
export const OFFLINE_TOTAL = 200;
export const OFFLINE_MAX = 5;

export async function getAllowance() {
  const pending = await getPending();
  const used = pending.reduce((a, t) => a + t.amount, 0);
  return { leftAmount: Math.max(0, OFFLINE_TOTAL - used), leftCount: Math.max(0, OFFLINE_MAX - pending.length) };
}

export type PayOutcome = {
  kind: 'confirmed' | 'pending' | 'rejected';
  transactionId: string; createdAt: string; reason?: string | null;
  allowance?: { leftAmount: number; leftCount: number };
};

export async function pay(opts: { merchantId: string; amount: number; online: boolean; t: Strings }): Promise<PayOutcome> {
  const { merchantId, amount, online, t } = opts;
  if (!online) {
    const a = await getAllowance();
    if (amount > a.leftAmount) throw new Error(t.limitAmount(a.leftAmount));
    if (a.leftCount <= 0) throw new Error(t.limitCount);
  }
  const base = {
    transactionId: `P2S-${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`.toUpperCase(),
    merchantId, customerId: 'CUS-DEMO', deviceId: 'DEV-DEMO', amount, currency: 'ZAR',
    channel: 'QR' as const, nonce: newNonce(), offline: !online, createdAt: new Date().toISOString(),
  };
  const { signature, publicKey } = await signTx(base);
  const tx: Tx = { ...base, signature, publicKey, status: 'LOCAL_PENDING' };
  await saveTx(tx);
  const common = { transactionId: tx.transactionId, createdAt: tx.createdAt };
  if (!online) return { kind: 'pending', ...common, allowance: await getAllowance() };
  const [r] = await api.submitTransactions([tx]);
  if (!r) return { kind: 'pending', ...common, allowance: await getAllowance() }; // server unreachable: stays queued
  await setStatus(tx.transactionId, r.status);
  return { kind: r.status === 'CONFIRMED' ? 'confirmed' : 'rejected', ...common, reason: r.reason ?? null };
}
