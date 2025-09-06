# Google & Apple OAuth Setup Guide

This guide provides complete setup instructions for integrating Google OAuth and Apple Sign In with your SecureMail Node.js web application.

## Google OAuth Setup

### 1. Create OAuth Client ID in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application" as application type
6. Set authorized redirect URIs:
   ```
   http://localhost:3000/auth/google/callback
   https://yourdomain.netlify.app/auth/google/callback
   https://your-custom-domain.com/auth/google/callback
   ```

### 2. Environment Variables for Google OAuth

Add these to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.netlify.app/auth/google/callback
```

### 3. Google OAuth Implementation

The implementation uses the authorization code flow:

1. **Generate Authorization URL**: Redirect user to Google's OAuth consent screen
2. **Handle Callback**: Exchange authorization code for access token
3. **Get User Info**: Fetch user profile data from Google APIs

---

## Apple Sign In Setup

### 1. Apple Developer Portal Configuration

#### Step 1: Create App ID
1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Create new App ID with "Sign In with Apple" capability enabled
4. Note your Team ID (found in top-right corner)

#### Step 2: Create Services ID
1. Create a new Services ID (this will be your client_id)
2. Enable "Sign In with Apple" for this Services ID
3. Configure domains and redirect URLs:
   ```
   Primary App Domain: yourdomain.netlify.app
   Redirect URLs: https://yourdomain.netlify.app/auth/apple/callback
   ```

#### Step 3: Create Private Key
1. Go to "Keys" section in Apple Developer Portal
2. Create new key with "Sign In with Apple" capability
3. Download the .p8 file (keep it secure!)
4. Note the Key ID

### 2. Environment Variables for Apple OAuth

Add these to your `.env` file:

```env
# Apple OAuth
APPLE_TEAM_ID=your_team_id
APPLE_CLIENT_ID=your_services_id
APPLE_KEY_ID=your_key_id
APPLE_PRIVATE_KEY_PATH=./apple_private_key.p8
APPLE_REDIRECT_URI=https://yourdomain.netlify.app/auth/apple/callback
```

### 3. Apple OAuth Implementation

Apple Sign In uses JWT-based authentication:

1. **Generate Client Secret**: Create JWT signed with your private key
2. **Generate Authorization URL**: Redirect user to Apple's OAuth consent screen
3. **Handle Callback**: Exchange authorization code for identity token
4. **Verify Token**: Validate the identity token and extract user info

---

## Security Best Practices

### 1. Environment Variables
- Never commit OAuth credentials to version control
- Use different credentials for development and production
- Store sensitive keys securely (consider using secrets management)

### 2. HTTPS Requirements
- Apple requires HTTPS for all redirect URIs in production
- Google recommends HTTPS for security
- Netlify provides HTTPS by default

### 3. State Parameter
- Always use the `state` parameter to prevent CSRF attacks
- Generate random state values for each request
- Validate state parameter in callback

### 4. Token Security
- Store OAuth tokens securely (encrypted if possible)
- Implement token refresh logic for long-lived sessions
- Use short-lived tokens when possible

---

## Netlify Deployment Configuration

### 1. Environment Variables in Netlify
Set these in your Netlify dashboard under "Site settings" → "Environment variables":

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
APPLE_TEAM_ID=your_team_id
APPLE_CLIENT_ID=your_services_id
APPLE_KEY_ID=your_key_id
APPLE_PRIVATE_KEY=your_private_key_content
```

### 2. Netlify Functions for OAuth
OAuth endpoints are implemented as Netlify Functions for serverless deployment:

- `/.netlify/functions/auth-google-login` - Initiate Google OAuth
- `/.netlify/functions/auth-google-callback` - Handle Google callback
- `/.netlify/functions/auth-apple-login` - Initiate Apple OAuth  
- `/.netlify/functions/auth-apple-callback` - Handle Apple callback

### 3. Redirect Configuration
Update your `netlify.toml`:

```toml
[[redirects]]
  from = "/auth/google/*"
  to = "/.netlify/functions/auth-google-:splat"
  status = 200

[[redirects]]
  from = "/auth/apple/*"
  to = "/.netlify/functions/auth-apple-:splat"
  status = 200
```

---

## Testing OAuth Integration

### 1. Development Testing
- Test with localhost URLs during development
- Use ngrok for HTTPS testing locally if needed
- Verify redirect URIs match exactly

### 2. Production Testing
- Test with actual domain after deployment
- Verify all environment variables are set correctly
- Check that OAuth apps are configured for production URLs

### 3. Error Handling
- Implement proper error handling for OAuth failures
- Log OAuth errors for debugging (without exposing sensitive data)
- Provide user-friendly error messages

---

## Common Issues and Solutions

### Google OAuth Issues
- **Invalid redirect URI**: Ensure exact match in Google Console
- **Invalid client**: Check client ID and secret are correct
- **Scope issues**: Verify requested scopes are approved

### Apple OAuth Issues  
- **Invalid client**: Verify Services ID and Team ID
- **JWT errors**: Check private key format and signing algorithm
- **Domain verification**: Ensure domain is verified in Apple Developer Portal

### General Issues
- **CORS errors**: Configure proper CORS headers for OAuth endpoints
- **State mismatch**: Ensure state parameter is properly generated and validated
- **Token expiration**: Implement proper token refresh logic
