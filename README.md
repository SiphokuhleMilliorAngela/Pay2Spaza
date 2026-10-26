# Pay2Spaza 🇿🇦

> **Inclusive payments for Mzansi spaza shops, even when connectivity is unreliable.**

Pay2Spaza is an **offline-first, open payment solution** designed for South African spaza shops and their customers. It combines **QR payments, USSD, SMS, offline transaction recording, Open Payments and Interledger concepts** to provide a practical payment experience for township and rural environments.

> **Our goal:** Make digital payments accessible, secure and practical for spaza shop owners and customers, regardless of the phone they use or the quality of their connection.

---

## 💡 The Problem

Spaza shops are essential community businesses, but digital payments can be difficult when merchants face:

- Unreliable mobile-data connectivity
- High data costs and limited smartphone access
- Dependence on cash
- Payment fees and delayed confirmation
- Fake proof-of-payment scams
- Merchant impersonation and account-takeover risk
- Fragmented payment experiences

**Pay2Spaza starts with a different assumption: connectivity may disappear at any time.**

### The two problems we must solve together

1. **Connectivity:** Can a payment journey remain usable when the network is weak or unavailable?
2. **Financial risk:** If a transaction is captured offline, how do we protect the merchant when live funds cannot be verified?

Offline acceptance is therefore **not the same as guaranteed payment**. The prototype records an offline payment intent securely and marks it as pending until it can be validated and submitted.

---

## 🚀 Our Solution

Pay2Spaza offers multiple payment journeys:

### 📷 QR Payment

1. Customer scans the merchant QR code.
2. Pay2Spaza displays the verified shop name.
3. Customer enters or confirms the amount.
4. Customer approves the payment.
5. The transaction is submitted immediately if connected, or securely recorded as pending if fully offline.
6. The customer and merchant receive a clear status.

### 📱 USSD

Feature-phone or no-data customers can use a USSD journey:

```text
*120*321#

1. Pay Spaza
2. Check Payment
3. Transaction History
4. Help
```

### 💬 SMS

SMS supports payment notifications, receipts and status updates. It is **not** treated as the primary secure payment-authorisation mechanism.

---

## 🌐 Connectivity Model

| State | Connectivity | Pay2Spaza behaviour |
|---|---|---|
| 🟢 Connected | Wi-Fi/mobile data | Authorise and submit payment |
| 🟠 Low connectivity | No data, but cellular signalling available | Use supported USSD/SMS journeys |
| ⚫ Fully offline | No internet or cellular network | Securely record the transaction locally for later synchronisation |

### ⚠️ Offline does not mean settled

> **Never tell a merchant that money has been received when settlement has not actually happened.**

```text
LOCAL_PENDING → SYNCING → VALIDATING → CONFIRMED
                                  └──→ REJECTED
```

This distinction is central to merchant trust.

---

## ⚖️ Offline Payment Risk and Loss Allocation

Consider this scenario:

> A customer takes **R150** of groceries while the merchant is offline. When connectivity returns, the payment cannot be completed because the customer's available funds are insufficient.

The key business question is: **who carries the R150 loss?**

| Possible arrangement | Business impact |
|---|---|
| Merchant bears the loss | High merchant risk and potentially low adoption |
| Payment provider bears eligible loss | Merchant receives protection subject to provider rules and limits |
| Risk is shared | Loss allocation follows an agreed commercial/risk policy |
| Offline transaction is rejected | Lowest acceptance risk, but reduces usefulness during outages |

### Pay2Spaza principle

**Loss allocation must be treated as a core business requirement, not an implementation detail.**

A transaction limit limits exposure but does **not** prove funds are available. Multiple offline purchases can still create cumulative exposure.

For the hackathon, Pay2Spaza therefore demonstrates offline capture using **simulated balances, configurable limits and clear pending statuses**, without claiming guaranteed real-money offline settlement.

---

## ✅ Solution Enhancement Requirements

The following requirements form part of the Pay2Spaza hackathon solution and define how the prototype must respond to connectivity, financial risk, merchant trust and affordability.

### REQ-01: Offline Payment Continuity

Pay2Spaza must allow an eligible payment to be securely captured when internet connectivity is unavailable and synchronised when connectivity returns.

- The solution must detect whether the device is connected or offline.
- An offline transaction must be stored as **PENDING — NOT SETTLED**.
- The merchant must not receive a confirmed-payment message until the transaction has been successfully validated.
- Pending transactions must automatically enter the synchronisation process when connectivity returns.
- The merchant must be able to see which transactions are still waiting to synchronise.

### REQ-02: Offline Transaction Risk Limits

Pay2Spaza must apply configurable controls before allowing a transaction to be recorded offline.

