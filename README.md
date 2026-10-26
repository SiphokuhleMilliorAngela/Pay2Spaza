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

It should answer four practical questions:

1. **How much money has come in?**
2. **Which products are selling well?**
3. **Which products are not doing well?**
4. **Which payments still need attention?**

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

## ❓ Core Business Questions

Before production, the team must be able to answer:

- **Offline limits:** What is the maximum transaction and cumulative offline exposure?
- **Loss allocation:** Who bears the loss when a payment recorded offline later fails?
- **Fraud:** How are replay, duplicate, expired and repeated offline-spend attempts managed?
- **Merchant experience:** How does the merchant distinguish accepted, pending and rejected payments?
- **Affordability:** What does the merchant pay, and does the cost still make digital acceptance attractive?
- **Recovery:** What happens when a device is lost or a transaction cannot be synchronised?
- **Product analytics:** How is basket-level product information captured so the dashboard can identify top and slow sellers?

---

## 🧑‍⚖️ Questions Hackathon Judges May Ask

### Why would a spaza shop owner use this instead of cash?

Pay2Spaza combines flexible payment channels with verified merchant identities, honest transaction statuses and simple business insights. The merchant gains a digital payment record plus visibility into money coming in and products performing well.

### Who pays if an offline payment fails later?

The prototype does not hide this risk. It demonstrates configurable exposure controls and marks offline transactions as pending. A real deployment would require an agreed loss-allocation policy with the relevant regulated payment participants.

### What stops a customer spending the same funds repeatedly while offline?

The prototype limits exposure using transaction IDs, nonces, digital signatures, per-transaction limits, cumulative limits and outstanding-transaction counts. These reduce risk but do not replace live authorisation.

### What if a merchant is offline for hours or days?

Transactions stay pending, subject to expiry and exposure rules, until synchronisation is possible. The merchant dashboard keeps those transactions separate from confirmed income.

### How do you measure impact?

Potential measures include:

- Digital-payment acceptance rate
- Number/value of confirmed payments
- Percentage of transactions initiated under low-connectivity conditions
- Offline-to-confirmed conversion rate
- Rejected/expired offline transaction rate
- Active merchants
- Repeat customers
- Merchant revenue trend
- Product sales trend

---

## 👩🏾‍💼 Data / Business Analysis Contribution

The Data/BA role helps ensure that Pay2Spaza is not only buildable, but solves the right problem.

Key ownership areas include:

- Problem statement and target-user needs
- Business requirements and acceptance criteria
- Offline journey and exception scenarios
- Risk register, assumptions and open questions
- Loss-allocation requirement
- Merchant adoption and affordability
- Dashboard and business metrics
- Data requirements and analytics
- Evidence used to demonstrate impact

The strongest prototype connects the technical demo to a credible story about **merchant trust, financial risk, useful data and real-world adoption**.

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

---

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
