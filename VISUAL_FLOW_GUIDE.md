# Payment Flow Visual Guide

## Expected User Journey

### Step 1: Billing Page

```
┌─────────────────────────────────────────┐
│           Manage Your Plan               │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Free Plan (Current)    $0/month     │ │
│ │ - 2 drivers                         │ │
│ │ - Basic tracking                    │ │
│ │                                     │ │
│ │         [UPGRADE PLAN]              │ ← Click here
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Starter Plan           $29/month     │ │
│ │ - 5 drivers                         │ │
│ │ - Advanced analytics                │ │
│ │                                     │ │
│ │         [UPGRADE PLAN]              │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Step 2: Paystack Checkout

```
┌──────────────────────────────────────────┐
│         Paystack Payment Checkout        │
│                                          │
│  Order Summary:                          │
│  Starter Plan (1 month)         ₦29.00  │
│  ──────────────────────────     ────   │
│  Total                          ₦29.00  │
│                                          │
│  Card Details:                           │
│  Card Number: [4111 1111 1111 1111]     │
│  Expiry: [MM/YY]                        │
│  CVV: [123]                             │
│                                          │
│         [COMPLETE PAYMENT]               │
│                                          │
│  ✓ Secure transaction (SSL)              │
└──────────────────────────────────────────┘
```

### Step 3: Payment Verification (NEW!)

```
┌──────────────────────────────────────────┐
│      PAYMENT VERIFICATION (New Page!)     │
│                                          │
│         ⏳ LOADING STATE                 │
│                                          │
│      Verifying your payment...           │
│                                          │
│      (Automatic - should complete       │
│       within 2-5 seconds)                │
└──────────────────────────────────────────┘

↓ (After verification succeeds)

┌──────────────────────────────────────────┐
│      PAYMENT VERIFICATION SUCCESS!       │
│                                          │
│         ✅ SUCCESS                       │
│                                          │
│  Payment verified successfully!          │
│  Your plan is now active.                │
│                                          │
│  Invoice:                                │
│  Amount: ₦29.00                          │
│  Date: Jan 15, 2024                      │
│  Status: PAID                            │
│                                          │
│  Redirecting to billing page             │
│  in 3 seconds...                         │
│                                          │
│         [SKIP REDIRECT]                  │
└──────────────────────────────────────────┘
```

### Step 4: Billing Page with Invoice

```
┌─────────────────────────────────────────┐
│           Manage Your Plan               │
│                                          │
│ CURRENT PLAN: Starter ($29/month)       │
│ ─────────────────────────────────────── │
│ Status: ACTIVE                          │
│ Period End: Feb 15, 2024                │
│ Drivers: 5/5                            │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │         INVOICES (NEW!)              │ │
│ │ ───────────────────────────────────  │ │
│ │ Date    │ Amount  │ Status │ PDF    │ │
│ │ ───────────────────────────────────  │ │
│ │ Jan 15  │ ₦29.00  │ PAID   │ ↓PDF   │ ← Invoice appears here!
│ │ ───────────────────────────────────  │ │
│ └─────────────────────────────────────┘ │
│                                          │
└─────────────────────────────────────────┘
```

---

## State Machine: Payment Verification Page

```
┌──────────────┐
│   LOADING    │  "Verifying your payment..."
└──────┬───────┘
       │
       ├─→ Backend verifies with Paystack
       │
       ├─→ Success?
       │
       ├─→ YES → ┌──────────────┐
       │        │   SUCCESS    │  ✅ "Payment verified successfully!"
       │        └──────┬───────┘
       │               │
       │               └─→ [Auto-redirect in 3s]
       │
       └─→ NO  → ┌──────────────┐
                 │   FAILED     │  ❌ "Payment verification failed"
                 └──────┬───────┘
                        │
                        └─→ [Show error message]

                 ┌──────────────┐
                 │   PENDING    │  ⏳ "Payment is pending"
                 └──────┬───────┘
                        │
                        └─→ [Wait or retry]
```

---

## Database State After Payment

### Before Payment

```
BillingRecord:
├─ id: uuid1
├─ company_id: company1
├─ plan_id: "free"
├─ status: "active"
├─ paystack_reference: null ← Empty
└─ current_period_end: 2099-01-01

Invoices:
└─ (empty)
```

### After Payment (New!)

```
BillingRecord:
├─ id: uuid1
├─ company_id: company1
├─ plan_id: "starter" ← Updated
├─ status: "active"
├─ paystack_reference: "1234567890" ← Now has reference (idempotency)
└─ current_period_end: 2024-02-15

Invoices:
└─ id: uuid2
   ├─ company_id: company1
   ├─ amount_cents: 2900
   ├─ status: "paid"
   ├─ paid_at: 2024-01-15T10:30:00Z
   └─ invoice_pdf_url: "..." ← Link to Paystack receipt
