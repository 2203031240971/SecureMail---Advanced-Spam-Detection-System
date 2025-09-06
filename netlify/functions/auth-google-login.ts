import { Handler } from '@netlify/functions';
import crypto from 'crypto';

const handler: Handler = async (event, context) => {
  try {
    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    
    if (!googleClientId || !redirectUri) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Google OAuth configuration missing' })
      };
    }

    // Build Google OAuth authorization URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', googleClientId);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('state', state);
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'consent');

    // Store state in session/cookie for validation (in production, use secure session storage)
    const headers = {
      'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`,
      'Location': googleAuthUrl.toString()
    };

    return {
      statusCode: 302,
      headers,
      body: ''
    };

  } catch (error) {
    console.error('Google OAuth login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to initiate Google OAuth' })
    };
  }
};

export { handler };
