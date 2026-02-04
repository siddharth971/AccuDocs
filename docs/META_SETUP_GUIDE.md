# 📱 WhatsApp (Meta Cloud API) Setup Guide

This guide will walk you through setting up WhatsApp messaging for AccuDocs using the official **Meta (Facebook) Cloud API**.

> **Why Meta Cloud API?**
>
> - Official WhatsApp API
> - First 1,000 conversations per month are **FREE**
> - No middleman (Twilio) fees
> - Reliable and enterprise-grade

---

## 📋 Prerequisites

Before you begin, ensure you have:

- [ ] A [Meta for Developers](https://developers.facebook.com/) account
- [ ] A Facebook Business Account (you can create one during setup)
- [ ] Node.js and npm installed
- [ ] ngrok (for local testing)

---

## 🚀 Step-by-Step Setup

### Step 1: Create a Meta App

1. Go to [developers.facebook.com](https://developers.facebook.com/).
2. Click **My Apps** → **Create App**.
3. Select **Other** → **Next**.
4. Select **Business** → **Next**.
5. App Name: `AccuDocs` (or similar).
6. Click **Create App**.

### Step 2: Add WhatsApp Product

1. On the App Dashboard, scroll down to find **WhatsApp**.
2. Click **Set up**.
3. Select your Business Account (or create a new one).
4. You will be redirected to the **Getting Started** page.

### Step 3: Get Your Credentials

On the **WhatsApp > API Setup** page, copy the following:

1. **Temporary Access Token**: (Starts with `EA...`)
   _Note: For production, you will need to set up a System User to get a permanent token._
2. **Phone Number ID**: (e.g., `1099166...`)
3. **WhatsApp Business Account ID**: (e.g., `103399...`)

### Step 4: Configure Your Environment

Open `d:\AccuDocs\backend\.env` and update the configuration:

```env
# ===========================================
# META (WHATSAPP) CONFIGURATION
# ===========================================

# From Step 3
META_PHONE_NUMBER_ID=1234567890
META_BUSINESS_ACCOUNT_ID=9876543210
META_ACCESS_TOKEN=EAAB...

# Create your own secure token for webhook verification
META_WEBHOOK_VERIFY_TOKEN=my-secure-webhook-token-12345

# API Version (usually v18.0 or v19.0)
META_API_VERSION=v19.0
```

### Step 5: Configure Webhook (For Incoming Messages)

1. On the Meta App Dashboard, go to **WhatsApp > Configuration**.
2. Find the **Webhook** section and click **Edit**.
3. **Callback URL**:
   - If testing locally: `https://your-ngrok-url.ngrok.io/api/whatsapp/webhook`
   - If production: `https://api.yourdomain.com/api/whatsapp/webhook`
4. **Verify Token**: Enter the `META_WEBHOOK_VERIFY_TOKEN` you set in `.env`.
5. Click **Verify and Save**.
6. **Important**: Under **Webhook fields**, click **Manage**.
   - Subscribe to: `messages`
   - (Optional) `message_template_status_update`

### Step 6: Add Test Number (For Development)

While in Development mode, you can only send messages to verified numbers.

1. Go to **API Setup** page.
2. Scroll to **"To"** field.
3. Click **Manage phone number list**.
4. Add your personal WhatsApp number and verify it with the OTP sent to your phone.

---

## 🧪 Testing

### 1. Send "Hi" from your phone

Send "Hi" to the **Test Number** provided by Meta (usually starts with +1 555...).

### 2. Check Backend Logs

You should see:

```log
[INFO] WhatsApp message sent to ... via Meta Cloud API
```

---

## 📦 Production Deployment

To go live:

1. **Permanent Token**: Go to Business Settings → Users → System Users. Add a user with `whatsapp_business_management` and `whatsapp_business_messaging` permissions. Generate a token.
2. **Add Real Phone Number**: In WhatsApp Manager, add your real business phone number.
3. **Request OBA** (Optional): Request Official Business Account (Green Tick).

---

## ❓ Troubleshooting

- **Error: (#100) The parameter messaging_product is required.**
  - Ensure your Payload structure matches standard. (Backend handles this).

- **Webhook Verification Failed**
  - Ensure the Verify Token matches exactly.
  - Ensure the URL is publicly accessible (ngrok running?).

- **Message Not Delivered**
  - In Dev Mode? Did you verify the recipient number?
  - Check if the 24-hour conversation window is active. Setup Templates for starting conversations outside the window.

---
