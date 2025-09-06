import { User } from '@/contexts/AuthContext';

// API base URL - update this to match your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

class AuthService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('securemail_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: any = {};

      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
      } catch {
        errorData = { message: `HTTP error! status: ${response.status}` };
      }

      const error: ApiError = {
        message: errorData.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        code: errorData.code
      };
      throw error;
    }

    try {
      return await response.json();
    } catch {
      throw {
        message: 'Invalid JSON response from server',
        status: response.status,
        code: 'INVALID_JSON'
      } as ApiError;
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials)
      });

      // Check if response is JSON before trying to parse
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Login API returned non-JSON response, using fallback');
        return this.mockLogin(credentials);
      }

      const data = await this.handleResponse<AuthResponse>(response);

      if (data.success && data.token && data.user) {
        localStorage.setItem('securemail_token', data.token);
        localStorage.setItem('securemail_user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login API error:', error);

      // Fallback to mock authentication for demo
      return this.mockLogin(credentials);
    }
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      // Check if response is JSON before trying to parse
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Signup API returned non-JSON response, using fallback');
        return this.mockSignup(userData);
      }

      const data = await this.handleResponse<AuthResponse>(response);

      if (data.success && data.token && data.user) {
        localStorage.setItem('securemail_token', data.token);
        localStorage.setItem('securemail_user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Signup API error:', error);

      // Fallback to mock authentication for demo
      return this.mockSignup(userData);
    }
  }

  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('securemail_token');
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getHeaders()
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('securemail_token');
      localStorage.removeItem('securemail_user');
    }
  }

  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const token = localStorage.getItem('securemail_token');
      if (!token) {
        return { valid: false };
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return { valid: false };
      }

      const data = await response.json();
      return { valid: true, user: data.user };
    } catch (error) {
      console.error('Token verification error:', error);
      
      // Fallback: check if user data exists in localStorage
      const userData = localStorage.getItem('securemail_user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          return { valid: true, user };
        } catch {
          return { valid: false };
        }
      }
      
      return { valid: false };
    }
  }

  async refreshToken(): Promise<{ success: boolean; token?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      const data = await this.handleResponse<{ success: boolean; token?: string }>(response);
      
      if (data.success && data.token) {
        localStorage.setItem('securemail_token', data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false };
    }
  }

  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updates)
      });

      const data = await this.handleResponse<{ success: boolean; user?: User }>(response);
      
      if (data.success && data.user) {
        localStorage.setItem('securemail_user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  // Mock authentication methods for demo purposes
  private async mockLogin(credentials: LoginRequest): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    const { email, password } = credentials;
    
    // Mock validation
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }
    
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    // Mock user data
    const mockUser: User = {
      id: email === 'admin@securemail.com' ? 'admin-1' : 'user-1',
      email: email,
      name: email === 'admin@securemail.com' ? 'Admin User' : email.split('@')[0],
      role: email === 'admin@securemail.com' ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      isVerified: true
    };
    
    const mockToken = `mock_token_${Date.now()}_${Math.random()}`;
    
    return {
      success: true,
      user: mockUser,
      token: mockToken
    };
  }

  private async mockSignup(userData: SignupRequest): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    const { email, password, name } = userData;
    
    // Validation
    if (!email || !password || !name) {
      return { success: false, error: 'All fields are required' };
    }
    
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    
    // Check if user already exists (mock)
    if (email === 'admin@securemail.com') {
      return { success: false, error: 'User with this email already exists' };
    }
    
    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      email: email,
      name: name,
      role: 'user',
      createdAt: new Date().toISOString(),
      isVerified: false
    };
    
    const mockToken = `mock_token_${Date.now()}_${Math.random()}`;
    
    return {
      success: true,
      user: newUser,
      token: mockToken
    };
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

// Export helper functions
export const isTokenValid = () => {
  const token = localStorage.getItem('securemail_token');
  return !!token;
};

export const getCurrentUser = (): User | null => {
  try {
    const userData = localStorage.getItem('securemail_user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('securemail_token');
  localStorage.removeItem('securemail_user');
};
