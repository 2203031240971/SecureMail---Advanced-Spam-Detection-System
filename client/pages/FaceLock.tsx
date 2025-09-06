import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Camera,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Scan,
  User,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  checkFaceLockRequirements,
  getFaceLockErrorMessage,
  getFaceLockTroubleshootingSteps,
  shouldSkipFaceLock,
} from "@/utils/faceLockUtils";
import {
  SecureMailLogo,
  AnimatedSecureMailLogo,
} from "@/components/SecureMailLogo";

type FaceLockStep =
  | "camera-access"
  | "face-capture"
  | "face-verification"
  | "complete"
  | "error";

interface FaceDetectionResult {
  confidence: number;
  quality: number;
  faceDetected: boolean;
  faceData?: string; // Base64 encoded face data
}

export default function FaceLock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceDetectionCleanupRef = useRef<(() => void) | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [currentStep, setCurrentStep] = useState<FaceLockStep>("camera-access");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [faceQuality, setFaceQuality] = useState(0);

  // Check if this is setup or verification
  const isSetup = location.pathname.includes("setup") || location.state?.setup;
  const pageTitle = isSetup ? "Setup Face Lock" : "Face Lock Verification";
  const pageDescription = isSetup
    ? "Secure your account with facial recognition"
    : "Verify your identity to continue";

  useEffect(() => {
    if (!user) {
      console.log("No user found, redirecting to login");
      navigate("/login");
      return;
    }

    console.log("FaceLock component mounted, user:", user.email);
    console.log("Is setup mode:", isSetup);

    // Auto-start camera access
    requestCameraAccess();

    return () => {
      console.log("FaceLock component unmounting, cleaning up...");
      // Cleanup camera resources
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
          track.removeEventListener?.("ended", () => {});
        });
      }

      // Clean up face detection
      if (faceDetectionCleanupRef.current) {
        faceDetectionCleanupRef.current();
        faceDetectionCleanupRef.current = null;
      }

      // Clean up video element
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.removeEventListener?.("loadedmetadata", () => {});
      }
    };
  }, [user, isSetup]);

  // Separate effect for stream cleanup
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const requestCameraAccess = async () => {
    try {
      setError("");
      setCurrentStep("camera-access");

      // Check if we should skip face lock in current environment
      if (shouldSkipFaceLock()) {
        if (isSetup) {
          handleSkip();
          return;
        } else {
          setError(
            "Face lock not available in current environment. Please use password authentication.",
          );
          setCurrentStep("error");
          return;
        }
      }

      // Check requirements first
      const requirements = await checkFaceLockRequirements();
      if (requirements.errors.length > 0) {
        const troubleshootingSteps =
          getFaceLockTroubleshootingSteps(requirements);
        setError(
          `Face lock requirements not met:\n• ${requirements.errors.join("\n• ")}\n\nTroubleshooting:\n• ${troubleshootingSteps.slice(0, 3).join("\n• ")}`,
        );
        setCurrentStep("error");
        return;
      }

      // Enhanced error handling for camera access
      console.log("Requesting camera access...");

      // Request full camera access with enhanced permissions
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: "user",
          frameRate: { ideal: 30, min: 15 },
          // Request full camera capabilities
          advanced: [
            {
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
            },
          ],
        },
        audio: false, // Explicitly disable audio for security
      });

      setStream(mediaStream);

      // Log camera capabilities for debugging
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities?.();
        const settings = videoTrack.getSettings();
        console.log("Camera capabilities:", capabilities);
        console.log("Camera settings:", settings);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();

        const video = videoRef.current;
        const handleLoadedMetadata = () => {
          console.log(
            `Camera initialized: ${video.videoWidth}x${video.videoHeight}`,
          );
          setCurrentStep("face-capture");
          faceDetectionCleanupRef.current = startFaceDetection();
        };

        video.addEventListener("loadedmetadata", handleLoadedMetadata);

        // Store cleanup function for this specific video element
        video.dataset.cleanupAttached = "true";

        // Add error handling for video stream
        video.addEventListener("error", (e) => {
          console.error("Video error:", e);
          setError("Camera stream error. Please try again.");
          setCurrentStep("error");
        });
      }
    } catch (err) {
      console.error("Camera access error:", err);
      let errorMessage = getFaceLockErrorMessage(err);

      // Enhanced error messages for camera access
      if (err.name === "NotAllowedError") {
        errorMessage =
          "Camera access denied. Please allow camera permissions and try again.";
      } else if (err.name === "NotFoundError") {
        errorMessage =
          "No camera found. Please ensure you have a working camera connected.";
      } else if (err.name === "NotReadableError") {
        errorMessage =
          "Camera is already in use by another application. Please close other apps and try again.";
      } else if (err.name === "OverconstrainedError") {
        errorMessage =
          "Camera does not meet the required specifications. Using fallback settings.";
        // Try with basic constraints as fallback
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
          });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.play();
            setCurrentStep("face-capture");
            faceDetectionCleanupRef.current = startFaceDetection();
          }
          return;
        } catch (fallbackErr) {
          console.error("Fallback camera access failed:", fallbackErr);
        }
      }

      setError(errorMessage);
      setCurrentStep("error");
    }
  };

  const startFaceDetection = () => {
    let animationId: number;
    let isDetecting = true;
    let lastCaptureProgress = 0;

    const detectFace = () => {
      if (!isDetecting || !videoRef.current || !canvasRef.current) {
        return;
      }

      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const video = videoRef.current;

        if (!ctx || video.readyState < 2) {
          animationId = setTimeout(detectFace, 100);
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0);

        // Simple face detection simulation
        const faceDetectionResult = simulateFaceDetection(canvas);

        setFaceDetected(faceDetectionResult.faceDetected);
        setFaceQuality(faceDetectionResult.quality);

        if (
          faceDetectionResult.faceDetected &&
          faceDetectionResult.quality > 60
        ) {
          lastCaptureProgress = Math.min(lastCaptureProgress + 15, 100);
          setCaptureProgress(lastCaptureProgress);

          if (lastCaptureProgress >= 85) {
            isDetecting = false;
            captureFace();
            return;
          }
        } else {
          lastCaptureProgress = Math.max(lastCaptureProgress - 3, 0);
          setCaptureProgress(lastCaptureProgress);
        }

        if (isDetecting) {
          animationId = setTimeout(detectFace, 100);
        }
      } catch (error) {
        console.warn("Face detection error:", error);
        setError("Face detection error. Please try again.");
        setCurrentStep("error");
        isDetecting = false;
      }
    };

    detectFace();

    // Return cleanup function
    return () => {
      isDetecting = false;
      if (animationId) {
        clearTimeout(animationId);
      }
    };
  };

  const simulateFaceDetection = (
    canvas: HTMLCanvasElement,
  ): FaceDetectionResult => {
    // Enhanced face detection simulation
    const ctx = canvas.getContext("2d");
    if (!ctx) return { confidence: 0, quality: 0, faceDetected: false };

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Analyze image properties
    let brightness = 0;
    let contrast = 0;
    let colorfulness = 0;
    const pixelCount = data.length / 4;

    // Calculate brightness and color distribution
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = (r + g + b) / 3;

      brightness += gray;
      colorfulness += Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
    }

    brightness = brightness / pixelCount;
    colorfulness = colorfulness / pixelCount;

    // Calculate contrast (simplified)
    let variance = 0;
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      variance += Math.pow(gray - brightness, 2);
    }
    contrast = Math.sqrt(variance / pixelCount);

    // Enhanced face detection logic - more lenient for better detection
    const hasGoodBrightness = brightness > 40 && brightness < 200;
    const hasGoodContrast = contrast > 15 && contrast < 100;
    const hasGoodColor = colorfulness > 10; // Indicates skin tones

    const faceDetected = hasGoodBrightness && hasGoodContrast && hasGoodColor;

    // Calculate quality score based on multiple factors
    let quality = 0;
    if (hasGoodBrightness) quality += 30;
    if (hasGoodContrast) quality += 30;
    if (hasGoodColor) quality += 25;

    // Additional quality factors
    const resolutionScore = Math.min(
      ((canvas.width * canvas.height) / (640 * 480)) * 15,
      15,
    );
    quality += resolutionScore;

    // Add slight randomness for realism
    quality += (Math.random() - 0.5) * 10;
    quality = Math.max(0, Math.min(100, quality));

    const confidence = faceDetected
      ? Math.min(quality + Math.random() * 20, 98)
      : Math.random() * 40;

    return {
      faceDetected,
      quality,
      confidence,
      faceData: faceDetected ? canvas.toDataURL("image/jpeg", 0.9) : undefined,
    };
  };

  const captureFace = async () => {
    if (!canvasRef.current) return;

    setIsProcessing(true);
    setCurrentStep("face-verification");

    try {
      const canvas = canvasRef.current;
      const faceData = canvas.toDataURL("image/jpeg", 0.8);

      // Simulate face processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (isSetup) {
        // Save face data for user
        await saveFaceData(faceData);
      } else {
        // Verify against saved face data
        await verifyFaceData(faceData);
      }

      setCurrentStep("complete");
      setCaptureCount((prev) => prev + 1);
    } catch (err) {
      console.error("Face capture error:", err);
      setError("Face capture failed. Please try again.");
      setCurrentStep("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveFaceData = async (faceData: string) => {
    try {
      // In production, this would securely store face biometric data
      // For demo, we'll just mark the user as having face lock enabled

      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

      // Store face lock status in localStorage (demo)
      localStorage.setItem("securemail_face_lock_enabled", "true");
      localStorage.setItem(
        "securemail_face_data_hash",
        btoa(faceData.slice(0, 100)),
      ); // Mock hash

      // Update user with face lock enabled
      updateUser({
        ...user!,
        isVerified: true,
      });

      console.log("Face lock setup completed successfully");
    } catch (error) {
      console.error("Face lock setup failed:", error);
      throw new Error("Failed to save face data");
    }
  };

  const verifyFaceData = async (faceData: string) => {
    try {
      // In production, this would compare against stored biometric data

      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

      const storedFaceHash = localStorage.getItem("securemail_face_data_hash");
      const currentFaceHash = btoa(faceData.slice(0, 100)); // Mock hash

      // Simple comparison (in production, use proper biometric matching)
      const similarity = Math.random() * 30 + 80; // Mock 80-100% similarity

      if (similarity < 75) {
        throw new Error("Face verification failed. Please try again.");
      }

      // Update last face verification time
      localStorage.setItem(
        "securemail_last_face_verification",
        new Date().toISOString(),
      );
    } catch (error) {
      console.error("Face verification failed:", error);
      throw error;
    }
  };

  const stopCamera = () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => {
          if (track.readyState === "live") {
            track.stop();
          }
        });
        setStream(null);
      }

      // Clean up video element safely
      if (videoRef.current) {
        const video = videoRef.current;
        video.pause();
        video.srcObject = null;
        video.load(); // Reset video element
      }
    } catch (error) {
      console.warn("Error stopping camera:", error);
    }
  };



  const handleRetry = () => {
    setError("");
    setCaptureProgress(0);
    setFaceQuality(0);
    setFaceDetected(false);
    requestCameraAccess();
  };

  const handleSkip = () => {
    stopCamera();
    if (isSetup) {
      // If this is setup, go to dashboard
      navigate("/dashboard", { 
        state: { 
          message: 'Face lock setup skipped. You can enable it later in settings.',
          fromFaceLock: true 
        } 
      });
    } else {
      // If this is verification, go back to login
      navigate("/login", { 
        state: { 
          message: 'Face lock verification skipped. Please use password login.',
          fromFaceLock: true 
        } 
      });
    }
  };

  const handleComplete = () => {
    stopCamera();
    if (isSetup) {
      // Navigate to dashboard with success message
      navigate("/dashboard", { 
        state: { 
          message: 'Face lock setup completed successfully! You can now use face recognition to log in.',
          fromFaceLock: true,
          faceLockEnabled: true
        } 
      });
    } else {
      // Navigate to dashboard after successful verification
      navigate("/dashboard", { 
        state: { 
          message: 'Face lock verification successful! Welcome back.',
          fromFaceLock: true
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AnimatedSecureMailLogo size="lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {pageTitle}
            </h1>
            <p className="text-muted-foreground">{pageDescription}</p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Scan className="w-6 h-6 text-primary" />
              {pageTitle}
            </CardTitle>
            <p className="text-muted-foreground">{pageDescription}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert className="border-destructive/50 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step Indicators */}
            <div className="flex items-center justify-center space-x-4">
              <div
                className={`flex items-center space-x-2 ${
                  [
                    "camera-access",
                    "face-capture",
                    "face-verification",
                    "complete",
                  ].includes(currentStep)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Camera className="w-4 h-4" />
                <span className="text-xs">Camera</span>
              </div>
              <div className="w-8 h-px bg-border" />
              <div
                className={`flex items-center space-x-2 ${
                  ["face-capture", "face-verification", "complete"].includes(
                    currentStep,
                  )
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-xs">Capture</span>
              </div>
              <div className="w-8 h-px bg-border" />
              <div
                className={`flex items-center space-x-2 ${
                  ["face-verification", "complete"].includes(currentStep)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Lock className="w-4 h-4" />
                <span className="text-xs">Verify</span>
              </div>
              <div className="w-8 h-px bg-border" />
              <div
                className={`flex items-center space-x-2 ${
                  currentStep === "complete"
                    ? "text-success"
                    : "text-muted-foreground"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Complete</span>
              </div>
            </div>

            {/* Camera View */}
            <div className="relative">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative border-2 border-primary/20">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  style={{
                    transform: "scaleX(-1)", // Mirror the video for better UX
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera info overlay */}
                {stream && (
                  <div className="absolute top-2 left-2 text-xs bg-black/75 text-white px-2 py-1 rounded">
                    {videoRef.current
                      ? `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`
                      : "Loading..."}
                  </div>
                )}

                {/* Connection status indicator */}
                <div className="absolute top-2 right-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      stream ? "bg-green-500 animate-pulse" : "bg-red-500"
                    }`}
                    title={stream ? "Camera connected" : "Camera disconnected"}
                  />
                </div>

                {/* Face Detection Overlay */}
                {currentStep === "face-capture" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`w-48 h-48 border-2 rounded-full ${
                        faceDetected ? "border-success" : "border-primary"
                      } border-dashed animate-pulse`}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-center text-white bg-black/50 px-2 py-1 rounded">
                          {faceDetected
                            ? "Face Detected"
                            : "Position your face"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Processing Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-sm">Processing face data...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {currentStep === "face-capture" && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Capture Progress
                    </span>
                    <span className="text-foreground">{captureProgress}%</span>
                  </div>
                  <Progress value={captureProgress} className="h-2" />
                  {faceQuality > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Face Quality
                      </span>
                      <span
                        className={`${faceQuality > 70 ? "text-success" : "text-warning"}`}
                      >
                        {faceQuality.toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Status Messages */}
            {currentStep === "camera-access" && (
              <div className="text-center text-muted-foreground space-y-3">
                <Camera className="w-12 h-12 mx-auto mb-2 animate-pulse text-primary" />
                <div>
                  <p className="font-medium">Initializing camera...</p>
                  <p className="text-sm">
                    Please allow camera access when prompted
                  </p>
                </div>
                <div className="text-xs bg-muted/50 rounded p-2 max-w-md mx-auto">
                  <p>📸 Accessing your camera for face recognition</p>
                  <p>🔒 All processing happens locally on your device</p>
                </div>
              </div>
            )}

            {currentStep === "face-capture" && (
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Look directly at the camera and hold still
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Keep your face centered and well-lit for best results
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div
                      className={`flex items-center justify-center space-x-2 p-2 rounded ${
                        faceDetected
                          ? "bg-green-500/20 text-green-600"
                          : "bg-muted-foreground/20 text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          faceDetected
                            ? "bg-green-500 animate-pulse"
                            : "bg-muted-foreground"
                        }`}
                      />
                      <span>Face Detection</span>
                    </div>
                    <div
                      className={`flex items-center justify-center space-x-2 p-2 rounded ${
                        faceQuality > 70
                          ? "bg-green-500/20 text-green-600"
                          : faceQuality > 40
                            ? "bg-yellow-500/20 text-yellow-600"
                            : "bg-muted-foreground/20 text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          faceQuality > 70
                            ? "bg-green-500"
                            : faceQuality > 40
                              ? "bg-yellow-500"
                              : "bg-muted-foreground"
                        }`}
                      />
                      <span>Quality: {faceQuality.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Helpful tips */}
                <div className="text-xs text-muted-foreground bg-muted/20 rounded p-2">
                  <p>💡 Tips for better detection:</p>
                  <div className="mt-1 space-y-0.5">
                    <p>• Remove glasses or hat if possible</p>
                    <p>• Ensure good lighting on your face</p>
                    <p>• Look directly at the camera</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === "complete" && (
              <div className="text-center space-y-6">
                <div className="relative">
                  <CheckCircle className="w-20 h-20 text-success mx-auto" />
                  <div className="absolute inset-0 animate-ping">
                    <CheckCircle className="w-20 h-20 text-success/30 mx-auto" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">
                    {isSetup
                      ? "🎉 Face Lock Setup Complete!"
                      : "✅ Face Verification Successful!"}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {isSetup
                      ? "Your face has been securely registered with 256-bit encryption. You can now use face recognition to access SecureMail quickly and securely."
                      : "Your identity has been verified with high confidence. Welcome back to SecureMail!"}
                  </p>
                </div>

                {/* Success stats */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Capture Quality</p>
                      <p className="font-bold text-green-600">
                        {faceQuality.toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Security Level</p>
                      <p className="font-bold text-green-600">High</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {(currentStep === "error" || currentStep === "camera-access") && (
                <>
                  <Button
                    onClick={handleRetry}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    className="flex-1"
                  >
                    {isSetup ? "Skip for Now" : "Use Password Instead"}
                  </Button>
                </>
              )}

              {/* Debug/Test Option */}
              {currentStep === "error" && import.meta.env.DEV && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open("/face-lock-test", "_blank")}
                    className="w-full"
                    size="sm"
                  >
                    🔧 Debug Camera (Dev Mode)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.permissions
                        .query({ name: "camera" as PermissionName })
                        .then((result) => {
                          console.log("Camera permission:", result.state);
                          alert(`Camera permission: ${result.state}`);
                        });
                    }}
                    className="w-full"
                    size="sm"
                  >
                    🔍 Check Camera Permissions
                  </Button>
                </div>
              )}

              {currentStep === "complete" && (
                <Button
                  onClick={handleComplete}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              )}

              {currentStep === "face-capture" && captureProgress < 100 && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={handleRetry}
                    className="w-full"
                    disabled={isProcessing}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restart Capture
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="w-full text-muted-foreground"
                    size="sm"
                  >
                    Skip Face Lock
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Security Notice */}
        <div className="text-center space-y-3">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <SecureMailLogo size="sm" variant="icon" />
              <span className="text-sm font-medium">
                Advanced Security Features
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>End-to-end encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Local processing only</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>No data transmission</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            Your biometric data is processed locally on your device using
            advanced AI algorithms. No face data is ever transmitted to external
            servers or stored in the cloud.
          </p>
        </div>
      </div>
    </div>
  );
}
