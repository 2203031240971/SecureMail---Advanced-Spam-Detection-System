# OAuth Testing with Dummy Credentials

This guide explains how to test OAuth functionality using the provided dummy credentials.

## 🚨 **Important Notice**

The dummy credentials provided are for **DEVELOPMENT AND TESTING PURPOSES ONLY**. They will not work with real OAuth providers. For production use, you must:

1. Set up actual Google OAuth in Google Cloud Console
2. Configure real Apple Sign In in Apple Developer Portal
3. Replace dummy credentials with real ones

## 📋 **Dummy Credentials Provided**

### Google OAuth (Dummy)
```env
GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-dummy_google_client_secret_for_testing
GOOGLE_REDIRECT_URI=https://ec01723ec5cc466db18c243fa9de6c13-230736f8c86640659cb447d44.fly.dev/auth/google/callback
```

### Apple OAuth (Dummy)
```env
APPLE_TEAM_ID=ABC1234567
APPLE_CLIENT_ID=com.securemail.services.dummy
APPLE_KEY_ID=DEF8901234
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
[Dummy private key content - not a real key]
-----END PRIVATE KEY-----"
APPLE_REDIRECT_URI=https://ec01723ec5cc466db18c243fa9de6c13-230736f8c86640659cb447d44.fly.dev/auth/apple/callback
```

## 🧪 **Testing OAuth Flow**

### Expected Behavior with Dummy Credentials

1. **Login Page**: OAuth buttons will be visible and clickable
2. **Click Google/Apple**: Will redirect to OAuth function
3. **Function Execution**: Will attempt to contact OAuth provider
4. **Expected Result**: Will fail with authentication error (this is expected)
5. **Error Handling**: User will see error message and be redirected back to login

### Testing the Implementation

```bash
# 1. Start development server
npm run dev

# 2. Navigate to login page
# http://localhost:3000/login

# 3. Click "Google" or "Apple" button
# Expected: Redirect to OAuth function endpoint

# 4. Check browser network tab
# Expected: See request to /.netlify/functions/auth-google-login

# 5. Check function logs
# Expected: See OAuth function execution (will fail at provider step)
```

### Mock Testing with Real-like Responses

For actual testing without real OAuth setup, you can:

1. **Mock the OAuth responses** in the functions
2. **Simulate successful authentication** with test user data
3. **Test the session management** and redirect flow

Example mock user for testing:
```javascript
const mockUser = {
  id: 'test-user-123',
  email: 'test@securemail.dev',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  provider: 'google'
};
```

## 🔧 **Setting Up Real OAuth for Production**

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API and OAuth2 API
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URIs
6. Copy Client ID and Secret to environment variables

### Apple OAuth Setup
1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Create App ID with "Sign In with Apple" capability
3. Create Services ID for web authentication
4. Generate private key (.p8 file)
5. Configure domains and redirect URLs
6. Add credentials to environment variables

## 🚀 **Environment Variable Setup**

### Development (.env.development)
```bash
# Copy the provided dummy credentials
cp .env.development .env
```

### Production (Netlify Dashboard)
```bash
# Set real OAuth credentials in Netlify environment variables:
# Site Settings > Environment Variables
```

## ⚠️ **Security Notes**

1. **Never commit real OAuth credentials** to version control
2. **Use dummy credentials only for development**
3. **Validate all OAuth flows** with real credentials before production
4. **Monitor OAuth logs** for security issues
5. **Implement proper error handling** for OAuth failures

## 📝 **Testing Checklist**

- [ ] OAuth buttons render correctly
- [ ] Clicking buttons redirects to function endpoints
- [ ] Function endpoints execute without syntax errors
- [ ] Error handling works for OAuth failures
- [ ] Session management works correctly
- [ ] Redirect flows work as expected
- [ ] Security headers are properly set
- [ ] State validation prevents CSRF attacks

## 🐛 **Common Issues and Solutions**

### Issue: "Function not found"
**Solution**: Check netlify.toml redirect configuration

### Issue: "Invalid redirect URI"
**Solution**: Ensure redirect URIs match exactly in OAuth app configuration

### Issue: "Missing environment variables"
**Solution**: Verify all required env vars are set

### Issue: "JWT errors" (Apple)
**Solution**: Check private key format and signing algorithm

Remember: Dummy credentials are for testing the implementation flow only. Real OAuth setup is required for actual authentication!
