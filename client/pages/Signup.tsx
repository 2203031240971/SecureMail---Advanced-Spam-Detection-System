import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Camera,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SecureMailLogo } from "@/components/SecureMailLogo";
import { checkFaceLockRequirements } from "@/utils/faceLockUtils";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [faceLockAvailable, setFaceLockAvailable] = useState(false);
  const [faceLockLoading, setFaceLockLoading] = useState(false);
  const [faceLockRequirements, setFaceLockRequirements] = useState<any>(null);

  const { signup, socialSignup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Check face lock availability on component mount
  useEffect(() => {
    checkFaceLockAvailability();
  }, []);

  // Password strength checker
  useEffect(() => {
    const { password } = formData;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    setPasswordStrength(strength);
  }, [formData.password]);

  const checkFaceLockAvailability = async () => {
    try {
      setFaceLockLoading(true);
      const requirements = await checkFaceLockRequirements();
      setFaceLockRequirements(requirements);
      setFaceLockAvailable(requirements.errors.length === 0);
    } catch (error) {
      console.error("Face lock check failed:", error);
      setFaceLockAvailable(false);
    } finally {
      setFaceLockLoading(false);
    }
  };

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
      setError("");
    };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name.trim()) {
      setError("Name is required");
      return false;
    }

    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (!agreeToTerms) {
      setError("You must agree to the Terms of Service");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(
        formData.email,
        formData.password,
        formData.name,
      );

      if (result.success) {
        // Redirect to face lock setup for enhanced security
        navigate("/face-lock", {
          state: {
            setup: true,
            message:
              "Account created successfully! Set up face lock for enhanced security.",
          },
        });
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: "google" | "apple") => {
    setError("");
    setIsLoading(true);

    try {
      const result = await socialSignup(provider);

      if (result.success) {
        // Redirect to face lock setup for enhanced security
        navigate("/face-lock", {
          state: {
            setup: true,
            message: `Account created successfully with ${provider === "google" ? "Google" : "Apple"}! Set up face lock for enhanced security.`,
          },
        });
      } else {
        setError(
          result.error ||
            `${provider === "google" ? "Google" : "Apple"} signup failed`,
        );
      }
    } catch (err) {
      setError(
        `${provider === "google" ? "Google" : "Apple"} signup failed. Please try again.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceLockSignup = async () => {
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(
        formData.email,
        formData.password,
        formData.name,
      );

      if (result.success) {
        // Navigate directly to face lock setup
        navigate("/face-lock", {
          state: {
            setup: true,
            message:
              "Account created successfully! Complete face lock setup for maximum security.",
            fromSignup: true,
          },
        });
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return { text: "Weak", color: "text-destructive" };
      case 2:
      case 3:
        return { text: "Fair", color: "text-warning" };
      case 4:
        return { text: "Good", color: "text-success" };
      case 5:
        return { text: "Strong", color: "text-success" };
      default:
        return { text: "Weak", color: "text-destructive" };
    }
  };

  const passwordStrengthInfo = getPasswordStrengthText();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <SecureMailLogo size="lg" variant="full" />
          </div>
          <p className="text-muted-foreground">Create your secure account</p>
        </div>

        {/* Face Lock Availability Badge */}
        {faceLockLoading ? (
          <div className="flex justify-center">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              <span>Checking face lock availability...</span>
            </div>
          </div>
        ) : faceLockAvailable ? (
          <div className="flex justify-center">
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
              <Camera className="w-3 h-3 mr-1" />
              Face Lock Available
            </Badge>
          </div>
        ) : (
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600"
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              Face Lock Unavailable
            </Badge>
          </div>
        )}

        {/* Signup Card */}
        <Card className="bg-white/90 dark:bg-black/80 backdrop-blur-sm border-red-200 dark:border-red-900/50 shadow-2xl shadow-red-500/10 dark:shadow-red-500/20">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl text-foreground">
              Get Started
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Join SecureMail to protect your communications
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert className="border-red-500/50 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20 shadow-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Social Signup Options */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-black px-2 text-muted-foreground">
                    Quick Sign Up
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialSignup("google")}
                  className="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialSignup("apple")}
                  className="w-full bg-black hover:bg-red-950 text-white border-red-800 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mr-2 h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                      </svg>
                      Apple
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-black px-2 text-muted-foreground">
                    Or create account with email
                  </span>
                </div>
              </div>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange("name")}
                    className="pl-10 bg-white dark:bg-black border-red-200 dark:border-red-900/50 text-foreground focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    className="pl-10 bg-white dark:bg-black border-red-200 dark:border-red-900/50 text-foreground focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    className="pl-10 pr-10 bg-white dark:bg-black border-red-200 dark:border-red-900/50 text-foreground focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Password strength:
                      </span>
                      <span
                        className={`text-xs font-medium ${passwordStrengthInfo.color}`}
                      >
                        {passwordStrengthInfo.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          passwordStrength <= 2
                            ? "bg-red-500"
                            : passwordStrength <= 3
                              ? "bg-orange-500"
                              : "bg-red-600"
                        }`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    className="pl-10 pr-10 bg-white dark:bg-black border-red-200 dark:border-red-900/50 text-foreground focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="flex items-center space-x-2">
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600 dark:text-red-400">
                          Passwords match
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600 dark:text-red-400">
                          Passwords do not match
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) =>
                    setAgreeToTerms(checked as boolean)
                  }
                  className="mt-1"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground leading-tight"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-red-600 dark:text-red-400 hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-red-600 dark:text-red-400 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {/* Submit Buttons */}
              <div className="space-y-3">
                {/* Face Lock Signup Button */}
                {faceLockAvailable && (
                  <Button
                    type="button"
                    onClick={handleFaceLockSignup}
                    className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-medium py-3 shadow-lg hover:shadow-xl hover:shadow-red-500/25 transition-all duration-200 transform hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Camera className="h-5 w-5" />
                        <span>Create Account with Face Lock</span>
                        <Sparkles className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                )}

                {/* Regular Signup Button */}
                <Button
                  type="submit"
                  className={`w-full bg-black dark:bg-red-900 hover:bg-gray-900 dark:hover:bg-red-800 text-white font-medium py-3 transition-all duration-200 hover:shadow-lg ${faceLockAvailable ? "border-2 border-red-200 dark:border-red-800" : ""}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Create Account</span>
                    </div>
                  )}
                </Button>

                {/* Face Lock Info */}
                {faceLockAvailable && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Zap className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-red-800 dark:text-red-200">
                        <p className="font-medium mb-1">
                          Enhanced Security with Face Lock
                        </p>
                        <p>
                          Set up facial recognition for instant, secure access
                          to your account. Your biometric data is processed
                          locally and never stored on servers.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!faceLockAvailable && faceLockRequirements && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-gray-800 dark:text-gray-200">
                        <p className="font-medium mb-1">
                          Face Lock Unavailable
                        </p>
                        <p>
                          Camera access or browser requirements not met. You can
                          still create an account with password authentication.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Sign In Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                to="/login"
                className="text-red-600 dark:text-red-400 hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <SecureMailLogo size="sm" variant="icon" />
            <span className="text-xs font-medium">
              Protected by SecureMail Security
            </span>
          </div>
          <div className="bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-lg p-3 space-y-1 border border-red-200 dark:border-red-900/50 shadow-lg shadow-red-500/5">
            <p className="text-xs text-muted-foreground font-medium">
              🔒 256-bit encryption • 🛡️ AI threat detection • 🔐 Face lock
              security
            </p>
            <p className="text-xs text-muted-foreground">
              Your data is protected with enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
