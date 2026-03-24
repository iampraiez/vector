# Remaining Issues & Investigation Guide

## Issue 1: Payment Method Setup (402 Error)

### Problem

When clicking the "Setup Payment Method" button in the billing modal, you get a 402 (Payment Required) error.

### Root Cause Analysis

The 402 error typically means:

1. Paystack API call failed
2. Missing or invalid API keys
3. Incorrect endpoint configuration
4. Authorization initialization needs customer creation first

### Investigation Steps

#### Step 1: Check the Endpoint

```bash
# Find the payment method endpoint
grep -rn "payment-method" server/src/dashboard/
grep -rn "payment-method" server/src/billing/
```

#### Step 2: Check Paystack Service

The `initializeAuthorization` method in `paystack.service.ts` might need adjustment:

```typescript
// Current implementation (around line 177)
async initializeAuthorization(
  email: string,
  plan_name: string,
  company_id: string,
): Promise<{...}>
```

**Check these**:

- Is the authorization_url being returned correctly?
- Are the API keys valid for your Paystack account?
- Is the callback URL properly set?

#### Step 3: Compare with Working Endpoint

The `changePlan` endpoint works fine. Compare:

```bash
# Working endpoint
grep -A 20 "changePlan" server/src/dashboard/dashboard.service.ts

# Compare with payment-method endpoint structure
```

### Solution Approach

1. **Verify Paystack Keys in .env**

```bash
# Check if keys are present
grep PAYSTACK server/.env

# Test keys should start with pk_test_ and sk_test_
```

2. **Add Logging to Identify Failure Point**

```typescript
// In initializeAuthorization method
console.log('Initializing authorization for:', { email, plan_name, company_id });
const response = await axios.post(...)
console.log('Paystack response:', response.data);
```

3. **Check if Customer Creation is Needed First**

```typescript
// Authorization might require:
// 1. Create/find customer via createCustomer()
// 2. Then authorize payment method

// Possible flow:
const customer = await this.createCustomer(email);
const authorization = await this.authorizePaymentMethod(customer.customer_code);
```

4. **Verify Callback Configuration**

```typescript
// Check line ~193 in paystack.service.ts
callback_url: `${this.configService.get("APP_URL")}/dashboard/billing/payment-method-callback`;

// Ensure this endpoint exists in dashboard controller
// If not, create it or remove the callback requirement
```

### Temporary Workaround

If the payment method setup is not critical for your immediate needs:

1. Hide the "Setup Payment Method" button for now
2. Users can use "Change Plan" instead (which works)
3. Fix this in a follow-up task

### Files to Check

- `server/src/dashboard/dashboard.controller.ts` - Look for payment-method endpoint
- `server/src/dashboard/dashboard.service.ts` - Check changePlan vs payment-method logic
- `server/src/billing/paystack.service.ts` - Check initializeAuthorization method
- `server/.env` - Verify Paystack keys are present

---

## Issue 2: Skeleton Loader Consistency in Reports Page

### Problem

The Reports page skeleton loaders don't match the visual pattern of other dashboard pages (like Overview).

### Current Behavior

The Reports page shows simple rectangular skeleton blocks:

```tsx
<div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
```

### Expected Behavior

Should match the detailed skeleton pattern used in Overview page:

- Structured skeleton cards
- Multiple lines per skeleton
- More closely matches actual content shape

### Solution

#### Step 1: Check Overview.tsx Pattern

```bash
# Find skeleton implementation in Overview
grep -A 10 "skeleton" web/src/features/dashboard/pages/Overview.tsx
```

#### Step 2: Identify the Skeleton Pattern

Look for patterns like:

```tsx
// Overview might use:
<div className="space-y-3">
  <div className="h-4 bg-gray-200 rounded w-3/4" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
  <div className="h-4 bg-gray-200 rounded w-5/6" />
</div>
```

#### Step 3: Update Reports.tsx

Find the skeleton rendering section in Reports and replace with structured skeleton:

```typescript
// Location: web/src/features/dashboard/pages/Reports.tsx
// Look for sections where data is loading

if (isLoading) {
  return (
    <div className="grid gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg p-6 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-2/3" />
          <div className="space-y-2 mt-4">
            <div className="h-4 bg-gray-100 rounded" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Visual Consistency Checklist

- [ ] Skeleton cards have same height as real cards
- [ ] Skeleton lines match text line heights
- [ ] Spacing matches actual content
- [ ] Uses same animation (pulse) as other pages
- [ ] Color matches other skeleton loaders (gray-200)

### Files Involved

- `web/src/features/dashboard/pages/Reports.tsx` - Main file to update
- `web/src/features/dashboard/pages/Overview.tsx` - Reference pattern
- `web/src/components/ui/skeleton.tsx` - If custom skeleton component exists

### Priority

**Low** - This is a UX polish issue, not functionality
Can be done after payment flow is fully tested

---

## Summary of Remaining Work

| Issue                        | Priority | Status              | Effort    |
| ---------------------------- | -------- | ------------------- | --------- |
| Payment method endpoint      | HIGH     | Needs investigation | 2-4 hours |
| Skeleton loader consistency  | LOW      | Documented solution | 1-2 hours |
| Idempotency                  | COMPLETE | ✅ DONE             | N/A       |
| Invoice display              | COMPLETE | ✅ DONE             | N/A       |
| Localhost vs production URLs | COMPLETE | ✅ Documented       | N/A       |

---

## Action Items

### Immediate (Do First)

1. [ ] Test the complete payment flow with payment verification endpoint
2. [ ] Verify invoices appear after successful payment
3. [ ] Document any new issues discovered during testing

### Short-term (This Week)

4. [ ] Investigate payment method endpoint 402 error
5. [ ] Fix payment method setup or document workaround
6. [ ] Test error scenarios

### Medium-term (Polish)

7. [ ] Update skeleton loaders in Reports page
8. [ ] Review webhook configuration for production
9. [ ] Create payment failure notification emails

### Long-term (Enhancement)

10. [ ] Implement recurring billing with payment methods
11. [ ] Add payment retry logic
12. [ ] Create admin payment dashboard

---

## Getting Help

### Paystack-Specific Issues

- Check Paystack dashboard for failed API calls
- Verify transaction in Paystack dashboard
- Check webhook logs in Paystack settings
- Paystack support: https://paystack.com/support

### Application-Specific Issues

- Check server logs: `npm run start:dev` output
- Check browser console for frontend errors
- Check database: Query billing_records and invoices tables
- Add console.log statements to trace flow

---

**Next Step**: Start with testing the payment verification flow you just implemented! 🎉
