import * as SQLite from 'expo-sqlite';
import type { Merchant } from '../api/types';

import type { Tx } from './types';
export type { Tx } from './types';

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

// Merchant cache: lets a shop already looked up be found again while offline.
async function getMerchantTable() {
  const d = await getDb();
  await d.execAsync(`CREATE TABLE IF NOT EXISTS merchant (
    id TEXT PRIMARY KEY, name TEXT, ownerFirstName TEXT);`);
  return d;
}
export async function cacheMerchant(m: Merchant) {
  const d = await getMerchantTable();
  await d.runAsync(`INSERT OR REPLACE INTO merchant VALUES (?,?,?)`, [m.id, m.name, m.ownerFirstName]);
}
export async function getCachedMerchant(id: string): Promise<Merchant | null> {
  try {
    const d = await getMerchantTable();
    return (await d.getFirstAsync<Merchant>(`SELECT * FROM merchant WHERE id=?`, [id])) ?? null;
  } catch { return null; }
}
