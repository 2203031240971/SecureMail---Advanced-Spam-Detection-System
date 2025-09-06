import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CheckCircle, AlertTriangle } from 'lucide-react';

export default function FaceLockTest() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState('');
  const [cameraStatus, setCameraStatus] = useState('');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    checkDeviceCapabilities();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkDeviceCapabilities = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera access not supported in this browser');
        return;
      }

      // Get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      setDeviceInfo({
        hasMediaDevices: !!navigator.mediaDevices,
        hasGetUserMedia: !!navigator.mediaDevices.getUserMedia,
        videoDevices: videoDevices.length,
        isSecureContext: window.isSecureContext,
        protocol: window.location.protocol
      });

      setCameraStatus(`Found ${videoDevices.length} video device(s)`);
    } catch (err) {
      console.error('Device check error:', err);
      setError(`Device check failed: ${err.message}`);
    }
  };

  const testCameraAccess = async () => {
    try {
      setError('');
      setCameraStatus('Requesting camera access...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      setStream(mediaStream);
      setCameraStatus('Camera access granted!');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
    } catch (err) {
      console.error('Camera access error:', err);
      setError(`Camera access failed: ${err.name} - ${err.message}`);
      setCameraStatus('Camera access denied');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraStatus('Camera stopped');
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-center">Face Lock Diagnostic Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Device Info */}
            {deviceInfo && (
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold">Device Capabilities:</h3>
                <ul className="text-sm space-y-1">
                  <li>📱 Media Devices API: {deviceInfo.hasMediaDevices ? '✅' : '❌'}</li>
                  <li>📷 getUserMedia: {deviceInfo.hasGetUserMedia ? '✅' : '❌'}</li>
                  <li>🎥 Video Devices: {deviceInfo.videoDevices}</li>
                  <li>🔒 Secure Context: {deviceInfo.isSecureContext ? '✅' : '❌'}</li>
                  <li>🌐 Protocol: {deviceInfo.protocol}</li>
                </ul>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert className="border-destructive/50 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Status */}
            {cameraStatus && (
              <Alert className="border-primary/50 text-primary">
                <Camera className="h-4 w-4" />
                <AlertDescription>{cameraStatus}</AlertDescription>
              </Alert>
            )}

            {/* Camera Feed */}
            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              {!stream && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Camera className="w-12 h-12 mx-auto mb-2" />
                    <p>No camera feed</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <Button
                onClick={testCameraAccess}
                disabled={!!stream}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                Test Camera Access
              </Button>
              
              <Button
                onClick={stopCamera}
                disabled={!stream}
                variant="outline"
                className="flex-1"
              >
                Stop Camera
              </Button>
            </div>

            {/* Instructions */}
            <div className="text-sm text-muted-foreground space-y-2">
              <h4 className="font-semibold">Troubleshooting:</h4>
              <ul className="space-y-1">
                <li>• Make sure you're using HTTPS (required for camera access)</li>
                <li>• Allow camera permissions when prompted</li>
                <li>• Check if another app is using the camera</li>
                <li>• Try refreshing the page if camera access fails</li>
                <li>• Ensure your browser supports camera access</li>
              </ul>
            </div>

            {/* Success Message */}
            {stream && (
              <Alert className="border-success/50 text-success">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  ✅ Camera is working! Face lock should function properly.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
