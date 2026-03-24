# Quick Reference: Localhost vs Production Configuration

## The Issue

You configured Paystack callback URLs to your hosted domain, but you're testing on localhost. This causes Paystack to redirect to the wrong URL after payment.

## Solution: Dynamic Callback URLs

Your `server/src/billing/paystack.service.ts` already uses `APP_URL` environment variable:

```typescript
callback_url: `${this.configService.get("APP_URL")}/dashboard/billing/verify?reference=`;
```

### Option 1: Use Environment-Specific `.env` Files (RECOMMENDED)

**For Local Development (`server/.env.local` or `server/.env`)**:

```env
APP_URL=http://localhost:3000
PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx
```

**For Production (Hosting/CI)**:

```env
APP_URL=https://yourdomain.com
PAYSTACK_PUBLIC_KEY=pk_live_xxx
PAYSTACK_SECRET_KEY=sk_live_xxx
```

NestJS ConfigService automatically loads from `.env` file.

### Option 2: Use ngrok for Public Localhost URL (For Testing)

If you want to use production Paystack keys with localhost:

```bash
# Install ngrok if you don't have it
brew install ngrok  # macOS
# or visit https://ngrok.com/download

# Start ngrok tunnel to your local dev server
ngrok http 3000

# You'll get a URL like: https://abcd1234-5678.ngrok.io
# Use this in server/.env:
APP_URL=https://abcd1234-5678.ngrok.io
```

Then update Paystack dashboard to use that ngrok URL.

### Option 3: Don't Use Paystack Dashboard URLs (Leave Blank)

The `callback_url` is set **programmatically** from `APP_URL`, so you don't need to set it in Paystack dashboard settings. Paystack uses the `callback_url` parameter from the API request.

## Testing on Localhost: Step-by-Step

### Prerequisites

1. Backend running: `cd server && npm run start:dev`
2. Frontend running: `cd web && npm run dev` (typically on http://localhost:5173)
3. Your server is on: `http://localhost:3000`

### Configuration

```bash
# File: server/.env
APP_URL=http://localhost:3000
PAYSTACK_PUBLIC_KEY=pk_test_xxx (your test key)
PAYSTACK_SECRET_KEY=sk_test_xxx (your test key)
```

### Test Flow

1. Go to http://localhost:5173/dashboard/billing
2. Click "Upgrade Plan"
3. Paystack loads with callback URL: `http://localhost:3000/dashboard/billing/verify?reference=XXXXX`
4. After payment, redirects to that URL
5. Your backend verifies and shows success page
6. Auto-redirects to billing page

### Why 402 Error on Payment Method?

The payment method endpoint might need the same `APP_URL` callback setup. Check:

```bash
# In server/src/billing/paystack.service.ts line 193:
callback_url: `${this.configService.get('APP_URL')}/dashboard/billing/payment-method-callback`,
```

Make sure this endpoint exists in your controller, or the 402 is because Paystack couldn't reach the callback URL.

## Webhook URL Configuration

Your **Paystack Dashboard** should have a separate Webhook URL for server-to-server events:

```
Dashboard → Settings → API Keys & Webhooks → Webhooks
```

Set it to:

```
https://yourdomain.com/billing/webhook  (for production)
http://localhost:3000/billing/webhook   (for local testing - requires ngrok or port forwarding)
```

For local testing without public URL, Paystack won't call your webhook. But that's okay - the `/dashboard/billing/verify` endpoint serves as a synchronous verification immediately after payment.

## Summary

| Scenario              | Configuration                                      |
| --------------------- | -------------------------------------------------- |
| Local development     | `APP_URL=http://localhost:3000`, use test keys     |
| Production            | `APP_URL=https://yourdomain.com`, use live keys    |
| Local + Live keys     | Use ngrok to expose localhost publicly             |
| Production + Webhooks | Ensure domain has HTTPS and is publicly accessible |

The key insight: **Don't set callback URLs in Paystack dashboard**. Instead, set them via `APP_URL` environment variable, which is injected at API request time.

---

**Testing Status**: Ready to test with your current setup
