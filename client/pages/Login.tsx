import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Phone,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SecureMailLogo } from "@/components/SecureMailLogo";
import { MockOAuthFlow } from "@/components/MockOAuthFlow";
import { phoneOtpService } from "@/services/phoneOtpService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [oauthFlow, setOauthFlow] = useState<{
    isOpen: boolean;
    provider: "google" | "apple" | null;
  }>({
    isOpen: false,
    provider: null,
  });

  // Phone OTP states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

  const { login, socialLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Handle OAuth errors from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthError = urlParams.get("error");

    if (oauthError) {
      const errorMessages: { [key: string]: string } = {
        access_denied: "Access denied. Please try again.",
        invalid_request: "Invalid request. Please try again.",
        unauthorized_client: "Unauthorized client. Please contact support.",
        unsupported_response_type: "Unsupported response type.",
        invalid_scope: "Invalid scope requested.",
        server_error: "Server error occurred. Please try again.",
        temporarily_unavailable:
          "Service temporarily unavailable. Please try again later.",
        missing_parameters: "Missing required parameters.",
        invalid_state: "Invalid state parameter. Please try again.",
        oauth_failed: "OAuth authentication failed. Please try again.",
      };

      setError(
        errorMessages[oauthError] || "Authentication failed. Please try again.",
      );

      // Clear error from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (type: "admin" | "user") => {
    if (type === "admin") {
      setEmail("admin@securemail.com");
      setPassword("admin123");
    } else {
      setEmail("user@example.com");
      setPassword("user123");
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    console.log(`Starting ${provider} OAuth login...`);
    setError("");
    setIsLoading(true);

    try {
      // Show loading for a moment to simulate OAuth initiation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Open mock OAuth flow
      setOauthFlow({ isOpen: true, provider });
      setIsLoading(false);
    } catch (err) {
      console.error(`${provider} OAuth error:`, err);
      setError(
        `${provider === "google" ? "Google" : "Apple"} login failed. Please try again.`,
      );
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (user: any) => {
    setError("");
    setIsLoading(true);

    try {
      // Simulate successful OAuth login
      console.log("OAuth user:", user);

      // In a real app, you would send this to your backend to create/login the user
      // For now, we'll simulate success and redirect to dashboard
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate storing user session
      localStorage.setItem("demo_user", JSON.stringify(user));

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("OAuth login failed. Please try again.");
      setIsLoading(false);
    }
  };

  const closeOAuthFlow = () => {
    setOauthFlow({ isOpen: false, provider: null });
    setIsLoading(false);
  };

  // Phone OTP functions
  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setOtpError("Please enter a phone number");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const response = await phoneOtpService.sendOTP(phoneNumber);

      if (response.success) {
        setOtpSent(true);
        setOtpTimer(60); // Start 60 second countdown
        setOtpError("");
      } else {
        setOtpError(response.message);
      }
    } catch (error) {
      setOtpError("Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      setOtpError("Please enter the OTP");
      return;
    }

    setOtpLoading(true);
    setOtpError("");

    try {
      const response = await phoneOtpService.verifyOTP(phoneNumber, otp);

      if (response.success && response.user) {
        // Simulate successful login
        localStorage.setItem("demo_user", JSON.stringify(response.user));
        navigate("/dashboard");
      } else {
        setOtpError(response.message);
      }
    } catch (error) {
      setOtpError("Failed to verify OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpLoading(true);
    setOtpError("");

    try {
      const response = await phoneOtpService.resendOTP(phoneNumber);

      if (response.success) {
        setOtpSent(true);
        setOtpTimer(60); // Start 60 second countdown
        setOtpError("");
        setOtp(""); // Clear previous OTP input
      } else {
        setOtpError(response.message);
      }
    } catch (error) {
      setOtpError("Failed to resend OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // OTP Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <SecureMailLogo size="lg" variant="full" />
          </div>
          <p className="text-muted-foreground">
            Sign in to your secure account
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/90 dark:bg-black/80 backdrop-blur-sm border-red-200 dark:border-red-900/50 shadow-2xl shadow-red-500/10 dark:shadow-red-500/20">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl text-foreground">
              Welcome Back
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose your preferred login method
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger value="email" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Login
                </TabsTrigger>
                <TabsTrigger value="phone" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400">
                  <Phone className="w-4 h-4 mr-2" />
                  Phone OTP
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4 mt-4">
            {/* Error Alert */}
            {error && (
              <Alert className="border-red-500/50 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20 shadow-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Demo Credentials */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                Quick Demo Access:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials("admin")}
                  className="text-xs"
                >
                  👑 Admin Login
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials("user")}
                  className="text-xs"
                >
                  👤 User Login
                </Button>
              </div>
            </div>

            {/* Social Login Options */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-black px-2 text-muted-foreground">
                    Quick Sign In
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin("google")}
                  className="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  ) : (
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
                  )}
                  {isLoading ? "Connecting..." : "Google"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin("apple")}
                  className="w-full bg-black hover:bg-red-950 text-white border-red-800 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <svg
                      className="mr-2 h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                  )}
                  {isLoading ? "Connecting..." : "Apple"}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-black px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white dark:bg-black border-red-200 dark:border-red-900/50 text-foreground focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground"
                  >
                    Remember me
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-medium py-3 shadow-lg hover:shadow-xl hover:shadow-red-500/25 transition-all duration-200 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

                            {/* Sign Up Link */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    Don't have an account?{" "}
                  </span>
                  <Link
                    to="/signup"
                    className="text-red-600 dark:text-red-400 hover:underline font-medium"
                  >
                    Sign up
                  </Link>
                </div>

                {/* Phone OTP Link */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    Prefer phone verification?{" "}
                  </span>
                  <Link
                    to="/phone-otp"
                    className="text-red-600 dark:text-red-400 hover:underline font-medium"
                  >
                    Use Phone OTP
                  </Link>
                </div>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4 mt-4">
                {/* Phone OTP Error Alert */}
                {otpError && (
                  <Alert className="border-red-500/50 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20 shadow-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{otpError}</AlertDescription>
                  </Alert>
                )}

                {/* Demo Phone Numbers */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Quick Demo Access:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPhoneNumber('+1234567890')}
                      className="text-xs"
                    >
                      📱 +1234567890
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPhoneNumber('+9876543210')}
                      className="text-xs"
                    >
                      📱 +9876543210
                    </Button>
                  </div>
                </div>

                {/* Phone Number Input */}
                {!otpSent ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1234567890"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="pl-10 bg-white dark:bg-black border-red-200 dark:border-red-900/50 text-foreground focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-medium py-3 shadow-lg hover:shadow-xl hover:shadow-red-500/25 transition-all duration-200 transform hover:scale-105"
                      disabled={otpLoading}
                    >
                      {otpLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending OTP...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>Send OTP</span>
                        </div>
                      )}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-foreground">Enter 6-digit OTP</Label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="otp"
                          type="text"
                          placeholder="123456"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="pl-10 bg-white dark:bg-black border-red-200 dark:border-red-900/50 text-foreground focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all text-center text-lg font-mono"
                          maxLength={6}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        OTP sent to {phoneNumber} • Expires in {otpTimer}s
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-medium py-3 shadow-lg hover:shadow-xl hover:shadow-red-500/25 transition-all duration-200 transform hover:scale-105"
                      disabled={otpLoading || otpTimer === 0}
                    >
                      {otpLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>Verify OTP</span>
                        </div>
                      )}
                    </Button>

                    {otpTimer === 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendOTP}
                        className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                        disabled={otpLoading}
                      >
                        Resend OTP
                      </Button>
                    )}
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center space-y-2">
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

      {/* Mock OAuth Flow */}
      {oauthFlow.provider && (
        <MockOAuthFlow
          provider={oauthFlow.provider}
          isOpen={oauthFlow.isOpen}
          onClose={closeOAuthFlow}
          onLogin={handleOAuthLogin}
        />
      )}
    </div>
  );
}
