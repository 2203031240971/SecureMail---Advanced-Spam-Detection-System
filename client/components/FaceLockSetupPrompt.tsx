import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Scan, 
  Shield, 
  X, 
  CheckCircle, 
  Lock, 
  Sparkles,
  Clock,
  User,
  Eye,
  Zap
} from 'lucide-react';
import { faceAuthService, isFaceLockEnabled } from '@/services/faceAuth';
import { useAuth } from '@/contexts/AuthContext';
import { SecureMailLogo } from '@/components/SecureMailLogo';

interface FaceLockSetupPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onSetup: () => void;
  trigger?: 'signup' | 'login' | 'manual';
}

export function FaceLockSetupPrompt({ 
  isOpen, 
  onClose, 
  onSkip, 
  onSetup,
  trigger = 'manual'
}: FaceLockSetupPromptProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentStep, setCurrentStep] = useState<'intro' | 'benefits' | 'confirmation'>('intro');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('intro');
    }
  }, [isOpen]);

  const handleSetupClick = () => {
    setIsAnimating(true);
    onSetup();
    // Navigate to face lock setup
    navigate('/face-lock-setup', {
      state: {
        setup: true,
        from: location.pathname,
        message: 'Secure your account with advanced biometric protection'
      }
    });
  };

  const handleNext = () => {
    if (currentStep === 'intro') {
      setCurrentStep('benefits');
    } else if (currentStep === 'benefits') {
      setCurrentStep('confirmation');
    }
  };

  const handleBack = () => {
    if (currentStep === 'benefits') {
      setCurrentStep('intro');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('benefits');
    }
  };

  const getTriggerMessage = () => {
    switch (trigger) {
      case 'signup':
        return 'Welcome to SecureMail! Let\'s secure your new account.';
      case 'login':
        return 'Welcome back! Enhance your security with face recognition.';
      default:
        return 'Upgrade your account security with biometric protection.';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card border-border shadow-2xl animate-in fade-in duration-300">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 w-8 h-8 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="text-center space-y-4 pt-4">
            <SecureMailLogo size="md" variant="full" />
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                {currentStep === 'intro' && '🔐 Secure Your Account'}
                {currentStep === 'benefits' && '✨ Advanced Protection'}
                {currentStep === 'confirmation' && '🚀 Ready to Setup'}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {getTriggerMessage()}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {/* Introduction Step */}
          {currentStep === 'intro' && (
            <div className="space-y-6 animate-in slide-in-from-left duration-300">
              <Alert className="border-primary/20 bg-primary/5">
                <Scan className="h-5 w-5 text-primary" />
                <AlertDescription className="text-primary font-medium">
                  Face Lock adds an extra layer of security to protect your sensitive data
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Why Face Lock?
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Instant Access</p>
                        <p className="text-xs text-muted-foreground">Login in under 2 seconds with just a glance</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Enhanced Security</p>
                        <p className="text-xs text-muted-foreground">Biometric authentication prevents unauthorized access</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Privacy First</p>
                        <p className="text-xs text-muted-foreground">All processing happens locally on your device</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Scan className="w-10 h-10 text-primary animate-pulse" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Setup in 30 seconds</h4>
                  <p className="text-sm text-muted-foreground">Quick and easy biometric enrollment</p>
                </div>
              </div>
            </div>
          )}

          {/* Benefits Step */}
          {currentStep === 'benefits' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-4">Enterprise-Grade Security</h3>
                <p className="text-muted-foreground">
                  SecureMail uses advanced AI and machine learning for the most secure biometric protection
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                  <CardContent className="p-6 text-center">
                    <Eye className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                    <h4 className="font-semibold text-foreground mb-2">Liveness Detection</h4>
                    <p className="text-xs text-muted-foreground">Prevents spoofing with advanced anti-fraud technology</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                  <CardContent className="p-6 text-center">
                    <Lock className="w-8 h-8 text-green-500 mx-auto mb-3" />
                    <h4 className="font-semibold text-foreground mb-2">Zero Knowledge</h4>
                    <p className="text-xs text-muted-foreground">Your biometric data never leaves your device</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                  <CardContent className="p-6 text-center">
                    <Zap className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                    <h4 className="font-semibold text-foreground mb-2">Lightning Fast</h4>
                    <p className="text-xs text-muted-foreground">Instant recognition with 99.9% accuracy</p>
                  </CardContent>
                </Card>
              </div>

              <Alert className="border-green-500/20 bg-green-500/5">
                <Sparkles className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-600">
                  <strong>Industry Leading:</strong> Used by Fortune 500 companies for secure access control
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Confirmation Step */}
          {currentStep === 'confirmation' && (
            <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Get Started?</h3>
                  <p className="text-muted-foreground">
                    The setup process will take about 30 seconds and will significantly improve your account security.
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-foreground">What happens next:</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">1</div>
                    <span>Camera permission request</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">2</div>
                    <span>Face capture and enrollment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">3</div>
                    <span>Secure encryption and storage</span>
                  </div>
                </div>
              </div>

              {trigger === 'signup' && (
                <Alert className="border-amber-500/20 bg-amber-500/5">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-amber-600">
                    <strong>New Account:</strong> Setting up Face Lock now provides the best security from day one
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            {currentStep === 'intro' && (
              <>
                <Button
                  variant="outline"
                  onClick={onSkip}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Learn More
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}

            {currentStep === 'benefits' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Continue
                  <Scan className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}

            {currentStep === 'confirmation' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSetupClick}
                  disabled={isAnimating}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isAnimating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Setting Up...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Setup Face Lock
                    </>
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2">
            {['intro', 'benefits', 'confirmation'].map((step, index) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentStep === step ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FaceLockSetupPrompt;
