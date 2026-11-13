import * as SQLite from 'expo-sqlite';

export type Tx = {
  transactionId: string; merchantId: string; customerId: string; deviceId: string;
  amount: number; currency: string; channel: 'QR' | 'USSD'; nonce: string;
  offline: boolean; createdAt: string; signature: string; publicKey: string;
  status: 'LOCAL_PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED';
};

let db: SQLite.SQLiteDatabase;
export async function getDb() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('pay2spaza.db');
    await db.execAsync(`CREATE TABLE IF NOT EXISTS tx (
      transactionId TEXT PRIMARY KEY, merchantId TEXT, customerId TEXT, deviceId TEXT,
      amount REAL, currency TEXT, channel TEXT, nonce TEXT UNIQUE, offline INTEGER,
      createdAt TEXT, signature TEXT, publicKey TEXT, status TEXT);`);
  }
  return db;
}
export async function saveTx(t: Tx) {
  const d = await getDb();
  await d.runAsync(
    `INSERT INTO tx VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [t.transactionId, t.merchantId, t.customerId, t.deviceId, t.amount, t.currency, t.channel,
     t.nonce, t.offline ? 1 : 0, t.createdAt, t.signature, t.publicKey, t.status]);
}
export async function getPending(): Promise<Tx[]> {
  const d = await getDb();
  const rows = await d.getAllAsync<any>(`SELECT * FROM tx WHERE status='LOCAL_PENDING'`);
  return rows.map(r => ({ ...r, offline: !!r.offline }));
}
export async function setStatus(id: string, status: Tx['status']) {
  const d = await getDb();
  await d.runAsync(`UPDATE tx SET status=? WHERE transactionId=?`, [status, id]);
}
export async function history(): Promise<Tx[]> {
  const d = await getDb();
  const rows = await d.getAllAsync<any>(`SELECT * FROM tx ORDER BY createdAt DESC`);
  return rows.map(r => ({ ...r, offline: !!r.offline }));
}
