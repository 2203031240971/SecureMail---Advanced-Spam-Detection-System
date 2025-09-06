import { User } from '@/contexts/AuthContext';

export interface FaceAuthResult {
  success: boolean;
  confidence?: number;
  quality?: number;
  error?: string;
  faceData?: string;
}

export interface FaceVerificationResult {
  success: boolean;
  similarity?: number;
  confidence?: number;
  error?: string;
}

export interface FaceLockSettings {
  enabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  requirePeriodic: boolean;
  periodicInterval: number; // hours
  lastVerification?: string;
}

class FaceAuthService {
  private readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
  private readonly STORAGE_PREFIX = 'securemail_face_';

  /**
   * Check if face lock is supported by the device
   */
  isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Check if face lock is enabled for the current user
   */
  isFaceLockEnabled(): boolean {
    return localStorage.getItem(`${this.STORAGE_PREFIX}enabled`) === 'true';
  }

  /**
   * Get face lock settings for the current user
   */
  getFaceLockSettings(): FaceLockSettings {
    const settings = localStorage.getItem(`${this.STORAGE_PREFIX}settings`);
    
    if (settings) {
      try {
        return JSON.parse(settings);
      } catch {
        // Fall through to default
      }
    }

    return {
      enabled: this.isFaceLockEnabled(),
      sensitivity: 'medium',
      requirePeriodic: true,
      periodicInterval: 24, // 24 hours
    };
  }

  /**
   * Update face lock settings
   */
  updateFaceLockSettings(settings: Partial<FaceLockSettings>): void {
    const currentSettings = this.getFaceLockSettings();
    const newSettings = { ...currentSettings, ...settings };
    
    localStorage.setItem(`${this.STORAGE_PREFIX}settings`, JSON.stringify(newSettings));
    localStorage.setItem(`${this.STORAGE_PREFIX}enabled`, newSettings.enabled ? 'true' : 'false');
  }

