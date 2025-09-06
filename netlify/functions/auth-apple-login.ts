import { Handler } from '@netlify/functions';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const handler: Handler = async (event, context) => {
  try {
    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    const appleClientId = process.env.APPLE_CLIENT_ID;
    const appleRedirectUri = process.env.APPLE_REDIRECT_URI;
    
    if (!appleClientId || !appleRedirectUri) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Apple OAuth configuration missing' })
      };
    }

    // Build Apple OAuth authorization URL
    const appleAuthUrl = new URL('https://appleid.apple.com/auth/authorize');
    appleAuthUrl.searchParams.set('client_id', appleClientId);
    appleAuthUrl.searchParams.set('redirect_uri', appleRedirectUri);
    appleAuthUrl.searchParams.set('response_type', 'code');
    appleAuthUrl.searchParams.set('scope', 'name email');
    appleAuthUrl.searchParams.set('response_mode', 'form_post');
    appleAuthUrl.searchParams.set('state', state);

    // Store state in session/cookie for validation
    const headers = {
      'Set-Cookie': `apple_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`,
      'Location': appleAuthUrl.toString()
    };

    return {
      statusCode: 302,
      headers,
      body: ''
    };

  } catch (error) {
    console.error('Apple OAuth login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to initiate Apple OAuth' })
    };
  }
};

export { handler };
