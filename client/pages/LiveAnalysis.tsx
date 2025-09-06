import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Zap, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Scan,
  Target,
  Activity,
  Mail,
  FileText,
  Link,
  Globe,
  Clock,
  TrendingUp,
  Gauge,
  Bot,
  Sparkles,
  Play,
  Pause,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';

interface LiveScanResult {
  id: string;
  timestamp: Date;
  emailId: string;
  sender: string;
  subject: string;
  riskScore: number;
  aiConfidence: number;
  threatType: 'spam' | 'phishing' | 'malware' | 'clean' | 'suspicious';
  keywords: string[];
  sentiment: number;
  linkAnalysis: {
    totalLinks: number;
    suspiciousLinks: number;
    redirects: number;
  };
  nlpHighlights: string[];
  processingTime: number;
  status: 'scanning' | 'analyzed' | 'quarantined' | 'delivered';
}

interface AIMetrics {
  currentThroughput: number;
  avgProcessingTime: number;
  accuracy: number;
  modelsActive: number;
  queueLength: number;
  threatsDetected: number;
}

export default function LiveAnalysis() {
  const [isScanning, setIsScanning] = useState(true);
  const [scanResults, setScanResults] = useState<LiveScanResult[]>([]);
  const [aiMetrics, setAiMetrics] = useState<AIMetrics>({
    currentThroughput: 0,
    avgProcessingTime: 0.3,
    accuracy: 96.8,
    modelsActive: 4,
    queueLength: 0,
    threatsDetected: 0
  });
  const [selectedResult, setSelectedResult] = useState<LiveScanResult | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const scannerRef = useRef<HTMLDivElement>(null);

  // Simulate live scanning
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      const newScan: LiveScanResult = generateMockScanResult();
      
      setScanResults(prev => {
        const updated = [newScan, ...prev.slice(0, 49)]; // Keep last 50 results
        return updated;
      });

      // Update metrics
      setAiMetrics(prev => ({
        ...prev,
        currentThroughput: Math.floor(Math.random() * 50) + 20,
        queueLength: Math.floor(Math.random() * 15),
        threatsDetected: prev.threatsDetected + (newScan.threatType !== 'clean' ? 1 : 0)
      }));
    }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds

    return () => clearInterval(interval);
  }, [isScanning]);

  // Auto-scroll animation
  useEffect(() => {
    if (scannerRef.current && scanResults.length > 0) {
      scannerRef.current.scrollTop = 0;
    }
  }, [scanResults]);

  const generateMockScanResult = (): LiveScanResult => {
    const threats = ['spam', 'phishing', 'malware', 'clean', 'suspicious'];
    const threatType = threats[Math.floor(Math.random() * threats.length)] as any;
    const riskScore = threatType === 'clean' ? Math.random() * 30 : 50 + Math.random() * 50;
    
    const mockEmails = [
      { sender: 'newsletter@company.com', subject: 'Weekly Newsletter - New Features!' },
      { sender: 'noreply@suspicious.fake', subject: 'URGENT: Your account will be deleted!' },
      { sender: 'support@bank.legit', subject: 'Monthly Statement Available' },
      { sender: 'winner@lottery.scam', subject: '🎉 You\'ve won $1,000,000!' },
      { sender: 'team@startup.io', subject: 'Product Update: v2.0 Release' }
    ];

    const email = mockEmails[Math.floor(Math.random() * mockEmails.length)];
    
    return {
      id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      emailId: `email_${Math.random().toString(36).substr(2, 9)}`,
      sender: email.sender,
      subject: email.subject,
      riskScore: Math.round(riskScore),
      aiConfidence: Math.round(85 + Math.random() * 15),
      threatType,
      keywords: generateKeywords(threatType),
      sentiment: Math.random() * 2 - 1, // -1 to 1
      linkAnalysis: {
        totalLinks: Math.floor(Math.random() * 8),
        suspiciousLinks: threatType !== 'clean' ? Math.floor(Math.random() * 3) : 0,
        redirects: Math.floor(Math.random() * 2)
      },
      nlpHighlights: generateNlpHighlights(threatType),
      processingTime: Math.round((0.1 + Math.random() * 0.8) * 1000) / 1000,
      status: Math.random() > 0.8 ? 'scanning' : 'analyzed'
    };
  };

  const generateKeywords = (threatType: string): string[] => {
    const keywordSets = {
      spam: ['offer', 'discount', 'limited time', 'act now'],
      phishing: ['verify', 'urgent', 'suspended', 'click here'],
      malware: ['attachment', 'download', 'install', 'update'],
      clean: ['newsletter', 'meeting', 'report', 'update'],
      suspicious: ['free', 'winner', 'congratulations', 'claim']
    };
    
    const keywords = keywordSets[threatType as keyof typeof keywordSets] || keywordSets.clean;
    return keywords.slice(0, Math.floor(Math.random() * 3) + 1);
  };

  const generateNlpHighlights = (threatType: string): string[] => {
    const highlights = {
      spam: ['promotional language detected', 'urgency indicators', 'discount keywords'],
      phishing: ['credential harvesting patterns', 'domain spoofing', 'social engineering'],
      malware: ['suspicious attachment patterns', 'executable file references'],
      clean: ['legitimate business communication', 'professional tone'],
      suspicious: ['mixed signals detected', 'requires manual review']
    };
    
    const items = highlights[threatType as keyof typeof highlights] || highlights.clean;
    return items.slice(0, Math.floor(Math.random() * 2) + 1);
  };

  const getThreatColor = (threatType: string) => {
    switch (threatType) {
      case 'phishing': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'malware': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'spam': return 'text-warning bg-warning/10 border-warning/20';
      case 'suspicious': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'clean': return 'text-success bg-success/10 border-success/20';
      default: return 'text-muted-foreground bg-muted/10 border-muted/20';
    }
  };

  const getThreatIcon = (threatType: string) => {
    switch (threatType) {
      case 'phishing': return <AlertTriangle className="w-4 h-4" />;
      case 'malware': return <Shield className="w-4 h-4" />;
      case 'spam': return <Mail className="w-4 h-4" />;
      case 'suspicious': return <Eye className="w-4 h-4" />;
      case 'clean': return <CheckCircle className="w-4 h-4" />;
      default: return <Scan className="w-4 h-4" />;
    }
  };

  const filteredResults = scanResults.filter(result => 
    filterType === 'all' || result.threatType === filterType
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="relative">
              <Brain className="h-8 w-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
            </div>
            Real-Time AI Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Live email scanning with advanced AI threat detection and NLP analysis
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsScanning(!isScanning)}
            className={isScanning ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}
          >
            {isScanning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isScanning ? 'Pause Scanning' : 'Resume Scanning'}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      {/* AI Engine Status */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Throughput
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {aiMetrics.currentThroughput}/min
                </p>
              </div>
              <div className="relative">
                <Zap className="h-8 w-8 text-primary" />
                {isScanning && (
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Accuracy
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {aiMetrics.accuracy}%
                </p>
              </div>
              <Target className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Processing
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {aiMetrics.avgProcessingTime}s
                </p>
              </div>
              <Gauge className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  AI Models
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {aiMetrics.modelsActive}
                </p>
              </div>
              <Bot className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Queue
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {aiMetrics.queueLength}
                </p>
              </div>
              <Activity className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Threats
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {aiMetrics.threatsDetected}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scanning Status */}
      {isScanning && (
        <Alert className="border-primary/50 bg-gradient-to-r from-primary/5 to-transparent">
          <Activity className="h-4 w-4 text-primary animate-pulse" />
          <AlertDescription className="text-foreground">
            <strong>AI Engine Active:</strong> Real-time email analysis in progress. 
            Processing {aiMetrics.currentThroughput} messages per minute with {aiMetrics.accuracy}% accuracy.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Scan Feed */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5 text-primary" />
                Live Scan Feed
                {isScanning && <div className="w-2 h-2 bg-success rounded-full animate-pulse ml-2" />}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-sm bg-background border border-border rounded px-2 py-1"
                >
                  <option value="all">All</option>
                  <option value="phishing">Phishing</option>
                  <option value="spam">Spam</option>
                  <option value="malware">Malware</option>
                  <option value="suspicious">Suspicious</option>
                  <option value="clean">Clean</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div ref={scannerRef} className="space-y-3 max-h-96 overflow-y-auto">
                {filteredResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Scan className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No scan results yet. {isScanning ? 'Waiting for emails...' : 'Start scanning to see results.'}</p>
                  </div>
                ) : (
                  filteredResults.map((result) => (
                    <div 
                      key={result.id}
                      className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md cursor-pointer ${getThreatColor(result.threatType)}`}
                      onClick={() => setSelectedResult(result)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getThreatIcon(result.threatType)}
                          <span className="font-medium text-sm">
                            {result.threatType.toUpperCase()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {result.aiConfidence}% confidence
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {result.processingTime}s
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="font-medium text-sm truncate">{result.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.sender}</p>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Risk Score</span>
                          <span>{result.riskScore}%</span>
                        </div>
                        <Progress 
                          value={result.riskScore} 
                          className={`h-1 ${
                            result.riskScore > 70 ? '[&>div]:bg-destructive' :
                            result.riskScore > 40 ? '[&>div]:bg-warning' : '[&>div]:bg-success'
                          }`}
                        />
                      </div>

                      {result.nlpHighlights.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {result.nlpHighlights.map((highlight, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Sparkles className="w-2 h-2 mr-1" />
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Details */}
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Analysis Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedResult ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Email Details</h4>
                    <div className="space-y-1 text-xs">
                      <p><strong>Subject:</strong> {selectedResult.subject}</p>
                      <p><strong>Sender:</strong> {selectedResult.sender}</p>
                      <p><strong>Timestamp:</strong> {selectedResult.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Risk Assessment</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Risk Score</span>
                          <span>{selectedResult.riskScore}%</span>
                        </div>
                        <Progress value={selectedResult.riskScore} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>AI Confidence</span>
                          <span>{selectedResult.aiConfidence}%</span>
                        </div>
                        <Progress value={selectedResult.aiConfidence} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Link Analysis</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <p className="font-bold">{selectedResult.linkAnalysis.totalLinks}</p>
                        <p className="text-muted-foreground">Total</p>
                      </div>
                      <div className="text-center p-2 bg-warning/20 rounded">
                        <p className="font-bold">{selectedResult.linkAnalysis.suspiciousLinks}</p>
                        <p className="text-muted-foreground">Suspicious</p>
                      </div>
                      <div className="text-center p-2 bg-destructive/20 rounded">
                        <p className="font-bold">{selectedResult.linkAnalysis.redirects}</p>
                        <p className="text-muted-foreground">Redirects</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Keywords Detected</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedResult.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">NLP Highlights</h4>
                    <div className="space-y-1">
                      {selectedResult.nlpHighlights.map((highlight, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <Sparkles className="w-3 h-3 text-primary" />
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Select a scan result to view detailed AI analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
