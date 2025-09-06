import { User } from '@/contexts/AuthContext';

export type SocialProvider = 'google' | 'apple' | 'facebook' | 'microsoft';

export interface SocialAuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface SocialUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: SocialProvider;
}

class SocialAuthService {
  // API Configuration
  private readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  // Google OAuth configuration
  private readonly GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo-google-client-id';
  private readonly GOOGLE_REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

  // Apple OAuth configuration
  private readonly APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID || 'demo-apple-client-id';
  private readonly APPLE_REDIRECT_URI = `${window.location.origin}/auth/apple/callback`;

  /**
   * Initiate Google OAuth login
   */
  async loginWithGoogle(): Promise<SocialAuthResponse> {
    try {
      // In a real implementation, this would redirect to Google OAuth
      // For demo purposes, we'll simulate the OAuth flow
      return this.simulateGoogleOAuth();
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: 'Google login failed' };
    }
  }

  /**
   * Initiate Apple OAuth login
   */
  async loginWithApple(): Promise<SocialAuthResponse> {
    try {
      // In a real implementation, this would redirect to Apple OAuth
      // For demo purposes, we'll simulate the OAuth flow
      return this.simulateAppleOAuth();
    } catch (error) {
      console.error('Apple login error:', error);
      return { success: false, error: 'Apple login failed' };
    }
  }

  /**
   * Handle OAuth callback from social provider
   */
  async handleOAuthCallback(provider: SocialProvider, code: string): Promise<SocialAuthResponse> {
    try {
      // Exchange authorization code for access token
      const response = await fetch(`${this.API_BASE_URL}/auth/oauth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, code })
      });

      if (!response.ok) {
        console.warn('OAuth callback API not available, using fallback');
        return { success: false, error: 'OAuth service temporarily unavailable' };
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('OAuth callback returned non-JSON response, using fallback');
        return { success: false, error: 'Invalid OAuth response format' };
      }

      const data = await response.json();

      if (data.success && data.token && data.user) {
        // Store authentication data
        localStorage.setItem('securemail_token', data.token);
        localStorage.setItem('securemail_user', JSON.stringify(data.user));
        localStorage.setItem('securemail_auth_provider', provider);
      }

      return data;
    } catch (error) {
      console.error('OAuth callback error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Get user profile from social provider
   */
  async getSocialUserProfile(provider: SocialProvider, accessToken: string): Promise<SocialUserInfo | null> {
    try {
      let profileUrl = '';
      
      switch (provider) {
        case 'google':
          profileUrl = `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`;
          break;
        case 'apple':
          // Apple doesn't provide a direct profile API, user info comes with the token
          return null;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      const response = await fetch(profileUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profile = await response.json();
      
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name || profile.given_name + ' ' + profile.family_name,
        picture: profile.picture,
        provider
      };
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  }

  /**
   * Disconnect social provider from account
   */
  async disconnectProvider(provider: SocialProvider): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/social/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('securemail_token')}`
        },
        body: JSON.stringify({ provider })
      });

      if (!response.ok) {
        console.warn('Disconnect provider API not available, using fallback');
        return { success: true }; // Assume success for demo
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Disconnect provider returned non-JSON response, using fallback');
        return { success: true }; // Assume success for demo
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Disconnect provider error:', error);
      return { success: false, error: 'Failed to disconnect provider' };
    }
  }

  /**
   * Get connected social providers for current user
   */
  async getConnectedProviders(): Promise<SocialProvider[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/social/connected`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('securemail_token')}`
        }
      });

      if (!response.ok) {
        console.warn('Connected providers API not available, using fallback');
        return [];
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Connected providers API returned non-JSON response, using fallback');
        return [];
      }

      const data = await response.json();
      return data.providers || [];
    } catch (error) {
      console.error('Get connected providers error:', error);
      // Return empty array as fallback
      return [];
    }
  }

  // Demo/Mock implementations
  private async simulateGoogleOAuth(): Promise<SocialAuthResponse> {
    // Simulate OAuth redirect and callback
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockUser: User = {
      id: `google_${Date.now()}`,
      email: 'user@gmail.com',
      name: 'Google User',
      role: 'user',
      createdAt: new Date().toISOString(),
      isVerified: true
    };

    const mockToken = `google_token_${Date.now()}_${Math.random()}`;

    return {
      success: true,
      user: mockUser,
      token: mockToken
    };
  }

  private async simulateAppleOAuth(): Promise<SocialAuthResponse> {
    // Simulate OAuth redirect and callback
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockUser: User = {
      id: `apple_${Date.now()}`,
      email: 'user@icloud.com',
      name: 'Apple User',
      role: 'user',
      createdAt: new Date().toISOString(),
      isVerified: true
    };

    const mockToken = `apple_token_${Date.now()}_${Math.random()}`;

    return {
      success: true,
      user: mockUser,
      token: mockToken
    };
  }

  /**
   * Build OAuth URLs for social providers
   */
  getOAuthUrl(provider: SocialProvider): string {
    switch (provider) {
      case 'google':
        return this.buildGoogleOAuthUrl();
      case 'apple':
        return this.buildAppleOAuthUrl();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private buildGoogleOAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.GOOGLE_CLIENT_ID,
      redirect_uri: this.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  private buildAppleOAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.APPLE_CLIENT_ID,
      redirect_uri: this.APPLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'name email',
      response_mode: 'form_post'
    });

    return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
  }

  /**
   * Check if running in production environment
   */
  private isProduction(): boolean {
    return import.meta.env.PROD || import.meta.env.MODE === 'production';
  }

  /**
   * Get stored authentication provider
   */
  getAuthProvider(): SocialProvider | null {
    return localStorage.getItem('securemail_auth_provider') as SocialProvider | null;
  }

  /**
   * Clear social authentication data
   */
  clearSocialAuthData(): void {
    localStorage.removeItem('securemail_auth_provider');
  }
}

// Create and export singleton instance
export const socialAuthService = new SocialAuthService();

// Export helper functions
export const isSocialLogin = (): boolean => {
  return !!localStorage.getItem('securemail_auth_provider');
};

export const getSocialAuthProvider = (): SocialProvider | null => {
  return socialAuthService.getAuthProvider();
};
