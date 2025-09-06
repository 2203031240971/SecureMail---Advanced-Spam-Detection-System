import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth';
import { socialAuthService, type SocialProvider } from '@/services/socialAuth';
import { faceAuthService, type FaceLockSettings } from '@/services/faceAuth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  socialLogin: (provider: SocialProvider) => Promise<{ success: boolean; error?: string }>;
  socialSignup: (provider: SocialProvider) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  connectedProviders: SocialProvider[];
  disconnectProvider: (provider: SocialProvider) => Promise<{ success: boolean; error?: string }>;
  // Face authentication
  isFaceLockEnabled: boolean;
  faceLockSettings: FaceLockSettings;
  enrollFace: (faceData: string) => Promise<{ success: boolean; error?: string }>;
  verifyFace: (faceData: string) => Promise<{ success: boolean; error?: string }>;
  updateFaceLockSettings: (settings: Partial<FaceLockSettings>) => void;
  disableFaceLock: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const mountedRef = React.useRef(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedProviders, setConnectedProviders] = useState<SocialProvider[]>([]);
  const [isFaceLockEnabled, setIsFaceLockEnabled] = useState(false);
  const [faceLockSettings, setFaceLockSettings] = useState<FaceLockSettings>({
    enabled: false,
    sensitivity: 'medium',
    requirePeriodic: true,
    periodicInterval: 24
  });

  // Cleanup function for unmounting
  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Check for existing session on app load
  useEffect(() => {
    checkAuthSession();
  }, []);

  // Safe state setters that check if component is mounted
  const safeSetUser = (newUser: User | null) => {
    if (mountedRef.current) setUser(newUser);
  };

  const safeSetLoading = (loading: boolean) => {
    if (mountedRef.current) setIsLoading(loading);
  };

  const safeSetConnectedProviders = (providers: SocialProvider[]) => {
    if (mountedRef.current) setConnectedProviders(providers);
  };

  const safeSetIsFaceLockEnabled = (enabled: boolean) => {
    if (mountedRef.current) setIsFaceLockEnabled(enabled);
  };

  const safeSetFaceLockSettings = (settings: FaceLockSettings) => {
    if (mountedRef.current) setFaceLockSettings(settings);
  };

  // Load connected providers and face lock status when user is authenticated
  useEffect(() => {
    if (user) {
      loadConnectedProviders();
      loadFaceLockStatus();
    } else {
      safeSetConnectedProviders([]);
      safeSetIsFaceLockEnabled(false);
      safeSetFaceLockSettings({
        enabled: false,
        sensitivity: 'medium',
        requirePeriodic: true,
        periodicInterval: 24
      });
    }
  }, [user]);

  const checkAuthSession = async () => {
    try {
      const savedUser = localStorage.getItem('securemail_user');
      const savedToken = localStorage.getItem('securemail_token');
      
      if (savedUser && savedToken) {
        const userData = JSON.parse(savedUser);
        // Verify token is still valid (in a real app, you'd call an API)
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth session:', error);
      // Clear invalid data
      localStorage.removeItem('securemail_user');
      localStorage.removeItem('securemail_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      safeSetLoading(true);

      const result = await authService.login({ email, password });

      if (result.success && result.user) {
        safeSetUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Login failed' };
      }

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      safeSetLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      safeSetLoading(true);

      const result = await authService.signup({ email, password, name });

      if (result.success && result.user) {
        safeSetUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Registration failed' };
      }

    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      safeSetLoading(false);
    }
  };

  const socialLogin = async (provider: SocialProvider): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      let result;
      switch (provider) {
        case 'google':
          result = await socialAuthService.loginWithGoogle();
          break;
        case 'apple':
          result = await socialAuthService.loginWithApple();
          break;
        default:
          return { success: false, error: `${provider} login not supported` };
      }

      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error || `${provider} login failed` };
      }

    } catch (error) {
      console.error('Social login error:', error);
      return { success: false, error: `${provider} login failed. Please try again.` };
    } finally {
      setIsLoading(false);
    }
  };

  const socialSignup = async (provider: SocialProvider): Promise<{ success: boolean; error?: string }> => {
    // For social providers, signup and login are typically the same flow
    return socialLogin(provider);
  };

  const disconnectProvider = async (provider: SocialProvider): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await socialAuthService.disconnectProvider(provider);

      if (result.success) {
        setConnectedProviders(prev => prev.filter(p => p !== provider));
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to disconnect provider' };
      }
    } catch (error) {
      console.error('Disconnect provider error:', error);
      return { success: false, error: 'Failed to disconnect provider' };
    }
  };

  const loadConnectedProviders = async () => {
    try {
      const providers = await socialAuthService.getConnectedProviders();
      safeSetConnectedProviders(providers);
    } catch (error) {
      console.error('Load connected providers error:', error);
    }
  };

  const loadFaceLockStatus = () => {
    try {
      const enabled = faceAuthService.isFaceLockEnabled();
      const settings = faceAuthService.getFaceLockSettings();

      safeSetIsFaceLockEnabled(enabled);
      safeSetFaceLockSettings(settings);
    } catch (error) {
      console.error('Load face lock status error:', error);
    }
  };

  const enrollFace = async (faceData: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await faceAuthService.enrollFace(faceData, user.id);

      if (result.success) {
        loadFaceLockStatus(); // Refresh face lock status
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Face enrollment failed' };
      }
    } catch (error) {
      console.error('Face enrollment error:', error);
      return { success: false, error: 'Face enrollment failed. Please try again.' };
    }
  };

  const verifyFace = async (faceData: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await faceAuthService.verifyFace(faceData, user.id);

      if (result.success) {
        loadFaceLockStatus(); // Refresh face lock status
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Face verification failed' };
      }
    } catch (error) {
      console.error('Face verification error:', error);
      return { success: false, error: 'Face verification failed. Please try again.' };
    }
  };

  const updateFaceLockSettings = (settings: Partial<FaceLockSettings>) => {
    try {
      faceAuthService.updateFaceLockSettings(settings);
      loadFaceLockStatus(); // Refresh face lock status
    } catch (error) {
      console.error('Update face lock settings error:', error);
    }
  };

  const disableFaceLock = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await faceAuthService.disableFaceLock(user.id);

      if (result.success) {
        loadFaceLockStatus(); // Refresh face lock status
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to disable face lock' };
      }
    } catch (error) {
      console.error('Disable face lock error:', error);
      return { success: false, error: 'Failed to disable face lock. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      socialAuthService.clearSocialAuthData();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setConnectedProviders([]);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('securemail_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    socialLogin,
    socialSignup,
    logout,
    updateUser,
    connectedProviders,
    disconnectProvider,
    // Face authentication
    isFaceLockEnabled,
    faceLockSettings,
    enrollFace,
    verifyFace,
    updateFaceLockSettings,
    disableFaceLock
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
