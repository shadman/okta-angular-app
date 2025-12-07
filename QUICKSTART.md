# Quick Start Guide

Get your Okta Angular app running in 5 minutes!

## Step 1: Get Okta Credentials (2 minutes)

1. Go to [developer.okta.com](https://developer.okta.com/) and sign up (free)
2. Create a new **Single-Page Application**
3. Set redirect URI to: `http://localhost:4200/login/callback`
4. Copy your **Client ID** and **Okta Domain**

## Step 2: Configure App (1 minute)

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  okta: {
    clientId: 'YOUR_CLIENT_ID',  // Paste here
    issuer: 'https://YOUR_DOMAIN.okta.com/oauth2/default',  // Paste your domain
    redirectUri: 'http://localhost:4200/login/callback',
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
    testing: {
      disableHttpsCheck: false
    }
  }
};
```

## Step 3: Run App (2 minutes)

```powershell
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" start
```

Visit: `http://localhost:4200`

## That's It!

You now have:
- ✅ Login page at `/login`
- ✅ Sign-up page at `/signup`
- ✅ Protected dashboard at `/dashboard`
- ✅ Theme toggle (light/dark)
- ✅ User profile display
- ✅ Animated UI components

## Test Credentials

Use your Okta account credentials to login, or create a new account via the signup page.

## Need Help?

See `README_OKTA_SETUP.md` for detailed documentation.
