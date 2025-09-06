import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Link,
  User,
  Globe,
  Zap
} from 'lucide-react';

interface AnalysisResult {
  isSpam: boolean;
  confidence: number;
  riskFactors: string[];
  safeFactors: string[];
  details: {
    sender: string;
    subject: string;
    domains: string[];
    links: number;
    suspiciousPatterns: string[];
  };
}

interface EmailExample {
  id: string;
  subject: string;
  content: string;
  type: 'spam' | 'legitimate';
}

const emailExamples: EmailExample[] = [
  {
    id: '1',
    subject: 'URGENT: Claim your $1000 prize NOW!',
    content: `Congratulations! You've been selected to receive a $1000 gift card. 
    
    Click here immediately to claim: http://suspicious-link.fake
    
    This offer expires in 24 hours. Act fast!
    
    From: winner@prizes.fake`,
    type: 'spam'
  },
  {
    id: '2',
    subject: 'Meeting reminder for tomorrow',
    content: `Hi John,

    Just a quick reminder about our team meeting tomorrow at 2 PM in Conference Room A.

    Agenda:
    - Q4 project review
    - Budget planning
    - Team updates

    Best regards,
    Sarah Johnson
    Project Manager`,
    type: 'legitimate'
  },
  {
    id: '3',
    subject: 'Nigerian Prince needs your help!!!',
    content: `Dear Friend,

    I am Prince Abdul from Nigeria. I have $10 million USD that I need to transfer urgently. I need your bank account details to transfer this money.

    You will receive 20% commission for your help.

    Please send your banking details immediately.

    Prince Abdul`,
    type: 'spam'
  }
];

export default function EmailAnalyzer() {
  const [emailContent, setEmailContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedExample, setSelectedExample] = useState<string>('');

  const analyzeEmail = async () => {
    if (!emailContent.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock analysis result
    const mockResult: AnalysisResult = {
      isSpam: emailContent.toLowerCase().includes('prize') || 
              emailContent.toLowerCase().includes('urgent') ||
              emailContent.toLowerCase().includes('prince'),
      confidence: Math.random() * 40 + 60, // 60-100%
      riskFactors: [
        'Suspicious urgency language',
        'External links detected',
        'Unknown sender domain',
        'Monetary offers mentioned'
      ].filter(() => Math.random() > 0.5),
      safeFactors: [
        'Professional formatting',
        'Known sender domain',
        'No suspicious attachments',
        'Standard business language'
      ].filter(() => Math.random() > 0.5),
      details: {
        sender: 'unknown@domain.com',
        subject: 'Email Analysis',
        domains: ['suspicious-link.fake', 'domain.com'],
        links: Math.floor(Math.random() * 5),
        suspiciousPatterns: ['ALL CAPS', 'Excessive punctuation!!!']
      }
    };
    
    setAnalysisResult(mockResult);
    setIsAnalyzing(false);
  };

  const loadExample = (exampleId: string) => {
    const example = emailExamples.find(e => e.id === exampleId);
    if (example) {
      setEmailContent(`Subject: ${example.subject}\n\n${example.content}`);
      setSelectedExample(exampleId);
      setAnalysisResult(null);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Email Analyzer</h1>
        <p className="text-muted-foreground">Advanced email spam detection and analysis</p>
      </div>

      <Tabs defaultValue="analyzer" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analyzer">Email Analyzer</TabsTrigger>
          <TabsTrigger value="examples">Example Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="analyzer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-content">Paste email content below:</Label>
                  <Textarea
                    id="email-content"
                    placeholder="Subject: Your email subject here

From: sender@domain.com
To: recipient@domain.com

Email body content goes here..."
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    className="min-h-[300px] bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                
                <Button
                  onClick={analyzeEmail}
                  disabled={!emailContent.trim() || isAnalyzing}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isAnalyzing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Email...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Analyze Email
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground animate-spin" />
                      <span className="text-muted-foreground">Analyzing email content...</span>
                    </div>
                    <Progress value={33} className="w-full" />
                    <div className="text-sm text-muted-foreground">
                      <div>• Checking sender reputation...</div>
                      <div>• Analyzing content patterns...</div>
                      <div>• Scanning for malicious links...</div>
                    </div>
                  </div>
                ) : analysisResult ? (
                  <div className="space-y-6">
                    {/* Main Result */}
                    <Alert className={analysisResult.isSpam ? "border-destructive" : "border-success"}>
                      <div className="flex items-center gap-2">
                        {analysisResult.isSpam ? (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                        <span className="font-semibold">
                          {analysisResult.isSpam ? 'SPAM DETECTED' : 'LEGITIMATE EMAIL'}
                        </span>
                      </div>
                      <AlertDescription className="mt-2">
                        Confidence: {analysisResult.confidence.toFixed(1)}%
                      </AlertDescription>
                    </Alert>

                    {/* Risk Factors */}
                    {analysisResult.riskFactors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-destructive flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Risk Factors
                        </h4>
                        <div className="space-y-1">
                          {analysisResult.riskFactors.map((factor, index) => (
                            <Badge key={index} variant="destructive" className="mr-2 mb-1">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Safe Factors */}
                    {analysisResult.safeFactors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-success flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Safe Factors
                        </h4>
                        <div className="space-y-1">
                          {analysisResult.safeFactors.map((factor, index) => (
                            <Badge key={index} variant="secondary" className="mr-2 mb-1 bg-success/20 text-success border-success">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Detailed Analysis */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Detailed Analysis</h4>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <span className="text-muted-foreground">Sender:</span>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {analysisResult.details.sender}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-muted-foreground">Links Found:</span>
                          <div className="flex items-center gap-1">
                            <Link className="h-3 w-3" />
                            {analysisResult.details.links}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-muted-foreground">Domains:</span>
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {analysisResult.details.domains.length}
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-muted-foreground">Suspicious Patterns:</span>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {analysisResult.details.suspiciousPatterns.length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter email content and click "Analyze Email" to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Example Emails</CardTitle>
              <p className="text-sm text-muted-foreground">
                Try these sample emails to see how the analyzer works
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {emailExamples.map((example) => (
                  <Card key={example.id} className="border border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{example.subject}</CardTitle>
                        <Badge 
                          variant={example.type === 'spam' ? 'destructive' : 'secondary'}
                          className={example.type === 'legitimate' ? 'bg-success/20 text-success border-success' : ''}
                        >
                          {example.type === 'spam' ? 'SPAM' : 'LEGITIMATE'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded border-l-2 border-muted">
                        {example.content.substring(0, 200)}...
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadExample(example.id)}
                        className="w-full"
                      >
                        Load This Example
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
