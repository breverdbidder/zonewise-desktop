# 🔐 Credential Rotation Checklist

## ZoneWise.AI Security Remediation

**Date:** February 1, 2026  
**Priority:** 🚨 CRITICAL  
**Reason:** Credentials were previously exposed in source code and must be rotated immediately

---

## Pre-Rotation Checklist

- [ ] Notify team members of planned credential rotation
- [ ] Ensure you have admin access to all required platforms
- [ ] Schedule during low-traffic period if possible
- [ ] Have this checklist open in a separate tab

---

## Step 1: Rotate Supabase Credentials

### 1.1 Access Supabase Dashboard

🔗 **Direct Link:** [Supabase Project Settings → API](https://supabase.com/dashboard/project/mocerqjnksmhcjzxrewo/settings/api)

If link doesn't work:
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select project: `mocerqjnksmhcjzxrewo`
3. Click **Settings** (gear icon) → **API**

### 1.2 Regenerate Anon Key

- [ ] Locate **"anon public"** key section
- [ ] Click **"Regenerate"** button
- [ ] Confirm regeneration in popup
- [ ] **COPY THE NEW KEY** immediately
- [ ] Save to secure password manager

**New Anon Key:** `_________________________________` *(paste here temporarily, delete after updating)*

### 1.3 Regenerate Service Role Key

- [ ] Locate **"service_role secret"** key section
- [ ] Click **"Regenerate"** button  
- [ ] Confirm regeneration in popup
- [ ] **COPY THE NEW KEY** immediately
- [ ] Save to secure password manager

**New Service Role Key:** `_________________________________` *(paste here temporarily, delete after updating)*

### 1.4 Note the Project URL (unchanged)

**Project URL:** `https://mocerqjnksmhcjzxrewo.supabase.co`

---

## Step 2: Update Render.com (zonewise-v2)

### 2.1 Access Render Dashboard

🔗 **Direct Link:** [Render Dashboard](https://dashboard.render.com/)

### 2.2 Navigate to Environment Variables

1. Select your **zonewise-v2** web service
2. Click **Environment** tab
3. Or direct: [Render Environment Settings](https://dashboard.render.com/web/srv-xxxxx/env) *(replace with your service ID)*

### 2.3 Update Variables

- [ ] Find `SUPABASE_ANON_KEY` → Click Edit → Paste new key → Save
- [ ] Find `SUPABASE_SERVICE_KEY` → Click Edit → Paste new key → Save
- [ ] Verify `SUPABASE_URL` is set to `https://mocerqjnksmhcjzxrewo.supabase.co`

### 2.4 Trigger Redeploy

- [ ] Click **"Manual Deploy"** → **"Deploy latest commit"**
- [ ] Wait for deployment to complete (check logs)

---

## Step 3: Update Local Development

### 3.1 Update .env File

```bash
# Navigate to project
cd ~/zonewise-v2

# Edit .env file
nano .env
```

### 3.2 Update These Values

```env
SUPABASE_URL=https://mocerqjnksmhcjzxrewo.supabase.co
SUPABASE_ANON_KEY=<paste-new-anon-key>
SUPABASE_SERVICE_KEY=<paste-new-service-role-key>
```

- [ ] Save file (Ctrl+O, Enter, Ctrl+X in nano)
- [ ] Restart development server

---

## Step 4: Update GitHub Secrets (for CI/CD)

### 4.1 Access Repository Secrets

🔗 **Direct Link:** [zonewise-v2 Secrets](https://github.com/breverdbidder/zonewise-v2/settings/secrets/actions)

If link doesn't work:
1. Go to [github.com/breverdbidder/zonewise-v2](https://github.com/breverdbidder/zonewise-v2)
2. Click **Settings** → **Secrets and variables** → **Actions**

### 4.2 Update Secrets

- [ ] Click `SUPABASE_ANON_KEY` → **Update secret** → Paste new key → Save
- [ ] Click `SUPABASE_SERVICE_KEY` → **Update secret** → Paste new key → Save

If secrets don't exist, click **"New repository secret"** to create them.

---

## Step 5: Rotate Stripe Keys (Recommended)

### 5.1 Access Stripe Dashboard

🔗 **Direct Link:** [Stripe API Keys](https://dashboard.stripe.com/apikeys)

### 5.2 Roll Secret Key

- [ ] Click **"Roll key..."** next to Secret key
- [ ] Set expiration (recommend 24 hours for transition)
- [ ] Copy new key immediately
- [ ] Update in Render.com: `STRIPE_SECRET_KEY`
- [ ] Update in GitHub Secrets
- [ ] Update local .env

### 5.3 Update Webhook Secret

🔗 **Direct Link:** [Stripe Webhooks](https://dashboard.stripe.com/webhooks)

- [ ] Select your webhook endpoint
- [ ] Click **"Reveal"** under Signing secret
- [ ] If compromised, delete and recreate webhook
- [ ] Update `STRIPE_WEBHOOK_SECRET` everywhere

---

## Step 6: Rotate Mapbox Token (Recommended)

### 6.1 Access Mapbox Dashboard

🔗 **Direct Link:** [Mapbox Access Tokens](https://account.mapbox.com/access-tokens/)

### 6.2 Rotate Token

- [ ] Find token: `pk.eyJ1IjoiZXZlcmVzdDE4...`
- [ ] Click **"Rotate"** or create new token
- [ ] Update `VITE_MAPBOX_TOKEN` in:
  - [ ] Render.com environment
  - [ ] Local .env file
  - [ ] GitHub Secrets

---

## Step 7: Verification

### 7.1 Test Production (Render.com)

🔗 **Your App:** [https://zonewise-v2.onrender.com](https://zonewise-v2.onrender.com) *(update with actual URL)*

- [ ] App loads without errors
- [ ] Can log in / authenticate
- [ ] Database queries work (check zoning data)
- [ ] Stripe checkout works (test mode)
- [ ] Map displays correctly

### 7.2 Test Supabase Connection

🔗 **Supabase SQL Editor:** [Run Test Query](https://supabase.com/dashboard/project/mocerqjnksmhcjzxrewo/sql/new)

```sql
SELECT COUNT(*) FROM jurisdictions;
```

- [ ] Query executes successfully

### 7.3 Check Render Logs

🔗 **Render Logs:** [View Logs](https://dashboard.render.com/) → Select service → Logs

- [ ] No authentication errors
- [ ] No "invalid key" errors
- [ ] App starts successfully

---

## Step 8: Cleanup

### 8.1 Secure Deletion

- [ ] Delete any temporary notes with credentials
- [ ] Clear clipboard
- [ ] Close any browser tabs showing keys
- [ ] Remove credentials from this checklist if saved locally

### 8.2 Documentation

- [ ] Update password manager with new credentials
- [ ] Note rotation date for future reference
- [ ] Schedule next rotation (recommend: 90 days)

### 8.3 Git History Note

The old credentials may still exist in Git history. Options:
- **Option A:** Leave as-is (keys are now invalid after rotation)
- **Option B:** Use `git filter-branch` or BFG Repo-Cleaner to remove *(complex, may break forks)*

Recommendation: **Option A** - Since keys are rotated, old commits are harmless.

---

## Quick Links Summary

| Service | Dashboard | Direct Settings |
|---------|-----------|-----------------|
| **Supabase** | [Dashboard](https://supabase.com/dashboard) | [API Settings](https://supabase.com/dashboard/project/mocerqjnksmhcjzxrewo/settings/api) |
| **Render** | [Dashboard](https://dashboard.render.com/) | Environment tab in your service |
| **GitHub** | [Repository](https://github.com/breverdbidder/zonewise-v2) | [Secrets](https://github.com/breverdbidder/zonewise-v2/settings/secrets/actions) |
| **Stripe** | [Dashboard](https://dashboard.stripe.com/) | [API Keys](https://dashboard.stripe.com/apikeys) |
| **Mapbox** | [Account](https://account.mapbox.com/) | [Tokens](https://account.mapbox.com/access-tokens/) |

---

## Emergency Contacts

If you encounter issues during rotation:

- **Supabase Support:** [supabase.com/support](https://supabase.com/support)
- **Render Support:** [render.com/support](https://render.com/support)
- **Stripe Support:** [support.stripe.com](https://support.stripe.com)

---

## Completion Sign-Off

| Step | Completed | Date | Initials |
|------|-----------|------|----------|
| Supabase Rotation | ☐ | | |
| Render.com Update | ☐ | | |
| Local .env Update | ☐ | | |
| GitHub Secrets Update | ☐ | | |
| Stripe Rotation | ☐ | | |
| Mapbox Rotation | ☐ | | |
| Verification Tests | ☐ | | |
| Cleanup | ☐ | | |

**Rotation Completed By:** _______________________  
**Date:** _______________________  
**Next Scheduled Rotation:** _______________________

---

*This checklist should be reviewed by your security team and attorney for compliance requirements.*
