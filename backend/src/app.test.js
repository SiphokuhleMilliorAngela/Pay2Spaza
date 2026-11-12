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
  store.otpChallenges.clear();
  store.wallets.clear();
  store.users.clear();
  store.sessions.clear();
  store.saveWallet({ customerId: "CUS-DEMO", balance: 1000, currency: "ZAR" });
});

describe("Pay2Spaza backend", () => {
  test("generates and verifies a one-time OTP", async () => {
    const requestResponse = await request(app)
      .post("/api/auth/otp/request")
      .send({ identifier: "user@example.com" })
      .expect(201);

    expect(requestResponse.body.data.otp).toMatch(/^\d{6}$/);

    await request(app)
      .post("/api/auth/otp/verify")
      .send({
        identifier: "USER@EXAMPLE.COM",
        code: requestResponse.body.data.otp
      })
      .expect(200);

    const replayResponse = await request(app)
      .post("/api/auth/otp/verify")
      .send({
        identifier: "user@example.com",
        code: requestResponse.body.data.otp
      })
      .expect(400);

    expect(replayResponse.body.error).toBe("OTP is invalid or has expired");
  });

  test("rejects an incorrect OTP", async () => {
    await request(app)
      .post("/api/auth/otp/request")
      .send({ identifier: "+27820000000" })
      .expect(201);

    const response = await request(app)
      .post("/api/auth/otp/verify")
      .send({ identifier: "+27820000000", code: "000000" })
      .expect(400);

    expect(response.body.error).toBe("Invalid OTP");
  });

  test("signs up and logs in a user", async () => {
    const signup = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Demo User", password: "password123", role: "customer" })
      .expect(201);

    expect(signup.body.data.user).toMatchObject({ name: "demo user", role: "customer" });
    expect(signup.body.data.token).toEqual(expect.any(String));

    const login = await request(app)
      .post("/api/auth/login")
      .send({ name: "DEMO USER", password: "password123" })
      .expect(200);

    expect(login.body.data.user.id).toBe(signup.body.data.user.id);
    expect(login.body.data.token).toEqual(expect.any(String));
  });

  test("allows only admins to access the dashboard", async () => {
    const customer = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Customer", password: "password123", role: "customer" })
      .expect(201);
    const admin = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Admin", password: "password123", role: "admin" })
      .expect(201);

    await request(app).get("/api/merchants").expect(401);
    await request(app)
      .get("/api/merchants")
      .set("Authorization", `Bearer ${customer.body.data.token}`)
      .expect(403);
    await request(app)
      .get("/api/merchants")
      .set("Authorization", `Bearer ${admin.body.data.token}`)
      .expect(200);
  });

  test("rejects duplicate and invalid signup requests", async () => {
    await request(app)
      .post("/api/auth/signup")
      .send({ name: "Demo User", password: "password123", role: "customer" })
      .expect(201);

    await request(app)
      .post("/api/auth/signup")
      .send({ name: "demo user", password: "password123", role: "customer" })
      .expect(409);

    await request(app)
      .post("/api/auth/signup")
      .send({ name: "short", password: "short", role: "customer" })
      .expect(400);
  });
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

  test("lists merchants for the dashboard", async () => {
    const admin = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Dashboard Admin", password: "password123", role: "admin" });
    const response = await request(app)
      .get("/api/merchants")
      .set("Authorization", `Bearer ${admin.body.data.token}`)
      .expect(200);

    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String)
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
    expect((await store.getWallet("CUS-DEMO")).balance).toBe(950);
  });

  test("deducts the wallet when an offline transaction is synced", async () => {
    const transaction = makeTransaction({ offline: true, amount: 75 });

    await request(app)
      .post("/api/transactions/sync")
      .send({ transactions: [transaction] })
      .expect(200);

    expect((await store.getWallet("CUS-DEMO")).balance).toBe(925);
  });

  test("rejects a transaction when the wallet has insufficient funds", async () => {
    await store.saveWallet({ customerId: "CUS-DEMO", balance: 10, currency: "ZAR" });
    const transaction = makeTransaction({ amount: 11 });

    const response = await request(app)
      .post("/api/transactions/sync")
      .send({ transactions: [transaction] })
      .expect(200);

    expect(response.body.data.results[0]).toMatchObject({
      status: "REJECTED",
      reason: "Insufficient wallet balance"
    });
    expect(store.getTransaction(transaction.transactionId)).resolves.toBeNull();
  });

  test("creates and tops up a fake wallet", async () => {
    const created = await request(app)
      .post("/api/wallets")
      .send({ customerId: "CUS-NEW", balance: 50 })
      .expect(201);

    expect(created.body.data).toMatchObject({
      customerId: "CUS-NEW",
      balance: 50,
      currency: "ZAR"
    });

    const toppedUp = await request(app)
      .post("/api/wallets/CUS-NEW/top-up")
      .send({ amount: 25 })
      .expect(200);

    expect(toppedUp.body.data.balance).toBe(75);
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

  test("returns dashboard transactions and summary", async () => {
    const admin = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Summary Admin", password: "password123", role: "admin" });
    const first = makeTransaction({ amount: 40 });
    const second = makeTransaction({
      amount: 60,
      customerId: "CUS-OTHER",
      transactionId: "TX-OTHER",
      nonce: "NONCE-OTHER"
    });

    await request(app).post("/api/transactions/sync").send({ transactions: [first] }).expect(200);
    await store.saveWallet({ customerId: "CUS-OTHER", balance: 100, currency: "ZAR" });
    await request(app).post("/api/transactions/sync").send({ transactions: [second] }).expect(200);

    const transactions = await request(app)
      .get("/api/transactions?merchantId=SPZ12345")
      .set("Authorization", `Bearer ${admin.body.data.token}`)
      .expect(200);
    expect(transactions.body.data.transactions).toHaveLength(2);

    const summary = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${admin.body.data.token}`)
      .expect(200);
    expect(summary.body.data).toMatchObject({
      merchantCount: 2,
      transactionCount: 2,
      confirmedCount: 2,
      totalAmount: 100,
      currency: "ZAR"
    });

    const customer = await request(app)
      .get("/api/transactions/customer/CUS-OTHER")
      .set("Authorization", `Bearer ${admin.body.data.token}`)
      .expect(200);
    expect(customer.body.data.transactions).toHaveLength(1);
  });
});