- A maximum offline value per transaction must be configurable.
- A cumulative offline-value limit per customer/device or supported credential must be configurable.
- The number of outstanding offline transactions must be limited.
- Transactions that exceed the applicable offline rules must be rejected or require an alternative payment method.
- Prototype limits must remain configurable and must not be represented as production-approved thresholds.

### REQ-03: Insufficient-Funds and Settlement Risk

Pay2Spaza must clearly distinguish between recording an offline payment request and confirming successful payment.

- The solution must not assume that sufficient funds exist when a live balance or authorisation check cannot be completed.
- Offline transactions must remain pending until validation and payment processing are completed.
- Failed transactions must be updated to **REJECTED** and must not be included in confirmed merchant income.
- The prototype must demonstrate insufficient-funds scenarios using simulated balances.
- Production implementation must support an agreed loss-allocation policy defining whether eligible losses are carried by the merchant, payment provider or other participating party.

### REQ-04: Fraud, Replay and Duplicate Protection

Pay2Spaza must protect offline and synchronised transactions against basic transaction-manipulation risks.

Each applicable transaction must include or reference:

- A unique transaction ID
- A unique nonce
- Timestamp and expiry information
- Merchant and customer/device references
- Amount and currency
- Transaction status
- A digital signature or equivalent integrity control

During synchronisation, Pay2Spaza must check for duplicate transaction IDs, reused nonces, expired transactions and invalid transaction records before submission.

### REQ-05: Offline Reconciliation

When connectivity returns, Pay2Spaza must reconcile transactions captured offline.

```text
PENDING → SYNCING → VALIDATING → CONFIRMED
                              └→ REJECTED
```

- Synchronised transactions must be validated before being marked confirmed.
- Duplicate or invalid records must not be submitted twice.
- Failed reconciliation must produce a clear exception/status for the merchant.
- The solution must retain sufficient transaction information to support an audit trail.

### REQ-06: Simple Merchant Dashboard

Pay2Spaza must provide a simple business dashboard that a spaza shop owner can understand without technical or accounting knowledge.

The dashboard must show, at minimum:

- Money received today
- Money received this month
- Monthly confirmed-income trend
- Number and value of confirmed transactions
- Pending offline transactions
- Rejected transactions
- Average transaction value
- Best-performing products
- Low-performing or slow-moving products
- Payment-channel usage, where available
- Clear alerts for transactions requiring attention

Only **CONFIRMED** transactions must contribute to realised sales/income totals. Pending transactions must be displayed separately.

### REQ-07: Product-Level Business Insights

Pay2Spaza must capture enough basket/order information to calculate product performance.

Each relevant sale should capture:

- Product or product ID
- Quantity
- Unit price
- Total line value
- Associated transaction ID
- Transaction status
- Transaction date/time

The dashboard must use this information to identify products generating the most sales and products with low sales over the selected period.

### REQ-08: Merchant Payment Status

Pay2Spaza must use simple, consistent payment statuses so that the merchant always understands whether money has actually been received.

The merchant-facing statuses must include:

- **Pending** — recorded but not yet confirmed
- **Confirmed** — payment successfully validated/processed
- **Rejected** — payment failed validation or processing

Technical statuses may exist internally, but the merchant experience must remain simple.

### REQ-09: Merchant Affordability and Transparent Charges

Pay2Spaza must make applicable prototype fees or charges clear to the merchant and must not rely on hidden charges.

- Merchant transaction costs must be visible in the proposed business model.
- The prototype must allow affordability to be assessed as part of merchant adoption.
- Any customer surcharge mechanism must remain subject to validation against applicable payment-provider agreements and regulatory requirements before production use.

### REQ-10: Merchant Trust and Adoption

Pay2Spaza must prioritise merchant trust throughout the payment experience.

- The solution must verify the merchant identity presented to the customer.
- The merchant must receive clear confirmation only after successful payment validation.
- Pending and rejected transactions must be easy to identify.
- The merchant must be able to review transaction history and outstanding exceptions.
- The dashboard must provide useful business information in addition to payment processing.

### REQ-11: Recovery and Exception Handling

Pay2Spaza must support defined exception scenarios for offline transactions.

The prototype must cater for or demonstrate handling of:

- Connectivity returning after an extended period
- Expired offline transactions
- Duplicate synchronisation attempts
- Failed validation
- Corrupted or altered transaction records
- Device loss before synchronisation, where technically feasible within the MVP

### REQ-12: Controlled Offline Acceptance

Pay2Spaza must use controlled offline acceptance rather than treating every offline transaction as guaranteed payment.

```text
Payment initiated
      ↓
Connectivity available?
   ↙             ↘
 YES              NO
  ↓                ↓
Live flow     Apply offline controls
                   ↓
             Within limits?
              ↙         ↘
            YES          NO
             ↓            ↓
       Record pending   Reject / use
          payment       another method
             ↓
       Reconnect and reconcile
             ↓
      CONFIRMED / REJECTED
```

