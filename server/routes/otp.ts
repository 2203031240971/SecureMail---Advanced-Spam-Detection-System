import { Request, Response } from "express";
import crypto from "crypto";

// In-memory OTP store (use Redis in production)
interface OTPData {
  otp: string;
  phoneNumber: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  cooldownUntil?: Date;
}

const otpStore = new Map<string, OTPData>();
const phoneCooldowns = new Map<string, Date>();

// Configuration
const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  MAX_ATTEMPTS: 3,
  COOLDOWN_SECONDS: 30,
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 3,
};

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Generate secure OTP
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Hash OTP for storage
function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

// Check rate limiting
function checkRateLimit(phoneNumber: string): boolean {
  const now = Date.now();
  const key = `rate_limit_${phoneNumber}`;
  const limit = rateLimitStore.get(key);

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + OTP_CONFIG.RATE_LIMIT_WINDOW });
    return true;
  }

  if (limit.count >= OTP_CONFIG.MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  limit.count++;
  return true;
}

// Check cooldown
function checkCooldown(phoneNumber: string): boolean {
  const cooldown = phoneCooldowns.get(phoneNumber);
  if (!cooldown) return true;
  
  return new Date() > cooldown;
}

// Clean expired OTPs
function cleanExpiredOTPs() {
  const now = new Date();
  for (const [key, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(key);
    }
  }
}

// Clean expired rate limits
function cleanExpiredRateLimits() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean expired cooldowns
function cleanExpiredCooldowns() {
  const now = new Date();
  for (const [key, cooldown] of phoneCooldowns.entries()) {
    if (now > cooldown) {
      phoneCooldowns.delete(key);
    }
  }
}

// Cleanup every minute
setInterval(cleanExpiredOTPs, 60000);
setInterval(cleanExpiredRateLimits, 60000);
setInterval(cleanExpiredCooldowns, 60000);

// Send OTP endpoint
export async function sendOTP(req: Request, res: Response) {
  try {
    const { phoneNumber } = req.body;

    // Validate phone number
    if (!phoneNumber || !/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format. Use +1234567890 format."
      });
    }

    // Check rate limiting
    if (!checkRateLimit(phoneNumber)) {
      return res.status(429).json({
        success: false,
        message: "Too many OTP requests. Please wait before requesting another."
      });
    }

    // Check cooldown
    if (!checkCooldown(phoneNumber)) {
      const cooldown = phoneCooldowns.get(phoneNumber);
      const remaining = Math.ceil((cooldown!.getTime() - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remaining} seconds before requesting another OTP.`
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);

    // Store OTP data
    otpStore.set(phoneNumber, {
      otp: hashedOTP,
      phoneNumber,
      expiresAt,
      attempts: 0,
      maxAttempts: OTP_CONFIG.MAX_ATTEMPTS,
    });

    // Set cooldown
    const cooldownUntil = new Date(Date.now() + OTP_CONFIG.COOLDOWN_SECONDS * 1000);
    phoneCooldowns.set(phoneNumber, cooldownUntil);

    // In production, integrate with SMS service (Twilio, Firebase, etc.)
    console.log(`📱 OTP sent to ${phoneNumber}: ${otp}`);
    console.log(`⏰ Expires at: ${expiresAt.toISOString()}`);

    // For demo purposes, return OTP in response (remove in production)
    res.json({
      success: true,
      message: `OTP sent successfully to ${phoneNumber}`,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
      expiresAt: expiresAt.toISOString(),
      cooldownSeconds: OTP_CONFIG.COOLDOWN_SECONDS,
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again."
    });
  }
}

// Verify OTP endpoint
export async function verifyOTP(req: Request, res: Response) {
  try {
    const { phoneNumber, otp } = req.body;

    // Validate input
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required."
      });
    }

    // Get stored OTP data
    const storedData = otpStore.get(phoneNumber);
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "No OTP found for this phone number. Please request a new OTP."
      });
    }

    // Check if OTP is expired
    if (new Date() > storedData.expiresAt) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP."
      });
    }

    // Check if max attempts exceeded
    if (storedData.attempts >= storedData.maxAttempts) {
      otpStore.delete(phoneNumber);
      return res.status(400).json({
        success: false,
        message: "Maximum verification attempts exceeded. Please request a new OTP."
      });
    }

    // Increment attempts
    storedData.attempts++;

    // Verify OTP
    const hashedInputOTP = hashOTP(otp);
    if (storedData.otp !== hashedInputOTP) {
      const remainingAttempts = storedData.maxAttempts - storedData.attempts;
      
      if (remainingAttempts <= 0) {
        otpStore.delete(phoneNumber);
        return res.status(400).json({
          success: false,
          message: "Maximum verification attempts exceeded. Please request a new OTP."
        });
      }

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`
      });
    }

    // OTP verified successfully
    otpStore.delete(phoneNumber);

    // Generate JWT token (in production, use proper JWT library)
    const token = crypto.randomBytes(32).toString('hex');

    // Get or create user
    const user = {
      id: `user_${Date.now()}`,
      phoneNumber,
      name: `User ${phoneNumber.slice(-4)}`,
      email: `${phoneNumber.slice(-4)}@example.com`,
      verified: true,
      verifiedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: "OTP verified successfully!",
      user,
      token,
      expiresIn: "24h",
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again."
    });
  }
}

// Resend OTP endpoint
export async function resendOTP(req: Request, res: Response) {
  try {
    const { phoneNumber } = req.body;

    // Validate phone number
    if (!phoneNumber || !/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format."
      });
    }

    // Check cooldown
    if (!checkCooldown(phoneNumber)) {
      const cooldown = phoneCooldowns.get(phoneNumber);
      const remaining = Math.ceil((cooldown!.getTime() - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remaining} seconds before requesting another OTP.`
      });
    }

    // Remove existing OTP
    otpStore.delete(phoneNumber);

    // Call send OTP logic
    return sendOTP(req, res);

  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP. Please try again."
    });
  }
}

// OTP status endpoint
export async function getOTPStatus(req: Request, res: Response) {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required."
      });
    }

    const storedData = otpStore.get(phoneNumber);
    if (!storedData) {
      return res.json({
        success: true,
        hasOTP: false,
        message: "No active OTP found."
      });
    }

    const now = new Date();
    const isExpired = now > storedData.expiresAt;
    const remainingAttempts = storedData.maxAttempts - storedData.attempts;
    const timeUntilExpiry = Math.max(0, storedData.expiresAt.getTime() - now.getTime());

    if (isExpired) {
      otpStore.delete(phoneNumber);
      return res.json({
        success: true,
        hasOTP: false,
        message: "OTP has expired."
      });
    }

    res.json({
      success: true,
      hasOTP: true,
      remainingAttempts,
      expiresIn: Math.ceil(timeUntilExpiry / 1000), // seconds
      message: "Active OTP found."
    });

  } catch (error) {
    console.error('Error getting OTP status:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get OTP status."
    });
  }
}
