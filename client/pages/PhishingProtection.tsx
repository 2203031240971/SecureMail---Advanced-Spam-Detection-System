import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  Shield, 
  AlertTriangle, 
  Eye, 
  QrCode, 
  FileImage, 
  FileVideo,
  Scan,
  CheckCircle,
  XCircle,
  Brain,
  Zap,
  Camera,
  Download,
  RefreshCw,
  BarChart3
} from 'lucide-react';

interface DeepfakeResult {
  confidence: number;
  isDeepfake: boolean;
  analysisDetails: {
    faceConsistency: number;
    temporalAnomalies: number;
    compressionArtifacts: number;
    eyeMovement: number;
  };
  metadata: {
    duration?: number;
    resolution: string;
    format: string;
  };
}

interface QRResult {
  url: string;
  threatLevel: 'safe' | 'suspicious' | 'dangerous';
  analysisDetails: {
    domainAge: number;
    reputation: number;
    malwareDetection: boolean;
    phishingIndicators: string[];
  };
  confidence: number;
}

const PhishingProtection: React.FC = () => {
  const [deepfakeFile, setDeepfakeFile] = useState<File | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [deepfakeResult, setDeepfakeResult] = useState<DeepfakeResult | null>(null);
  const [qrResult, setQrResult] = useState<QRResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  
  const deepfakeInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  // Mock analysis function for deepfake detection
  const analyzeDeepfake = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate analysis progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setAnalysisProgress(i);
    }
    
    // Mock result based on filename or random
    const isDeepfake = Math.random() > 0.7 || file.name.toLowerCase().includes('fake');
    
    const result: DeepfakeResult = {
      confidence: Math.random() * 40 + (isDeepfake ? 60 : 20),
      isDeepfake,
      analysisDetails: {
        faceConsistency: Math.random() * 100,
        temporalAnomalies: Math.random() * 100,
        compressionArtifacts: Math.random() * 100,
        eyeMovement: Math.random() * 100,
      },
      metadata: {
        duration: file.type.includes('video') ? Math.floor(Math.random() * 300) : undefined,
        resolution: '1920x1080',
        format: file.type.split('/')[1].toUpperCase(),
      }
    };
    
    setDeepfakeResult(result);
    setIsAnalyzing(false);
  }, []);

  // Mock QR code analysis
  const analyzeQR = useCallback(async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setAnalysisProgress(i);
    }
    
    const threatLevels: ('safe' | 'suspicious' | 'dangerous')[] = ['safe', 'suspicious', 'dangerous'];
    const threatLevel = threatLevels[Math.floor(Math.random() * 3)];
    
    const result: QRResult = {
      url: 'https://suspicious-domain.example.com/login',
      threatLevel,
      analysisDetails: {
        domainAge: Math.floor(Math.random() * 365),
        reputation: Math.random() * 100,
        malwareDetection: threatLevel === 'dangerous',
        phishingIndicators: threatLevel !== 'safe' ? ['Suspicious URL structure', 'Domain recently registered'] : [],
      },
      confidence: Math.random() * 30 + 70,
    };
    
    setQrResult(result);
    setIsAnalyzing(false);
  }, []);

  const handleDeepfakeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDeepfakeFile(file);
      analyzeDeepfake(file);
    }
  };

  const handleQRUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setQrFile(file);
      analyzeQR(file);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'safe': return 'text-green-400';
      case 'suspicious': return 'text-yellow-400';
      case 'dangerous': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getThreatBadgeColor = (level: string) => {
    switch (level) {
      case 'safe': return 'bg-green-600';
      case 'suspicious': return 'bg-yellow-600';
      case 'dangerous': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-500" />
            Next-Gen Phishing Protection
          </h1>
          <p className="text-gray-400 mt-2">AI-powered deepfake detection and QR code threat analysis</p>
        </div>
        <div className="flex gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-400">AI Models Active</p>
                  <p className="text-xl font-bold text-white">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-xl font-bold text-white">98.7%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Alert className="bg-blue-900/50 border-blue-700">
          <Zap className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-100">
            <div className="flex items-center justify-between mb-2">
              <span>AI Analysis in Progress...</span>
              <span className="font-bold">{analysisProgress}%</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="deepfake" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="deepfake" className="data-[state=active]:bg-red-600">
            <FileVideo className="w-4 h-4 mr-2" />
            Deepfake Detection
          </TabsTrigger>
          <TabsTrigger value="qr" className="data-[state=active]:bg-red-600">
            <QrCode className="w-4 h-4 mr-2" />
            QR Code Scanner
          </TabsTrigger>
        </TabsList>

        {/* Deepfake Detection Tab */}
        <TabsContent value="deepfake" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileImage className="w-5 h-5 text-red-500" />
                  Upload Media
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Upload images or videos to analyze for deepfake manipulation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">
                    Drop files here or click to browse
                  </p>
                  <input
                    ref={deepfakeInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleDeepfakeUpload}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => deepfakeInputRef.current?.click()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
                
                {deepfakeFile && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      {deepfakeFile.type.includes('video') ? 
                        <FileVideo className="w-8 h-8 text-blue-400" /> :
                        <FileImage className="w-8 h-8 text-green-400" />
                      }
                      <div className="flex-1">
                        <p className="text-white font-medium">{deepfakeFile.name}</p>
                        <p className="text-gray-400 text-sm">
                          {(deepfakeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            {deepfakeResult && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-red-500" />
                    Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Deepfake Confidence:</span>
                    <div className="flex items-center gap-2">
                      {deepfakeResult.isDeepfake ? 
                        <XCircle className="w-5 h-5 text-red-500" /> :
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      }
                      <Badge className={deepfakeResult.isDeepfake ? 'bg-red-600' : 'bg-green-600'}>
                        {deepfakeResult.confidence.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Technical Analysis:</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Face Consistency:</span>
                        <span className="text-white">{deepfakeResult.analysisDetails.faceConsistency.toFixed(1)}%</span>
                      </div>
                      <Progress value={deepfakeResult.analysisDetails.faceConsistency} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Temporal Anomalies:</span>
                        <span className="text-white">{deepfakeResult.analysisDetails.temporalAnomalies.toFixed(1)}%</span>
                      </div>
                      <Progress value={deepfakeResult.analysisDetails.temporalAnomalies} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Compression Artifacts:</span>
                        <span className="text-white">{deepfakeResult.analysisDetails.compressionArtifacts.toFixed(1)}%</span>
                      </div>
                      <Progress value={deepfakeResult.analysisDetails.compressionArtifacts} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Eye Movement:</span>
                        <span className="text-white">{deepfakeResult.analysisDetails.eyeMovement.toFixed(1)}%</span>
                      </div>
                      <Progress value={deepfakeResult.analysisDetails.eyeMovement} className="h-2" />
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-3 space-y-2">
                    <h4 className="text-white font-medium">Metadata:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Format:</span>
                        <span className="text-white ml-2">{deepfakeResult.metadata.format}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Resolution:</span>
                        <span className="text-white ml-2">{deepfakeResult.metadata.resolution}</span>
                      </div>
                      {deepfakeResult.metadata.duration && (
                        <div className="col-span-2">
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white ml-2">{deepfakeResult.metadata.duration}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* QR Code Scanner Tab */}
        <TabsContent value="qr" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Scanner Section */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-red-500" />
                  QR Code Scanner
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Scan QR codes to detect phishing and malicious links
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => setCameraActive(!cameraActive)}
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {cameraActive ? 'Stop Camera' : 'Use Camera'}
                  </Button>
                  <Button
                    onClick={() => qrInputRef.current?.click()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
                
                <input
                  ref={qrInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleQRUpload}
                  className="hidden"
                />

                {cameraActive && (
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <Scan className="w-12 h-12 text-red-500 mx-auto mb-2 animate-pulse" />
                    <p className="text-gray-400">Camera scanning active...</p>
                    <p className="text-sm text-gray-500 mt-1">Point camera at QR code</p>
                  </div>
                )}

                {qrFile && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileImage className="w-8 h-8 text-green-400" />
                      <div className="flex-1">
                        <p className="text-white font-medium">{qrFile.name}</p>
                        <p className="text-gray-400 text-sm">
                          {(qrFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* QR Results */}
            {qrResult && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Threat Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Threat Level:</span>
                    <Badge className={getThreatBadgeColor(qrResult.threatLevel)}>
                      {qrResult.threatLevel.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-3">
                    <Label className="text-gray-400">Detected URL:</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-white bg-gray-600 px-2 py-1 rounded text-sm flex-1">
                        {qrResult.url}
                      </code>
                      <Button size="sm" variant="outline" className="border-gray-600">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Security Analysis:</h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Domain Age:</span>
                        <p className="text-white font-medium">{qrResult.analysisDetails.domainAge} days</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Reputation:</span>
                        <p className="text-white font-medium">{qrResult.analysisDetails.reputation.toFixed(1)}/100</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-400">Malware Detection:</span>
                        {qrResult.analysisDetails.malwareDetection ? 
                          <XCircle className="w-4 h-4 text-red-500" /> :
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        }
                      </div>
                    </div>

                    {qrResult.analysisDetails.phishingIndicators.length > 0 && (
                      <div>
                        <h5 className="text-white font-medium mb-2">Phishing Indicators:</h5>
                        <div className="space-y-1">
                          {qrResult.analysisDetails.phishingIndicators.map((indicator, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="w-3 h-3 text-yellow-500" />
                              <span className="text-gray-300">{indicator}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-600">
                      <span className="text-gray-400">Confidence Score:</span>
                      <span className="text-white font-bold">{qrResult.confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <Button className="bg-red-600 hover:bg-red-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          New Analysis
        </Button>
        <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  );
};

export default PhishingProtection;
