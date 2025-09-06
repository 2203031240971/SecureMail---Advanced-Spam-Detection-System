import { Handler } from '@netlify/functions';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface AppleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  id_token: string;
}

interface AppleIdTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  email?: string;
  email_verified?: boolean;
  auth_time: number;
}

// Generate Apple client secret JWT
function generateAppleClientSecret(): string {
  const appleTeamId = process.env.APPLE_TEAM_ID;
  const appleClientId = process.env.APPLE_CLIENT_ID;
  const appleKeyId = process.env.APPLE_KEY_ID;
  const applePrivateKey = process.env.APPLE_PRIVATE_KEY;

  if (!appleTeamId || !appleClientId || !appleKeyId || !applePrivateKey) {
    throw new Error('Apple OAuth configuration incomplete');
  }

  const now = Math.floor(Date.now() / 1000);
  
  const payload = {
    iss: appleTeamId,
    iat: now,
    exp: now + 86400 * 180, // 180 days
    aud: 'https://appleid.apple.com',
    sub: appleClientId,
  };

  const header = {
    alg: 'ES256',
    kid: appleKeyId,
  };

  return jwt.sign(payload, applePrivateKey, { 
    algorithm: 'ES256',
    header
  });
}

const handler: Handler = async (event, context) => {
  try {
    // Handle both GET and POST requests (Apple uses POST)
    const body = event.body ? new URLSearchParams(event.body) : null;
    const params = body || new URLSearchParams(event.queryStringParameters || {});
    
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const user = params.get('user'); // Apple sends user info on first authorization

    // Handle OAuth errors
    if (error) {
      return {
        statusCode: 302,
        headers: {
          'Location': `/login?error=${encodeURIComponent(error)}`
        },
        body: ''
      };
    }

    if (!code || !state) {
      return {
        statusCode: 302,
        headers: {
          'Location': '/login?error=missing_parameters'
        },
        body: ''
      };
    }

    // Validate state parameter
    const cookies = event.headers.cookie || '';
    const stateCookie = cookies.split(';').find(c => c.trim().startsWith('apple_oauth_state='));
    const storedState = stateCookie?.split('=')[1];

    if (!storedState || storedState !== state) {
      return {
        statusCode: 302,
        headers: {
          'Location': '/login?error=invalid_state'
        },
        body: ''
      };
    }

    const appleClientId = process.env.APPLE_CLIENT_ID;
    const appleRedirectUri = process.env.APPLE_REDIRECT_URI;

    if (!appleClientId || !appleRedirectUri) {
      throw new Error('Apple OAuth configuration missing');
    }

    // Generate client secret
    const clientSecret = generateAppleClientSecret();

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: appleClientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: appleRedirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Apple token exchange failed:', errorData);
      throw new Error('Token exchange failed');
    }

    const tokenData: AppleTokenResponse = await tokenResponse.json();

    // Decode the ID token to get user information
    const idTokenPayload = jwt.decode(tokenData.id_token) as AppleIdTokenPayload;
    
    if (!idTokenPayload) {
      throw new Error('Invalid ID token');
    }

    // Parse user info if provided (only on first authorization)
    let userName = '';
    if (user) {
      try {
        const userInfo = JSON.parse(user);
        userName = `${userInfo.name?.firstName || ''} ${userInfo.name?.lastName || ''}`.trim();
      } catch (e) {
        console.log('Could not parse user info:', e);
      }
    }

    // Create user session
    const sessionData = {
      user: {
        id: idTokenPayload.sub,
        email: idTokenPayload.email || '',
        name: userName || idTokenPayload.email?.split('@')[0] || 'Apple User',
        picture: '', // Apple doesn't provide profile pictures
        provider: 'apple',
        emailVerified: idTokenPayload.email_verified || false
      },
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token
    };

    // Create session token (in production, use proper JWT signing)
    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    // Set session cookie and redirect to dashboard
    const headers = {
      'Set-Cookie': [
        `session=${sessionToken}; HttpOnly; Secure; SameSite=Lax; Max-Age=86400; Path=/`,
        `apple_oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/` // Clear state cookie
      ].join(', '),
      'Location': '/dashboard'
    };

    return {
      statusCode: 302,
      headers,
      body: ''
    };

  } catch (error) {
    console.error('Apple OAuth callback error:', error);
    return {
      statusCode: 302,
      headers: {
        'Location': '/login?error=oauth_failed'
      },
      body: ''
    };
  }
};

export { handler };
