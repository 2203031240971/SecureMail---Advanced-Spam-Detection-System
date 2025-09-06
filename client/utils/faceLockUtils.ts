/**
 * Utility functions for face lock debugging and validation
 */

export interface FaceLockRequirements {
  hasCamera: boolean;
  hasMediaDevices: boolean;
  hasGetUserMedia: boolean;
  isSecureContext: boolean;
  isHTTPS: boolean;
  browserSupported: boolean;
  errors: string[];
}

/**
 * Check if all requirements for face lock are met
 */
export async function checkFaceLockRequirements(): Promise<FaceLockRequirements> {
  const errors: string[] = [];
  
  // Check if browser supports media devices
  const hasMediaDevices = !!(navigator.mediaDevices);
  if (!hasMediaDevices) {
    errors.push('Browser does not support Media Devices API');
  }

  // Check if getUserMedia is available
  const hasGetUserMedia = !!(navigator.mediaDevices?.getUserMedia);
  if (!hasGetUserMedia) {
    errors.push('Browser does not support getUserMedia');
  }

  // Check if running in secure context (HTTPS or localhost)
  const isSecureContext = window.isSecureContext;
  if (!isSecureContext) {
    errors.push('Camera access requires HTTPS or localhost');
  }

  // Check protocol
  const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  if (!isHTTPS) {
    errors.push('Face lock requires HTTPS connection');
  }

  // Check browser compatibility
  const browserSupported = checkBrowserSupport();
  if (!browserSupported) {
    errors.push('Browser not fully supported for face lock');
  }

  // Test camera availability
  let hasCamera = false;
  if (hasMediaDevices && hasGetUserMedia) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      hasCamera = videoDevices.length > 0;
      
      if (!hasCamera) {
        errors.push('No camera devices found');
      }
    } catch (error) {
      errors.push(`Camera check failed: ${error.message}`);
    }
  }

  return {
    hasCamera,
    hasMediaDevices,
    hasGetUserMedia,
    isSecureContext,
    isHTTPS,
    browserSupported,
    errors
  };
}

/**
 * Check if current browser supports face lock features
 */
export function checkBrowserSupport(): boolean {
  // Check for required APIs
  const hasMediaDevices = !!(navigator.mediaDevices);
  const hasGetUserMedia = !!(navigator.mediaDevices?.getUserMedia);
  const hasCanvas = !!(document.createElement('canvas').getContext);
  const hasLocalStorage = !!(window.localStorage);
  const hasCrypto = !!(window.crypto?.subtle);

  return hasMediaDevices && hasGetUserMedia && hasCanvas && hasLocalStorage && hasCrypto;
}

/**
 * Test camera access without starting face detection
 */
export async function testCameraAccess(): Promise<{ success: boolean; error?: string; stream?: MediaStream }> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      }
    });

    return { success: true, stream };
  } catch (error) {
    let errorMessage = 'Camera access failed';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Camera access denied. Please allow camera permissions.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No camera found. Please connect a camera and try again.';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Camera is in use by another application.';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = 'Camera constraints not supported.';
    } else if (error.name === 'SecurityError') {
      errorMessage = 'Camera access blocked by security policy.';
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Get user-friendly error messages for face lock issues
 */
export function getFaceLockErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.name) {
    switch (error.name) {
      case 'NotAllowedError':
        return 'Camera permission denied. Please click the camera icon in your browser\'s address bar and allow camera access.';
      case 'NotFoundError':
        return 'No camera found. Please make sure your device has a camera connected.';
      case 'NotReadableError':
        return 'Camera is currently in use. Please close other applications using the camera and try again.';
      case 'OverconstrainedError':
        return 'Camera does not support the required settings. Please try with a different camera.';
      case 'SecurityError':
        return 'Camera access is blocked. Please use HTTPS or localhost to enable camera access.';
      case 'AbortError':
        return 'Camera access was interrupted. Please try again.';
      default:
        return `Camera error: ${error.name} - ${error.message || 'Unknown error'}`;
    }
  }

  return error?.message || 'An unknown error occurred with face lock.';
}

/**
 * Generate troubleshooting steps for face lock issues
 */
export function getFaceLockTroubleshootingSteps(requirements: FaceLockRequirements): string[] {
  const steps: string[] = [];

  if (!requirements.isHTTPS) {
    steps.push('Access the site using HTTPS (camera access requires secure connection)');
  }

  if (!requirements.hasCamera) {
    steps.push('Connect a camera to your device');
    steps.push('Check if another application is using the camera');
  }

  if (!requirements.browserSupported) {
    steps.push('Use a modern browser like Chrome, Firefox, Safari, or Edge');
    steps.push('Update your browser to the latest version');
  }

  if (requirements.errors.some(e => e.includes('permission'))) {
    steps.push('Click the camera icon in your browser\'s address bar');
    steps.push('Select "Allow" for camera permissions');
    steps.push('Refresh the page after granting permissions');
  }

  // General troubleshooting
  steps.push('Try refreshing the page');
  steps.push('Restart your browser');
  steps.push('Check if your camera works in other applications');

  return steps;
}

/**
 * Check if face lock should be skipped based on environment
 */
export function shouldSkipFaceLock(): boolean {
  // Skip in development if camera is not available
  if (import.meta.env.DEV) {
    return !navigator.mediaDevices?.getUserMedia;
  }

  // Skip if not in secure context
  if (!window.isSecureContext) {
    return true;
  }

  return false;
}
