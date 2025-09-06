import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading SecureMail...</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Verifying your authentication status
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access if required
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-2xl">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
            <p className="text-sm text-muted-foreground text-center">
              You need administrator privileges to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go Back
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
}

// Higher-order component for admin-only routes
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireAdmin>
      {children}
    </ProtectedRoute>
  );
}

// Hook to check if user has specific permissions
export function usePermissions() {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    canAccessAdminPanel: user?.role === 'admin',
    canModifySettings: user?.role === 'admin',
    canViewAnalytics: !!user,
    canScanEmails: !!user,
  };
}
