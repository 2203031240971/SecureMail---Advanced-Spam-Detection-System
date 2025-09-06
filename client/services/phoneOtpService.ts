export interface OTPRequest {
  phoneNumber: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  otp?: string;
  expiresAt?: string;
}

export interface OTPVerificationRequest {
  phoneNumber: string;
  otp: string;
}

export interface OTPVerificationResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    phoneNumber: string;
    name: string;
    email?: string;
  };
}

class PhoneOTPService {
  private apiBase = "/api/otp";
  private dummyUsers: Map<string, any> = new Map();

  constructor() {
    // Initialize dummy users for fallback
    this.dummyUsers.set('+1234567890', {
      id: 'user1',
      phoneNumber: '+1234567890',
      name: 'John Doe',
      email: 'john@example.com'
    });
    this.dummyUsers.set('+9876543210', {
      id: 'user2',
      phoneNumber: '+9876543210',
      name: 'Jane Smith',
      email: 'jane@example.com'
    });
  }

  // Generate 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via backend API
  async sendOTP(phoneNumber: string): Promise<OTPResponse> {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(phoneNumber)) {
        return {
          success: false,
          message: 'Invalid phone number format. Please use +1234567890 format.'
        };
      }

      // Try backend API first
      const response = await fetch(`${this.apiBase}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📱 OTP sent to ${phoneNumber} via API`);
        return data;
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        return errorData;
      }
    } catch (error) {
      console.error('Error sending OTP via API:', error);
      
      // Fallback to mock OTP for demo purposes
      console.log('Falling back to mock OTP service');
      return this.sendMockOTP(phoneNumber);
    }
  }

  // Mock OTP fallback
  private async sendMockOTP(phoneNumber: string): Promise<OTPResponse> {
    try {
      // Generate 6-digit OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log(`📱 Mock OTP sent to ${phoneNumber}: ${otp}`);

      return {
        success: true,
        message: `OTP sent successfully to ${phoneNumber} (Mock Mode)`,
        otp: otp, // In real app, don't return OTP in response
        expiresAt: expiresAt.toISOString()
      };
    } catch (error) {
      console.error('Error sending mock OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  // Verify OTP via backend API
  async verifyOTP(phoneNumber: string, otp: string): Promise<OTPVerificationResponse> {
    try {
      // Try backend API first
      const response = await fetch(`${this.apiBase}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ OTP verified via API for ${phoneNumber}`);
        return data;
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        return errorData;
      }
    } catch (error) {
      console.error('Error verifying OTP via API:', error);
      
      // Fallback to mock verification for demo purposes
      console.log('Falling back to mock OTP verification');
      return this.verifyMockOTP(phoneNumber, otp);
    }
  }

  // Mock OTP verification fallback
  private async verifyMockOTP(phoneNumber: string, otp: string): Promise<OTPVerificationResponse> {
    try {
      // Simple mock verification (in real app, this would check stored OTP)
      if (otp === '123456') {
        // Get or create user
        let user = this.dummyUsers.get(phoneNumber);
        if (!user) {
          // Create new user if not exists
          user = {
            id: `user_${Date.now()}`,
            phoneNumber,
            name: `User ${phoneNumber.slice(-4)}`,
            email: `${phoneNumber.slice(-4)}@example.com`
          };
          this.dummyUsers.set(phoneNumber, user);
        }

        return {
          success: true,
          message: 'OTP verified successfully! (Mock Mode)',
          user
        };
      } else {
        return {
          success: false,
          message: 'Invalid OTP. Please check and try again. (Mock Mode)'
        };
      }
    } catch (error) {
      console.error('Error in mock OTP verification:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      };
    }
  }

  // Validate phone number format
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic validation for +1234567890 format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  // Get OTP status from backend
  async getOTPStatus(phoneNumber: string): Promise<{
    success: boolean;
    hasOTP: boolean;
    remainingAttempts?: number;
    expiresIn?: number;
    message: string;
  }> {
    try {
      const response = await fetch(`${this.apiBase}/status/${encodeURIComponent(phoneNumber)}`);
      if (response.ok) {
        return await response.json();
      } else {
        return {
          success: false,
          hasOTP: false,
          message: 'Failed to get OTP status'
        };
      }
    } catch (error) {
      console.error('Error getting OTP status:', error);
      return {
        success: false,
        hasOTP: false,
        message: 'Failed to get OTP status'
      };
    }
  }

  // Resend OTP via backend API
  async resendOTP(phoneNumber: string): Promise<OTPResponse> {
    try {
      const response = await fetch(`${this.apiBase}/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📱 OTP resent to ${phoneNumber} via API`);
        return data;
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        return errorData;
      }
    } catch (error) {
      console.error('Error resending OTP via API:', error);
      return this.sendMockOTP(phoneNumber);
    }
  }
}

export const phoneOtpService = new PhoneOTPService();

// Export the service instance
export default phoneOtpService;
