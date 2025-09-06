import { Handler } from '@netlify/functions';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  email_verified: boolean;
}

const handler: Handler = async (event, context) => {
  try {
    const { code, state, error } = event.queryStringParameters || {};

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

    // Validate state parameter (in production, check against stored state)
    const cookies = event.headers.cookie || '';
    const stateCookie = cookies.split(';').find(c => c.trim().startsWith('oauth_state='));
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

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!googleClientId || !googleClientSecret || !redirectUri) {
      throw new Error('Google OAuth configuration missing');
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      throw new Error('Token exchange failed');
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();

    // Get user information
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userInfo: GoogleUserInfo = await userResponse.json();

    // Create user session (in production, create JWT token and store user in database)
    const sessionData = {
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        provider: 'google'
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
        `oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/` // Clear state cookie
      ].join(', '),
      'Location': '/dashboard'
    };

    return {
      statusCode: 302,
      headers,
      body: ''
    };

  } catch (error) {
    console.error('Google OAuth callback error:', error);
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
