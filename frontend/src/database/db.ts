import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

export type Tx = {
  transactionId: string;
  merchantId: string;
  customerId: string;
  deviceId: string;
  amount: number;
  currency: string;
  channel: 'QR' | 'USSD';
  nonce: string;
  offline: boolean;
  createdAt: string;
  signature: string;
  publicKey: string;
  status: 'LOCAL_PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'REJECTED' | 'EXPIRED';
};

// Simple web-in-memory array storage fallback to mimic database rows
let webDbMemory: any[] = [];

let db: any = null;

export async function getDb() {
  // 1. SAFELY BYPASS SQLITE ON WEB PLATFORMS
  if (Platform.OS === 'web') {
    return {
      runAsync: async () => {},
      execAsync: async () => {},
      getAllAsync: async () => []
    };
  }

  // 2. NATIVE MOBILE APP FLOW (iOS / Android)
  if (!db) {
    db = await SQLite.openDatabaseAsync('pay2spaza.db');
    await db.execAsync(`CREATE TABLE IF NOT EXISTS tx (
      transactionId TEXT PRIMARY KEY, merchantId TEXT, customerId TEXT, deviceId TEXT,
      amount REAL, currency TEXT, channel TEXT, nonce TEXT, offline INTEGER,
      createdAt TEXT, signature TEXT, publicKey TEXT, status TEXT);`);
  }
  return db;
}

export async function saveTx(t: Tx) {
  if (Platform.OS === 'web') {
    // Web fallback: Save to local memory array so app works interactively 
    webDbMemory.push({ ...t, offline: t.offline ? 1 : 0 });
    return;
  }

  const d = await getDb();
  await d.runAsync(
    'INSERT INTO tx VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [t.transactionId, t.merchantId, t.customerId, t.deviceId, t.amount, t.currency, t.channel,
     t.nonce, t.offline ? 1 : 0, t.createdAt, t.signature, t.publicKey, t.status]
  );
}

export async function getPending(): Promise<Tx[]> {
  if (Platform.OS === 'web') {
    // Web fallback filter
    return webDbMemory
      .filter(r => r.status === 'LOCAL_PENDING')
      .map(r => ({ ...r, offline: !r.offline }));
  }

  const d = await getDb();
  const rows = await d.getAllAsync<any>('SELECT * FROM tx WHERE status=\'LOCAL_PENDING\'');
  return rows.map(r => ({ ...r, offline: !r.offline }));
}

export async function setStatus(id: string, status: Tx['status']) {
  if (Platform.OS === 'web') {
    // Web fallback update
    const target = webDbMemory.find(r => r.transactionId === id);
    if (target) target.status = status;
    return;
  }

  const d = await getDb();
  await d.runAsync('UPDATE tx SET status=? WHERE transactionId=?', [status, id]);
}

export async function history(): Promise<Tx[]> {
  if (Platform.OS === 'web') {
    // Web fallback list sorting
    return [...webDbMemory]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(r => ({ ...r, offline: !r.offline }));
  }

  const d = await getDb();
  const rows = await d.getAllAsync<any>('SELECT * FROM tx ORDER BY createdAt DESC');
  return rows.map(r => ({ ...r, offline: !r.offline }));
}