This requirement allows Pay2Spaza to remain useful during connectivity problems while controlling merchant exposure and avoiding false confirmation of payment.

---

## 🛡️ Offline Risk Controls

Before recording an offline transaction, the prototype can evaluate:

- Supported payment credential
- Maximum permitted offline amount
- Cumulative offline amount
- Number of outstanding offline transactions
- Transaction expiry
- Device binding
- Unique transaction ID
- Unique nonce
- Digital signature
- Locally available risk indicators

### Replay and duplicate protection

```text
Transaction received
        ↓
Check Transaction ID
        ↓
Check Nonce
        ↓
Duplicate detected?
      ↙     ↘
    Yes      No
     ↓        ↓
   REJECT   CONTINUE
```

Prototype limits, such as **R200 per offline transaction or five transactions before synchronisation**, are demonstration values only and require proper risk modelling before any real deployment.

---

## 📴 Offline Transaction Journey

```text
Customer initiates payment
          ↓
Apply offline risk controls
          ↓
Accept or reject under prototype rules
          ↓
Create signed transaction record
          ↓
Encrypted local storage
          ↓
PENDING — NOT SETTLED
          ↓
Connectivity restored
          ↓
Synchronise + validate
          ↓
Duplicate / replay / fraud checks
          ↓
Submit payment
       ↙       ↘
 CONFIRMED    REJECTED
```

### Recovery and reconciliation

The design must also address exceptions such as:

- Device loss before synchronisation
- Altered or corrupted transaction records
- Long periods without connectivity
- Expired offline requests
- Duplicate submissions
- Failed authorisation after reconnection

---

## 🔗 Open Payments and Interledger

**Open Payments** is the standardised API layer used by the prototype to model interactions with participating account or wallet providers. It supports concepts including wallet addresses, authorisation, incoming payments, quotes and outgoing payments.

**Interledger / Rafiki** provides the interoperability story between participating payment systems in the hackathon environment.

```text
Customer Wallet
      ↓
Open Payments
      ↓
Interledger / Rafiki
      ↓
Merchant Wallet
```

**Important architectural boundary:** Open Payments and Interledger support the connected payment/interoperability layer. Pay2Spaza's offline capture, local risk rules and later synchronisation are separate prototype capabilities. The solution does not assume that interoperability itself guarantees offline authorisation or settlement.

Official resources:
- https://openpayments.dev/
- https://interledger.org/
- https://rafiki.dev/

---

## 📊 Simple Merchant Business Dashboard

The dashboard must be **simple enough for a spaza owner to understand at a glance**, not a complex banking dashboard.

It should answer five practical questions:

1. **How much money has come in today and this month?**
2. **How has money coming in changed over recent months?**
3. **Which products are doing well?**
4. **Which products are not doing well?**
5. **Which payments still need attention?**

The goal is not to build an accounting system. The dashboard should give the owner a **quick, visual health check of the business** using plain language and only the information needed to make day-to-day decisions.

### Dashboard MVP

| Dashboard area | What the merchant sees | Why it matters |
|---|---|---|
| Money In | Total confirmed sales for today/month | Quick view of business performance |
| Monthly Income Trend | Sales value by month | Shows whether income is growing or declining |
| Top Products | Best-selling products by quantity/revenue | Shows what is doing well |
| Slow Products | Low-selling products | Helps identify stock that is not moving |
| Transactions | Confirmed, pending and rejected payments | Keeps payment status visible |
| Channel Mix | QR, USSD and other supported channels | Shows how customers prefer to pay |
| Average Sale | Average transaction value | Gives a simple view of customer spend |
| Alerts | Pending sync, rejected payments, unusual activity | Shows what needs action |

### Example merchant view

```text
┌─────────────────────────────────────┐
│ Pay2Spaza Business Overview         │
├─────────────────────────────────────┤
│ Money In This Month     R 12,450    │
│ Confirmed Transactions      238     │
│ Pending Transactions          4     │
│ Average Sale             R 52.31    │
├─────────────────────────────────────┤
│ MONTHLY SALES                       │
│ Jul  ██████        R 8,100          │
│ Aug  ████████      R 9,750          │
│ Sep  █████████    R 11,200          │
│ Oct  ██████████   R 12,450          │
├─────────────────────────────────────┤
│ TOP PRODUCTS                        │
│ 1. Bread                            │
│ 2. Milk                             │
│ 3. Cold drinks                      │
├─────────────────────────────────────┤
│ NEEDS ATTENTION                     │
│ Slow moving: Product X              │
│ Pending sync: 4 transactions        │
│ Rejected: 2 transactions            │
└─────────────────────────────────────┘
```

