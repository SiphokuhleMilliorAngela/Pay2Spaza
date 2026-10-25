const request = require("supertest");
const app = require("./app");
const { resetTransactions } = require("./data/store");

const baseTransaction = {
  transactionId: "TX-001",
  merchantId: "SPZ12345",
  customerId: "CUS-001",
  deviceId: "DEV-001",
  amount: 50,
  currency: "ZAR",
  channel: "QR",
  nonce: "NONCE-001",
  offline: true,
  createdAt: "2026-10-25T12:00:00.000Z",
  signature: "SIG-001",
  publicKey: "PUB-001",
  status: "LOCAL_PENDING"
};

beforeEach(() => {
  resetTransactions();
});

describe("Pay2Spaza backend API", () => {
  it("keeps health endpoint working with API envelope", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        service: "pay2spaza-backend",
        status: "healthy"
      },
      error: null
    });
  });

  it("returns seeded merchant details", async () => {
    const response = await request(app).get("/api/merchants/SPZ12345");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        id: "SPZ12345",
        name: "Thuba’s Spaza",
        ownerFirstName: "Thuba"
      },
      error: null
    });
  });

  it("returns not found for unknown merchant", async () => {
    const response = await request(app).get("/api/merchants/UNKNOWN");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      data: null,
      error: "Merchant not found"
    });
  });

  it("syncs a valid transaction and supports idempotent re-submit", async () => {
    const firstResponse = await request(app)
      .post("/api/transactions/sync")
      .send({ transactions: [baseTransaction] });

    expect(firstResponse.status).toBe(200);
    expect(firstResponse.body.data.results).toEqual([
      { transactionId: "TX-001", status: "CONFIRMED", reason: null }
    ]);

    const secondResponse = await request(app)
      .post("/api/transactions/sync")
      .send({ transactions: [baseTransaction] });

    expect(secondResponse.status).toBe(200);
    expect(secondResponse.body.data.results).toEqual([
      { transactionId: "TX-001", status: "CONFIRMED", reason: null }
    ]);
  });

  it("rejects replayed nonce and duplicate transaction IDs with stable reasons", async () => {
    const accepted = { ...baseTransaction };
    const duplicateId = { ...baseTransaction, nonce: "NONCE-NEW", amount: 75 };
    const replayedNonce = { ...baseTransaction, transactionId: "TX-002" };

    const response = await request(app)
      .post("/api/transactions/sync")
      .send({ transactions: [accepted, duplicateId, replayedNonce] });

    expect(response.status).toBe(200);
    expect(response.body.data.results).toEqual([
      { transactionId: "TX-001", status: "CONFIRMED", reason: null },
      { transactionId: "TX-001", status: "REJECTED", reason: "Duplicate transaction ID" },
      { transactionId: "TX-002", status: "REJECTED", reason: "Possible replay attack" }
    ]);
  });

  it("rejects malformed payloads and invalid transactions without crashing the batch", async () => {
    const invalidAmount = { ...baseTransaction, transactionId: "TX-003", nonce: "NONCE-003", amount: 0 };
    const unknownMerchant = { ...baseTransaction, transactionId: "TX-004", nonce: "NONCE-004", merchantId: "SPZ00000" };
    const missingFields = { transactionId: "TX-005", merchantId: "SPZ12345", amount: 10 };

    const response = await request(app)
      .post("/api/transactions/sync")
      .send({ transactions: [invalidAmount, unknownMerchant, missingFields] });

    expect(response.status).toBe(200);
    expect(response.body.data.results).toEqual([
      { transactionId: "TX-003", status: "REJECTED", reason: "Invalid transaction amount" },
      { transactionId: "TX-004", status: "REJECTED", reason: "Unknown merchant" },
      {
        transactionId: "TX-005",
        status: "REJECTED",
        reason: "Missing required fields: customerId, deviceId, currency, channel, nonce, offline, createdAt, signature, publicKey, status"
      }
    ]);
  });

  it("supports mixed-batch sync and merchant transaction history", async () => {
    const validOne = { ...baseTransaction };
    const validTwo = { ...baseTransaction, transactionId: "TX-006", nonce: "NONCE-006", amount: 25 };
    const invalid = { ...baseTransaction, transactionId: "TX-007", nonce: "NONCE-006" };

    const syncResponse = await request(app)
      .post("/api/transactions/sync")
      .send({ transactions: [validOne, validTwo, invalid] });

    expect(syncResponse.status).toBe(200);
    expect(syncResponse.body.data.results).toEqual([
      { transactionId: "TX-001", status: "CONFIRMED", reason: null },
      { transactionId: "TX-006", status: "CONFIRMED", reason: null },
      { transactionId: "TX-007", status: "REJECTED", reason: "Possible replay attack" }
    ]);

    const historyResponse = await request(app).get("/api/merchants/SPZ12345/transactions");

    expect(historyResponse.status).toBe(200);
    expect(historyResponse.body.success).toBe(true);
    expect(historyResponse.body.data.transactions).toHaveLength(2);
    expect(historyResponse.body.data.transactions.map((tx) => tx.transactionId)).toEqual([
      "TX-001",
      "TX-006"
    ]);
  });

  it("returns envelope 400 for malformed sync body and envelope 404 for unknown route", async () => {
    const badPayload = await request(app).post("/api/transactions/sync").send({ transactions: {} });

    expect(badPayload.status).toBe(400);
    expect(badPayload.body).toEqual({
      success: false,
      data: null,
      error: "Invalid payload: transactions must be an array"
    });

    const notFound = await request(app).get("/api/does-not-exist");

    expect(notFound.status).toBe(404);
    expect(notFound.body).toEqual({
      success: false,
      data: null,
      error: "Route not found"
    });
  });
});
