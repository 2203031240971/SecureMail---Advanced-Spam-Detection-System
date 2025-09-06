import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, MessageSquare, ArrowLeft, CheckCircle, AlertCircle, RefreshCw, Shield } from "lucide-react";
import { phoneOtpService } from "@/services/phoneOtpService";
import { SecureMailLogo } from "@/components/SecureMailLogo";

interface OTPResponse {
  success: boolean;
  message: string;
  otp?: string;
  expiresAt?: string;
  cooldownSeconds?: number;
}

interface OTPVerificationResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    phoneNumber: string;
    name: string;
    email?: string;
    verified: boolean;
    verifiedAt: string;
  };
  token?: string;
  expiresIn?: string;
}

export default function PhoneOTP() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");

  // Demo phone numbers
  const demoNumbers = [
    { number: "+1234567890", label: "US Demo" },
    { number: "+9876543210", label: "Demo 2" },
    { number: "+1122334455", label: "Demo 3" },
  ];

  // Send OTP
  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setOtpError("Please enter a phone number");
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    setOtpSuccess("");

    try {
      const response: OTPResponse = await phoneOtpService.sendOTP(phoneNumber);

      if (response.success) {
        setOtpSent(true);
        setStep("otp");
        setOtpTimer(300); // 5 minutes
        if (response.cooldownSeconds) {
          setCooldownTimer(response.cooldownSeconds);
        }
        setOtpSuccess(response.message);
        
        // Clear success message after 3 seconds
        setTimeout(() => setOtpSuccess(""), 3000);
      } else {
        setOtpError(response.message);
      }
    } catch (error) {
      setOtpError("Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      setOtpError("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      setOtpError("Please enter a 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setOtpError("");

    try {
      const response: OTPVerificationResponse = await phoneOtpService.verifyOTP(phoneNumber, otp);

      if (response.success && response.user) {
        setStep("success");
        setOtpSuccess("OTP verified successfully!");
        
        // Store user data
        localStorage.setItem("demo_user", JSON.stringify(response.user));
        if (response.token) {
          localStorage.setItem("auth_token", response.token);
        }
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setOtpError(response.message);
      }
    } catch (error) {
      setOtpError("Failed to verify OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (cooldownTimer > 0) return;

    setOtpLoading(true);
    setOtpError("");

    try {
      const response: OTPResponse = await phoneOtpService.resendOTP(phoneNumber);

      if (response.success) {
        setOtpSent(true);
        setOtpTimer(300); // 5 minutes
        if (response.cooldownSeconds) {
          setCooldownTimer(response.cooldownSeconds);
        }
        setOtp("");
        setOtpSuccess("OTP resent successfully!");
        
        // Clear success message after 3 seconds
        setTimeout(() => setOtpSuccess(""), 3000);
      } else {
        setOtpError(response.message);
      }
    } catch (error) {
      setOtpError("Failed to resend OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Format timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  // Cooldown Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownTimer > 0) {
      interval = setInterval(() => {
        setCooldownTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownTimer]);

  // Auto-advance OTP input
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    
    // Auto-submit when 6 digits entered
    if (value.length === 6) {
      setTimeout(() => {
        handleVerifyOTP(e as any);
      }, 500);
    }
  };

  // Handle demo phone number selection
  const handleDemoPhone = (number: string) => {
    setPhoneNumber(number);
    setOtpError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <SecureMailLogo size="lg" variant="full" />
          </div>
          <p className="text-muted-foreground">
            Secure Phone Verification
          </p>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/login")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>

        {/* Main Card */}
        <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-red-200 dark:border-red-800 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl text-foreground">
              {step === "phone" && "Enter Phone Number"}
              {step === "otp" && "Enter OTP"}
              {step === "success" && "Verification Complete!"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {step === "phone" && "We'll send a secure 6-digit code to your phone"}
              {step === "otp" && `Enter the code sent to ${phoneNumber}`}
              {step === "success" && "Welcome to SecureMail!"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {otpError && (
              <Alert className="border-red-500/50 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{otpError}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {otpSuccess && (
              <Alert className="border-green-500/50 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{otpSuccess}</AlertDescription>
              </Alert>
            )}

            {/* Phone Number Step */}
            {step === "phone" && (
              <div className="space-y-4">
                {/* Demo Phone Numbers */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium text-center">
                    Quick Demo Access:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {demoNumbers.map((demo) => (
                      <Button
                        key={demo.number}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDemoPhone(demo.number)}
                        className="text-xs justify-start"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {demo.label}: {demo.number}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10 bg-white dark:bg-black border-red-200 dark:border-red-800 text-foreground focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your phone number with country code
                  </p>
                </div>

                {/* Send OTP Button */}
                <Button
                  type="button"
                  onClick={handleSendOTP}
                  className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-medium py-3 shadow-lg hover:shadow-xl hover:shadow-red-500/25 transition-all duration-200 transform hover:scale-105"
                  disabled={otpLoading || !phoneNumber.trim()}
                >
                  {otpLoading ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
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
            )}

            {/* OTP Verification Step */}
            {step === "otp" && (
              <div className="space-y-4">
                {/* Phone Number Display */}
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-muted-foreground">Sending OTP to:</p>
                  <p className="font-medium text-foreground">{phoneNumber}</p>
                </div>

                {/* OTP Input */}
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-foreground">
                      Enter 6-digit OTP
                    </Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={handleOtpChange}
                        className="pl-10 bg-white dark:bg-black border-red-200 dark:border-red-800 text-foreground focus:border-red-500 dark:focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all text-center text-lg font-mono tracking-widest"
                        maxLength={6}
                        required
                        autoFocus
                      />
                    </div>
                    
                    {/* Timer and Status */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {otpTimer > 0 ? (
                          `⏰ Expires in ${formatTimer(otpTimer)}`
                        ) : (
                          "⏰ OTP expired"
                        )}
                      </span>
                      <span>
                        {cooldownTimer > 0 ? (
                          `🔄 Cooldown: ${cooldownTimer}s`
                        ) : (
                          "✅ Ready to resend"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Verify Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-medium py-3 shadow-lg hover:shadow-xl hover:shadow-red-500/25 transition-all duration-200 transform hover:scale-105"
                    disabled={isVerifying || otpTimer === 0 || otp.length !== 6}
                  >
                    {isVerifying ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Verify OTP</span>
                      </div>
                    )}
                  </Button>

                  {/* Resend Button */}
                  {otpTimer === 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResendOTP}
                      className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                      disabled={otpLoading || cooldownTimer > 0}
                    >
                      {otpLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <MessageSquare className="w-4 h-4 mr-2" />
                      )}
                      {otpLoading ? "Sending..." : "Resend OTP"}
                    </Button>
                  )}

                  {/* Change Phone Number */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep("phone");
                      setOtpSent(false);
                      setOtp("");
                      setOtpTimer(0);
                      setCooldownTimer(0);
                    }}
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Use Different Phone Number
                  </Button>
                </form>
              </div>
            )}

            {/* Success Step */}
            {step === "success" && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    Phone Verified Successfully!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Redirecting to dashboard...
                  </p>
                </div>
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center space-y-2">
          <div className="bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-lg p-3 space-y-1 border border-red-200 dark:border-red-800 shadow-lg">
            <p className="text-xs text-muted-foreground font-medium">
              🔒 256-bit encryption • 🛡️ Rate limiting • 🔐 Secure verification
            </p>
            <p className="text-xs text-muted-foreground">
              Your phone number is protected with enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