```

---

## URL Flow During Redirect

```
1. User on Paystack:
   https://checkout.paystack.com/...

2. After payment, Paystack redirects to:
   http://localhost:5173/dashboard/billing/verify?reference=1234567890
   └─ Reference is passed as query parameter

3. Frontend BillingVerify page:
   - Extracts reference from URL
   - Calls: POST /dashboard/billing/verify { reference: "1234567890" }

4. Backend verifies and responds:
   {
     success: true,
     status: "success",
     invoice: { ... }
   }

5. Frontend shows success and auto-redirects to:
   http://localhost:5173/dashboard/billing
   └─ Invoice now visible in table
```

---

## API Call Timeline

```
User clicks [UPGRADE PLAN]
    ↓
    └─→ POST /dashboard/billing/plan
        Backend creates transaction with Paystack
        Returns checkout_url
    ↓
User completes payment on Paystack
    ↓
Paystack redirects to callback_url with reference
    ↓
BillingVerify component loads
    ↓
    └─→ POST /dashboard/billing/verify
        └─→ Check if already processed (idempotency)
        └─→ Call Paystack API to verify
        └─→ Create/update BillingRecord
        └─→ Create Invoice
        └─→ Return invoice data
    ↓
Frontend shows success
    ↓
Auto-redirect to /dashboard/billing
    ↓
GET /dashboard/billing/invoices
    └─→ Invoice now appears in table
```

---

## Success Indicators

### ✅ You'll Know It's Working When:

1. **Payment completes** → Automatically redirected
2. **Success page shows** → "Payment verified successfully!" with checkmark
3. **Auto-redirect works** → Back to billing page in 3 seconds
4. **Invoice appears** → New row in invoices table
5. **Idempotency works** → Refreshing page = same invoice (no duplicates)

### ❌ What to Watch For:

1. **Stuck on Paystack** → Callback URL not configured correctly
2. **Blank page after payment** → /dashboard/billing/verify route not registered
3. **"Verifying..." hangs** → Backend not running or API call failed
4. **No invoice in table** → Database issue or query not working
5. **Duplicate invoices** → Idempotency not working

---

## Toast Notifications

### Success Toast

```
╔══════════════════════════════════════╗
║ ✓ Payment confirmed! Your plan is    ║
║   now active.                         ║
╚══════════════════════════════════════╝
```

### Error Toast

```
╔══════════════════════════════════════╗
║ ✗ Payment verification failed. Try   ║
║   again or contact support.          ║
╚══════════════════════════════════════╝
```

---

## Idempotency in Action

```
Scenario: User refreshes during verification

Refresh 1:
  POST /dashboard/billing/verify { reference: "ABC123" }
  ↓
  Backend checks: paystack_reference = "ABC123"?
  ↓
  Not found yet... verify with Paystack
  ↓
  Create Invoice
  ↓
  Store reference: "ABC123"
  ↓
  Response: { success: true, invoice: {...} }

Refresh 2 (5 seconds later):
  POST /dashboard/billing/verify { reference: "ABC123" }
  ↓
  Backend checks: paystack_reference = "ABC123"?
  ↓
  FOUND! Already processed
  ↓
  Return cached response
  ↓
  Response: { success: true, invoice: {...} } ← SAME INVOICE

Result: No duplicate invoice created! ✓
```

---

## Error Scenarios

### Declined Card

```
User enters declined card on Paystack
    ↓
Payment fails
    ↓
Paystack shows error to user
    ↓
User clicks "Go back to merchant"
    ↓
Returns to billing page (no redirect to verify)
```

### Network Failure During Verification

```
User completes payment
    ↓
Browser starts redirect to verify page
    ↓
Network fails
    ↓
Page stuck on loading
    ↓
User refreshes
    ↓
Verify endpoint called again
    ↓
Idempotency check: reference already exists
    ↓
Returns cached response
    ↓
Page shows success ✓
```

### Backend Down

```
User completes payment
    ↓
Redirected to /dashboard/billing/verify
    ↓
Frontend calls POST /dashboard/billing/verify
    ↓
Backend not responding
    ↓
Error catch block triggered
    ↓
Shows error toast
    ↓
User sees: "Error verifying payment"
    ↓
User can manually navigate back to billing page
```

---

## Quick Reference: What Changed

| Page                        | Before             | After                           |
| --------------------------- | ------------------ | ------------------------------- |
| `/dashboard/billing/verify` | ❌ Didn't exist    | ✅ Now exists with verification |
| Invoices display            | ❌ Always empty    | ✅ Shows after payment          |
| Duplicate charges           | ⚠️ Possible        | ✅ Protected by idempotency     |
| Payment feedback            | ❌ No confirmation | ✅ Success/error messages       |

---

**Ready to test this flow!** Follow PAYSTACK_INTEGRATION_GUIDE.md for step-by-step instructions.
