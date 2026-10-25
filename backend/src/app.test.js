const request = require("supertest");

const app = require("./app");
const store = require("./data/store");

function makeTransaction(overrides = {}) {
  return {
    transactionId: `TX-${Date.now()}-${Math.random()}`,
    merchantId: "SPZ12345",
    customerId: "CUS-DEMO",
    deviceId: "DEV-DEMO",
    amount: 50,
    currency: "ZAR",
    channel: "QR",
    nonce: `NONCE-${Date.now()}-${Math.random()}`,
    offline: false,
    createdAt: new Date().toISOString(),
    signature: "test-signature",
    publicKey: "test-public-key",
    ...overrides
  };
}

beforeEach(() => {
  store.transactions.clear();
  store.usedNonces.clear();
});

describe("Pay2Spaza backend", () => {
  test("GET /health returns a healthy response", async () => {
    const response = await request(app)
      .get("/health")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("healthy");
  });

  test("looks up an existing merchant", async () => {
    const response = await request(app)
      .get("/api/merchants/SPZ12345")
      .expect(200);

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

  test("returns 404 for an unknown merchant", async () => {
    const response = await request(app)
      .get("/api/merchants/UNKNOWN")
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Merchant not found");
  });

  test("confirms a valid transaction", async () => {
    const transaction = makeTransaction();

    const response = await request(app)
      .post("/api/transactions/sync")
      .send({ transactions: [transaction] })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.results).toEqual([
      {
        transactionId: transaction.transactionId,
        status: "CONFIRMED",
        reason: null
      }
    ]);

    expect(store.getTransaction(transaction.transactionId)).toBeDefined();
  });

  test("rejects a replayed nonce", async () => {
    const transaction = makeTransaction();

    await request(app)
      .post("/api/transactions/sync")
      .send({ transactions: [transaction] })
      .expect(200);

    const replay = {
      ...makeTransaction(),
      nonce: transaction.nonce
    };

    const response = await request(app)
      .post("/api/transactions/sync")
      .send({ transactions: [replay] })
      .expect(200);

    expect(response.body.data.results[0]).toMatchObject({
      transactionId: replay.transactionId,
      status: "REJECTED",
      reason: "Possible replay attack"
    });
  });

  test("rejects invalid transactions without crashing the batch", async () => {
    const valid = makeTransaction();
    const invalid = makeTransaction({
      transactionId: "INVALID-TX",
      amount: -10
    });

    const response = await request(app)
      .post("/api/transactions/sync")
      .send({ transactions: [valid, invalid] })
      .expect(200);

    expect(response.body.data.results).toHaveLength(2);
    expect(response.body.data.results[0].status).toBe("CONFIRMED");
    expect(response.body.data.results[1]).toMatchObject({
      transactionId: "INVALID-TX",
      status: "REJECTED",
      reason: "Invalid amount"
    });
  });

  test("rejects unknown merchants", async () => {
    const transaction = makeTransaction({
      merchantId: "SPZ-NOT-FOUND"
    });

    const response = await request(app)
      .post("/api/transactions/sync")
      .send({ transactions: [transaction] })
      .expect(200);

    expect(response.body.data.results[0]).toMatchObject({
      status: "REJECTED",
      reason: "Merchant not found"
    });
  });

  test("rejects malformed JSON", async () => {
    const response = await request(app)
      .post("/api/transactions/sync")
      .set("Content-Type", "application/json")
      .send('{"transactions":')
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      data: null,
      error: "Malformed JSON request"
    });
  });

  test("returns stored merchant transactions", async () => {
    const transaction = makeTransaction();

    await request(app)
      .post("/api/transactions/sync")
      .send({ transactions: [transaction] })
      .expect(200);

    const response = await request(app)
      .get("/api/merchants/SPZ12345/transactions")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.merchant.id).toBe("SPZ12345");
    expect(response.body.data.transactions).toHaveLength(1);
  });
});
