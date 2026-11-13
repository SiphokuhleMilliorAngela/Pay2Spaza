import { signTx, newNonce } from '../security/sign';
import { saveTx, getPending, setStatus, Tx } from '../database/db';
import { api } from '../api';
import { Strings } from '../i18n/strings';
import { A } from '../i18n/authStrings';
import { loadSession } from '../auth/session';
import { cachedWallet, refreshWallet } from './walletCache';

// Offline payments: R200 in total, 5 payments, and never more than the money the wallet held when the phone was last online.
export const OFFLINE_TOTAL = 200;
export const OFFLINE_MAX = 5;
const toCents = (rand: number) => Math.round(rand * 100);
const customerIdNow = async () => (await loadSession())?.phone ?? 'CUS-DEMO';

export async function getAllowance() {
  const pending = await getPending();
  const cached = await cachedWallet(await customerIdNow());
  const capCents = toCents(Math.min(OFFLINE_TOTAL, cached?.allowance ?? 0));
  const usedCents = pending.reduce((a, t) => a + toCents(t.amount), 0);
  return {
    leftAmount: Math.max(0, capCents - usedCents) / 100,
    leftCount: Math.max(0, OFFLINE_MAX - pending.length),
  };
}

export type PayOutcome = {
  kind: 'confirmed' | 'pending' | 'rejected';
  transactionId: string; createdAt: string; reason?: string | null;
  allowance?: { leftAmount: number; leftCount: number };
};

export async function pay(opts: { merchantId: string; amount: number; online: boolean; t: Strings; channel?: 'QR' | 'USSD' }): Promise<PayOutcome> {
  const { merchantId, online, t } = opts;
  const cents = toCents(opts.amount);
  if (!Number.isFinite(opts.amount) || cents <= 0) throw new Error('Invalid amount');
  const amount = cents / 100; // exactly what is signed, stored and sent
  const customerId = await customerIdNow();

  let offline = !online;
  if (online) {
    const wallet = await refreshWallet(customerId);
    if (!wallet) offline = true; // server not reachable: treat it as an offline payment, with the offline limits
    else if (wallet.balance < amount) throw new Error(A.noFunds(wallet.balance)); // decline: not enough money
  }
  if (offline) {
    const a = await getAllowance();
    if (amount > a.leftAmount) throw new Error(t.limitAmount(a.leftAmount));
    if (a.leftCount <= 0) throw new Error(t.limitCount);
  }

  const base = {
    transactionId: `P2S-${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`.toUpperCase(),
    merchantId, customerId, deviceId: 'DEV-DEMO', amount, currency: 'ZAR',
    channel: (opts.channel ?? 'QR') as 'QR' | 'USSD', nonce: newNonce(), offline, createdAt: new Date().toISOString(),
  };
  const { signature, publicKey } = await signTx(base);
  const tx: Tx = { ...base, signature, publicKey, status: 'LOCAL_PENDING' };
  await saveTx(tx);
  const common = { transactionId: tx.transactionId, createdAt: tx.createdAt };
  if (offline) return { kind: 'pending', ...common, allowance: await getAllowance() };

  const [r] = await api.submitTransactions([tx]);
  if (!r) return { kind: 'pending', ...common, allowance: await getAllowance() }; // server unreachable: stays queued
  const reason = r.reason && /insufficient/i.test(r.reason) ? A.noFundsServer : r.reason ?? null;
  await setStatus(tx.transactionId, r.status, reason);
  refreshWallet(customerId).catch(() => {}); // keep the saved balance fresh
  return { kind: r.status === 'CONFIRMED' ? 'confirmed' : 'rejected', ...common, reason };
}