> **Note:** The figures and products above are illustrative hackathon demo data, not real merchant financial results.

### Product-performance data requirement

To show which products perform well, the payment transaction alone is not enough. The prototype must also capture a lightweight **basket/order record** linking a transaction to products, quantities and prices.

Example:

```json
{
  "transactionId": "P2S-82931",
  "merchantId": "SPZ12345",
  "status": "CONFIRMED",
  "total": 50.00,
  "items": [
    { "product": "Bread", "quantity": 2, "unitPrice": 20.00 },
    { "product": "Milk", "quantity": 1, "unitPrice": 10.00 }
  ]
}
```

Only **confirmed** payments should count as realised sales in the main income totals. Pending payments should be shown separately to avoid overstating income.

---

## 🏪 Merchant Trust and Adoption

Technical functionality alone is not enough. A merchant must believe Pay2Spaza is safer and more useful than accepting cash only.

The solution should therefore be:

- **Simple:** Minimal steps and plain transaction statuses
- **Trustworthy:** Never present pending funds as received
- **Affordable:** Avoid costs that make cash more attractive
- **Useful:** Provide payment history and easy business insights
- **Transparent:** Clearly distinguish confirmed, pending and rejected payments
- **Recoverable:** Provide a reconciliation process when something goes wrong

Any proposed customer surcharge or merchant payment fee would need to align with the applicable provider arrangement and regulatory requirements before production deployment.

---

## 🎯 Hackathon MVP Scope

### ✅ Build Now

**Merchant**
- Registration and verification
- Merchant QR generation
- Transaction history
- Offline transaction queue
- Simple business dashboard

**Customer**
- Scan QR
- Verify merchant
- Enter amount
- Confirm payment
- View transaction status
- Receive digital receipt

**Payments**
- Open Payments sandbox flow
- Interledger/Rafiki test flow
- Simulated wallet balances
- Connected QR payment
- Offline transaction recording
- Synchronisation

**Data and Insights**
- Monthly money-in trend
- Confirmed sales totals
- Top-performing products
- Slow-performing products
- Transaction status counts
- Payment-channel breakdown

**Low Connectivity**
- USSD payment simulation
- SMS payment notifications

**Security and Risk**
- Device binding
- Transaction IDs and nonces
- Digital signatures
- Replay protection
- Offline limits
- Rules-based fraud controls

---

## 🛠️ Technology Stack

- **Mobile:** React Native, Expo Development Build, TypeScript/JavaScript, SQLite
- **Backend:** Node.js, Express.js
- **Server Database:** PostgreSQL
- **Cloud:** Microsoft Azure
- **Payments:** Open Payments, Interledger, Rafiki sandbox/test environment
- **Low connectivity:** USSD/SMS gateway integration or simulation

---

## 🎬 Hackathon Demo Journey

### 1. Register the merchant
```text
Registration → Verification → Device Binding → Merchant Verified → QR Generated
```

### 2. Connected payment
```text
Scan QR → Verify Merchant → Add Basket → Confirm → Submit → CONFIRMED
```

### 3. Business dashboard updates
```text
Confirmed Payment
      ↓
Update Money In
      ↓
Update Monthly Trend
      ↓
Update Product Performance
```

### 4. Connectivity disappears
```text
Scan QR → Apply Offline Controls → Sign → Store Securely → LOCAL_PENDING
```

### 5. Connectivity returns
```text
Sync → Validate → Fraud / Replay Checks → Submit → CONFIRMED or REJECTED
```

### 6. Feature-phone journey
```text
Dial USSD → Merchant Code → Amount → Verify Merchant → Confirm → SMS Status
```

## 🔮 Future Features

- PayShap integration
- Request-to-Pay
- NFC
- Multiple wallet providers
- Advanced merchant verification
- Hardware-backed device keys
- Advanced fraud analytics
- Merchant inventory insights
- Sales forecasting when sufficient quality data exists
- Multi-bank integration
- Cross-border Interledger use cases

---

## 🚫 Not in the MVP

- Guaranteed real-money offline settlement
- Production banking integration
- Credit/lending
- AI-controlled payment approval
- Production biometric identity verification
- Cross-border settlement

---

## ⚠️ Disclaimer

Pay2Spaza is a **hackathon prototype**. It demonstrates payment initiation, offline transaction recording, synchronisation, risk controls, merchant analytics and Open Payments/Interledger concepts.

It is not a production-ready banking, settlement or offline stored-value system. Real deployment would require regulated payment partners, security testing, compliance and consumer-protection controls, agreed loss-allocation rules, and integration with authorised payment infrastructure.

---

<div align="center">

## Pay2Spaza 🇿🇦

**One verified spaza payment identity. Multiple ways to pay.**  
**Built for the realities of Mzansi.**

</div>