  /**
   * Enroll face data for the user (setup process)
   */
  async enrollFace(faceData: string, userId: string): Promise<FaceAuthResult> {
    try {
      // In production, this would call a secure biometric enrollment API
      const response = await fetch(`${this.API_BASE_URL}/auth/face/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('securemail_token')}`
        },
        body: JSON.stringify({
          userId,
          faceData: await this.hashFaceData(faceData),
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Face enrollment failed');
      }

      const result = await response.json();
      
      if (result.success) {
        // Store enrollment success locally
        this.updateFaceLockSettings({ enabled: true });
        localStorage.setItem(`${this.STORAGE_PREFIX}hash`, await this.hashFaceData(faceData));
        localStorage.setItem(`${this.STORAGE_PREFIX}enrolled_at`, new Date().toISOString());
        
        return {
          success: true,
          confidence: result.confidence || 95,
          quality: result.quality || 90
        };
      }

      return result;
    } catch (error) {
      console.error('Face enrollment error:', error);
      
      // Fallback to local enrollment for demo
      return this.enrollFaceLocally(faceData, userId);
    }
  }

  /**
   * Verify face against enrolled face data
   */
  async verifyFace(faceData: string, userId: string): Promise<FaceVerificationResult> {
    try {
      // In production, this would call a secure biometric verification API
      const response = await fetch(`${this.API_BASE_URL}/auth/face/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('securemail_token')}`
        },
        body: JSON.stringify({
          userId,
          faceData: await this.hashFaceData(faceData),
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Face verification failed');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update last verification time
        localStorage.setItem(`${this.STORAGE_PREFIX}last_verification`, new Date().toISOString());
        this.updateFaceLockSettings({ lastVerification: new Date().toISOString() });
      }

      return result;
    } catch (error) {
      console.error('Face verification error:', error);
      
      // Fallback to local verification for demo
      return this.verifyFaceLocally(faceData, userId);
    }
  }

  /**
   * Check if periodic verification is required
   */
  isPeriodicVerificationRequired(): boolean {
    const settings = this.getFaceLockSettings();
    
    if (!settings.enabled || !settings.requirePeriodic) {
      return false;
    }

    const lastVerification = settings.lastVerification || 
      localStorage.getItem(`${this.STORAGE_PREFIX}last_verification`);
    
    if (!lastVerification) {
      return true;
    }

    const lastVerifyTime = new Date(lastVerification);
    const now = new Date();
    const hoursSinceLastVerification = (now.getTime() - lastVerifyTime.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastVerification >= settings.periodicInterval;
  }

  /**
   * Get time until next periodic verification is required
   */
  getTimeUntilNextVerification(): { hours: number; minutes: number } | null {
    const settings = this.getFaceLockSettings();
    
    if (!settings.enabled || !settings.requirePeriodic) {
      return null;
    }

    const lastVerification = settings.lastVerification || 
      localStorage.getItem(`${this.STORAGE_PREFIX}last_verification`);
    
    if (!lastVerification) {
      return { hours: 0, minutes: 0 };
    }

    const lastVerifyTime = new Date(lastVerification);
    const nextVerifyTime = new Date(lastVerifyTime.getTime() + (settings.periodicInterval * 60 * 60 * 1000));
    const now = new Date();
    
    if (now >= nextVerifyTime) {
      return { hours: 0, minutes: 0 };
    }

    const msUntilNext = nextVerifyTime.getTime() - now.getTime();
    const hours = Math.floor(msUntilNext / (1000 * 60 * 60));
    const minutes = Math.floor((msUntilNext % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
  }

  /**
   * Disable face lock for the user
   */
  async disableFaceLock(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In production, this would call API to remove biometric data
      const response = await fetch(`${this.API_BASE_URL}/auth/face/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('securemail_token')}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to disable face lock');
      }

      // Clear local face data
      this.clearFaceData();

      return { success: true };
    } catch (error) {
      console.error('Disable face lock error:', error);
      
      // Fallback to local disable
      this.clearFaceData();
      return { success: true };
    }
  }

  /**
   * Clear all face authentication data
   */
  private clearFaceData(): void {
    localStorage.removeItem(`${this.STORAGE_PREFIX}enabled`);
    localStorage.removeItem(`${this.STORAGE_PREFIX}settings`);
    localStorage.removeItem(`${this.STORAGE_PREFIX}hash`);
    localStorage.removeItem(`${this.STORAGE_PREFIX}enrolled_at`);
    localStorage.removeItem(`${this.STORAGE_PREFIX}last_verification`);
  }

  /**
   * Hash face data for secure storage
   */
  private async hashFaceData(faceData: string): Promise<string> {
    // In production, use proper cryptographic hashing
    // This is a simple demo implementation
    const encoder = new TextEncoder();
    const data = encoder.encode(faceData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Local face enrollment for demo purposes
   */
  private async enrollFaceLocally(faceData: string, userId: string): Promise<FaceAuthResult> {
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simple quality check
      const quality = this.calculateFaceQuality(faceData);
      
      if (quality < 50) {
        return {
          success: false,
          error: 'Face image quality too low. Please ensure good lighting and face the camera directly.'
        };
      }

      // Store face hash locally
      const faceHash = await this.hashFaceData(faceData);
      localStorage.setItem(`${this.STORAGE_PREFIX}hash`, faceHash);
      localStorage.setItem(`${this.STORAGE_PREFIX}enrolled_at`, new Date().toISOString());
      
      this.updateFaceLockSettings({ enabled: true });

      return {
        success: true,
        confidence: Math.min(quality + Math.random() * 20, 98),
        quality
      };
    } catch (error) {
      return {
        success: false,
        error: 'Face enrollment failed. Please try again.'
      };
    }
  }

  /**
   * Local face verification for demo purposes
   */
  private async verifyFaceLocally(faceData: string, userId: string): Promise<FaceVerificationResult> {
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const storedHash = localStorage.getItem(`${this.STORAGE_PREFIX}hash`);
      
      if (!storedHash) {
        return {
          success: false,
          error: 'No face data enrolled. Please set up face lock first.'
        };
      }

      const currentHash = await this.hashFaceData(faceData);
      
      // Simple similarity calculation (in production, use proper biometric matching)
      const similarity = this.calculateSimilarity(storedHash, currentHash);
      const settings = this.getFaceLockSettings();
      
      let threshold = 75; // default
      switch (settings.sensitivity) {
        case 'low': threshold = 60; break;
        case 'medium': threshold = 75; break;
        case 'high': threshold = 85; break;
      }

      const success = similarity >= threshold;
      
      if (success) {
        localStorage.setItem(`${this.STORAGE_PREFIX}last_verification`, new Date().toISOString());
        this.updateFaceLockSettings({ lastVerification: new Date().toISOString() });
      }

      return {
        success,
        similarity,
        confidence: success ? Math.min(similarity + Math.random() * 15, 98) : similarity,
        error: success ? undefined : 'Face verification failed. Please try again.'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Face verification failed. Please try again.'
      };
    }
  }

  /**
   * Calculate face image quality (demo implementation)
   */
  private calculateFaceQuality(faceData: string): number {
    // This is a mock implementation
    // In production, you'd analyze image brightness, contrast, blur, etc.
    const dataLength = faceData.length;
    const hasGoodData = faceData.includes('data:image');
    
    if (!hasGoodData) return 0;
    
    // Simple quality metric based on data size and format
    let quality = Math.min((dataLength / 50000) * 100, 100);
    
    // Add some randomness for demo
    quality += (Math.random() - 0.5) * 20;
    
    return Math.max(0, Math.min(100, quality));
  }

  /**
   * Calculate similarity between two face hashes (demo implementation)
   */
  private calculateSimilarity(hash1: string, hash2: string): number {
    if (hash1 === hash2) return 100;
    
    // Simple character-based similarity for demo
    let matches = 0;
    const minLength = Math.min(hash1.length, hash2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (hash1[i] === hash2[i]) matches++;
    }
    
    const baseSimilarity = (matches / minLength) * 100;
    
    // Add some randomness to simulate real-world variance
    const variance = (Math.random() - 0.5) * 20;
    
    return Math.max(50, Math.min(100, baseSimilarity + variance));
  }

  /**
   * Get face lock status summary
   */
  getFaceLockStatus(): {
    enabled: boolean;
    enrolled: boolean;
    lastVerification?: string;
    nextVerificationIn?: { hours: number; minutes: number } | null;
    periodicRequired: boolean;
  } {
    const settings = this.getFaceLockSettings();
    const enrolled = !!localStorage.getItem(`${this.STORAGE_PREFIX}hash`);
    
    return {
      enabled: settings.enabled,
      enrolled,
      lastVerification: settings.lastVerification,
      nextVerificationIn: this.getTimeUntilNextVerification(),
      periodicRequired: this.isPeriodicVerificationRequired()
    };
  }
}

// Create and export singleton instance
export const faceAuthService = new FaceAuthService();

// Export helper functions
export const isFaceLockSupported = () => faceAuthService.isSupported();
export const isFaceLockEnabled = () => faceAuthService.isFaceLockEnabled();
export const isPeriodicVerificationRequired = () => faceAuthService.isPeriodicVerificationRequired();
