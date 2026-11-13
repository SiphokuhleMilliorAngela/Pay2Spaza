import { getPending, setStatus } from '../database/db';
import { api } from '../api';

// Call when the phone is online. Sends queued offline payments and stores the outcome.
export async function syncPending(online: boolean) {
  if (!online) return 0;
  const pending = await getPending();
  if (!pending.length) return 0;
  const results = await api.submitTransactions(pending);
  for (const r of results) await setStatus(r.transactionId, r.status);
  return results.length;
}
