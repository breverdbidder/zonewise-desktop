# Stripe Webhook Setup Guide

This guide explains how to configure Stripe webhooks to enable automatic subscription management for ZoneWise.

---

## Overview

Stripe webhooks notify your application when subscription events occur (payments, cancellations, upgrades). The webhook handler is already implemented at `/api/webhooks/stripe` and handles all subscription lifecycle events.

---

## Setup Steps

### 1. Get Your Webhook Endpoint URL

Your webhook endpoint URL depends on your deployment environment:

**Development (Manus):**
```
https://3000-izfvxymbi6v2fl4uuztku-6a67aa9d.us2.manus.computer/api/webhooks/stripe
```

**Production (after deployment):**
```
https://zonewise.ai/api/webhooks/stripe
```

### 2. Configure Webhook in Stripe Dashboard

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers → Webhooks**
3. Click **Add endpoint**
4. Enter your webhook URL (from step 1)
5. Click **Select events** and choose these events:

   **Required Events:**
   - `checkout.session.completed` - When checkout succeeds
   - `customer.subscription.created` - When subscription is created
   - `customer.subscription.updated` - When subscription changes (upgrades, renewals)
   - `customer.subscription.deleted` - When subscription is canceled
   - `invoice.payment_succeeded` - When payment succeeds
   - `invoice.payment_failed` - When payment fails

6. Click **Add endpoint**

### 3. Get Webhook Signing Secret

After creating the endpoint:

1. Click on the newly created webhook endpoint
2. Click **Reveal** next to "Signing secret"
3. Copy the secret (starts with `whsec_...`)

### 4. Add Webhook Secret to Environment

**For Manus Development:**
1. Go to Management UI → Settings → Secrets
2. Add new secret:
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...` (your signing secret)

**For Production Deployment:**
Add to your `.env` file:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

### 5. Verify Webhook Configuration

After setup, test the webhook:

1. In Stripe Dashboard, go to your webhook endpoint
2. Click **Send test webhook**
3. Select `checkout.session.completed`
4. Click **Send test webhook**
5. Check the webhook logs to verify it was received successfully

---

## Testing with Stripe CLI (Development)

For local development, use Stripe CLI to forward webhook events:

### Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

### Login to Stripe

```bash
stripe login
```

### Forward Webhooks to Local Server

```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

This will output a webhook signing secret (starts with `whsec_`). Use this as your `STRIPE_WEBHOOK_SECRET` for local testing.

### Trigger Test Events

In another terminal:

```bash
# Test successful checkout
stripe trigger checkout.session.completed

# Test subscription update
stripe trigger customer.subscription.updated

# Test payment failure
stripe trigger invoice.payment_failed
```

---

## Webhook Event Handling

The webhook handler (`/server/webhooks/stripe.ts`) processes these events:

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Creates subscription in database, activates user account |
| `customer.subscription.created` | Records new subscription |
| `customer.subscription.updated` | Updates subscription tier, status, renewal date |
| `customer.subscription.deleted` | Marks subscription as canceled |
| `invoice.payment_succeeded` | Confirms payment, extends subscription period |
| `invoice.payment_failed` | Marks subscription as past_due, triggers notification |

---

## Verifying Webhook Signature

The webhook handler automatically verifies Stripe's signature to prevent unauthorized requests:

```typescript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
```

**Never skip signature verification in production!**

---

## Monitoring Webhooks

### Stripe Dashboard

1. Go to **Developers → Webhooks**
2. Click on your endpoint
3. View **Recent events** tab to see:
   - Event type
   - Status (succeeded/failed)
   - Response time
   - Error messages (if any)

### Application Logs

Check your server logs for webhook processing:

```bash
# Manus: Check .manus-logs/devserver.log
tail -f .manus-logs/devserver.log | grep "Stripe Webhook"

# Production: Check your hosting provider's logs
```

---

## Troubleshooting

### Webhook Returns 400 Error

**Cause:** Signature verification failed

**Solution:**
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Ensure you're using the secret from the correct Stripe environment (test vs live)
- Check that the webhook URL matches exactly

### Webhook Returns 500 Error

**Cause:** Server error processing webhook

**Solution:**
- Check server logs for error details
- Verify database connection is working
- Ensure all required environment variables are set

### Events Not Triggering

**Cause:** Webhook not configured for the event type

**Solution:**
- Go to Stripe Dashboard → Webhooks
- Edit your endpoint
- Ensure all required events are selected

### Subscription Not Updating in Database

**Cause:** Missing `userId` in subscription metadata

**Solution:**
- When creating checkout sessions, always include:
  ```typescript
  metadata: {
    userId: user.id.toString(),
    tier: 'pro' // or 'team'
  }
  ```

---

## Security Best Practices

1. **Always verify webhook signatures** - Already implemented in the handler
2. **Use HTTPS in production** - Required by Stripe
3. **Keep webhook secret secure** - Never commit to version control
4. **Monitor webhook logs** - Set up alerts for failed webhooks
5. **Handle idempotency** - Stripe may send duplicate events; use event IDs to deduplicate

---

## Production Checklist

Before going live:

- [ ] Webhook endpoint configured in Stripe Dashboard (live mode)
- [ ] `STRIPE_WEBHOOK_SECRET` set in production environment
- [ ] All 6 required events selected
- [ ] Test webhook with Stripe Dashboard "Send test webhook"
- [ ] Verify subscription creation flow end-to-end
- [ ] Test subscription cancellation
- [ ] Test payment failure handling
- [ ] Set up monitoring/alerts for webhook failures

---

## Support

If you encounter issues:

1. Check [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
2. Review [Stripe API Logs](https://dashboard.stripe.com/logs)
3. Contact Stripe Support via Dashboard

---

**Last Updated:** February 1, 2026
