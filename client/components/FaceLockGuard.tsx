import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Clock, Lock, Scan, User, AlertTriangle } from 'lucide-react';
import { faceAuthService, isFaceLockEnabled, isPeriodicVerificationRequired } from '@/services/faceAuth';
import { useAuth } from '@/contexts/AuthContext';
import { SecureMailLogo, AnimatedSecureMailLogo } from '@/components/SecureMailLogo';

interface FaceLockGuardProps {
  children: React.ReactNode;
  requireFaceLock?: boolean; // If true, face lock is mandatory for this route
  bypassIfDisabled?: boolean; // If true, allow access even if face lock is disabled
}

export function FaceLockGuard({ 
  children, 
  requireFaceLock = false, 
  bypassIfDisabled = true 
}: FaceLockGuardProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState<{ hours: number; minutes: number } | null>(null);

  useEffect(() => {
    checkFaceLockRequirement();
  }, [user, location.pathname]);

  const checkFaceLockRequirement = () => {
    setIsChecking(true);

    if (!isAuthenticated || !user) {
      setIsChecking(false);
      return;
    }

    const faceLockEnabled = isFaceLockEnabled();
    const status = faceAuthService.getFaceLockStatus();

    // If face lock is required but not enabled, redirect to setup
    if (requireFaceLock && !faceLockEnabled) {
      setNeedsVerification(true);
      setIsChecking(false);
      return;
    }

    // If face lock is disabled and bypass is allowed, continue
    if (!faceLockEnabled && bypassIfDisabled) {
      setIsChecking(false);
      return;
    }

    // Check if periodic verification is required
    if (faceLockEnabled && isPeriodicVerificationRequired()) {
      setNeedsVerification(true);
      setTimeUntilNext(null);
    } else {
      setTimeUntilNext(faceAuthService.getTimeUntilNextVerification());
    }

    setIsChecking(false);
  };

  const handleSetupFaceLock = () => {
    // Redirect to face lock setup
    window.location.href = '/face-lock-setup';
  };

  const handleVerifyFace = () => {
    // Redirect to face lock verification
    window.location.href = `/face-lock-verify?return=${encodeURIComponent(location.pathname)}`;
  };

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border shadow-xl">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-6">
            <AnimatedSecureMailLogo size="lg" />
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Checking Security</h2>
              <p className="text-sm text-muted-foreground">Verifying access requirements...</p>
              <div className="flex items-center justify-center space-x-1 mt-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to face lock setup if required but not enabled
  if (requireFaceLock && !isFaceLockEnabled()) {
    return <Navigate to="/face-lock-setup" state={{ from: location, required: true }} replace />;
  }

  // Show face lock verification required screen
  if (needsVerification) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          {/* Logo Header */}
          <div className="text-center">
            <SecureMailLogo size="lg" variant="full" />
          </div>

          <Card className="bg-card border-border shadow-xl">
            <CardContent className="p-8 space-y-6">
              {/* Security Alert */}
              <Alert className="border-primary/20 bg-primary/5">
                <Lock className="h-5 w-5 text-primary" />
                <AlertDescription className="text-primary font-medium">
                  Enhanced Security Zone - Biometric verification required
                </AlertDescription>
              </Alert>

              <div className="text-center space-y-3">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-3xl mx-auto">
                  <Scan className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Face Verification Required</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  This secure area requires biometric authentication to protect your sensitive data and maintain the highest security standards.
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleVerifyFace}
                  className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-medium"
                >
                  <Scan className="w-5 h-5 mr-3" />
                  Verify with Face Recognition
                </Button>

                {!isFaceLockEnabled() && (
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleSetupFaceLock}
                      variant="outline"
                      className="w-full h-12 text-base"
                    >
                      <User className="w-5 h-5 mr-3" />
                      Set Up Face Lock First
                    </Button>
                  </div>
                )}
              </div>

              {/* Security Features */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Security Features Active
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>AI-powered detection</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Liveness verification</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Local processing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Zero data transmission</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Security Info */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <SecureMailLogo size="sm" variant="icon" />
              <span className="text-xs font-medium">Protected by SecureMail Security</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Your biometric data is processed locally and never transmitted. This verification helps protect against unauthorized access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show next verification countdown if applicable
  if (timeUntilNext && (timeUntilNext.hours > 0 || timeUntilNext.minutes > 0)) {
    const showCountdown = timeUntilNext.hours < 1; // Show countdown only when less than 1 hour
    const isUrgent = timeUntilNext.minutes <= 10;

    return (
      <div className="relative">
        {showCountdown && (
          <div className="fixed top-4 right-4 z-50">
            <Card className={`${
              isUrgent
                ? 'bg-red-500/10 border-red-500/20 animate-pulse'
                : 'bg-amber-500/10 border-amber-500/20'
            } shadow-lg`}>
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                  <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-amber-500'}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>
                    Face verification required
                  </p>
                  <p className={`text-xs ${isUrgent ? 'text-red-500' : 'text-amber-500'}`}>
                    in {timeUntilNext.minutes} minute{timeUntilNext.minutes !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-2"
                  onClick={() => window.location.href = '/face-lock-verify'}
                >
                  <Scan className="w-3 h-3 mr-1" />
                  Verify Now
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
        {children}
      </div>
    );
  }

  // All checks passed, render protected content
  return <>{children}</>;
}

// Higher-order component for routes that require face lock
export function RequireFaceLock({ children }: { children: React.ReactNode }) {
  return (
    <FaceLockGuard requireFaceLock={true} bypassIfDisabled={false}>
      {children}
    </FaceLockGuard>
  );
}

// Higher-order component for routes with optional face lock
export function OptionalFaceLock({ children }: { children: React.ReactNode }) {
  return (
    <FaceLockGuard requireFaceLock={false} bypassIfDisabled={true}>
      {children}
    </FaceLockGuard>
  );
}
