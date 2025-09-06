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
  MessageSquare, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Upload,
  FileText,
  Link,
  Smartphone,
  Zap,
  Trash2,
  Plus
} from 'lucide-react';

interface SMSAnalysisResult {
  isSpam: boolean;
  confidence: number;
  category: 'phishing' | 'promotional' | 'scam' | 'legitimate' | 'suspicious';
  riskScore: number;
  flags: string[];
  phoneNumber?: string;
  messageLength: number;
  linkCount: number;
}

interface SMSMessage {
  id: string;
  content: string;
  phoneNumber?: string;
  result?: SMSAnalysisResult;
}

const smsExamples = [
  {
    id: '1',
    content: 'URGENT: Your bank account has been compromised. Click here immediately to secure: http://fake-bank.scam',
    phoneNumber: '+1-555-SCAM',
    type: 'scam'
  },
  {
    id: '2', 
    content: 'Hi! Your Amazon package will arrive today between 2-4 PM. Track: https://amazon.com/tracking/xyz123',
    phoneNumber: '+1-206-266-1000',
    type: 'legitimate'
  },
  {
    id: '3',
    content: 'CONGRATULATIONS! You won $5000! Text WIN to 55555 to claim your prize now!',
    phoneNumber: '+1-555-FAKE',
    type: 'scam'
  },
  {
    id: '4',
    content: 'Your appointment with Dr. Smith tomorrow at 3 PM has been confirmed. Reply CANCEL to reschedule.',
    phoneNumber: '+1-555-CLINIC',
    type: 'legitimate'
  }
];

export default function SMSAnalyzer() {
  const [singleSMS, setSingleSMS] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bulkMessages, setBulkMessages] = useState<SMSMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [singleResult, setSingleResult] = useState<SMSAnalysisResult | null>(null);
  const [bulkResults, setBulkResults] = useState<Map<string, SMSAnalysisResult>>(new Map());

  const analyzeSingleSMS = async () => {
    if (!singleSMS.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis result
    const isSpam = singleSMS.toLowerCase().includes('urgent') || 
                   singleSMS.toLowerCase().includes('win') ||
                   singleSMS.toLowerCase().includes('prize') ||
                   singleSMS.toLowerCase().includes('click') ||
                   singleSMS.toLowerCase().includes('congratulations');
    
    const mockResult: SMSAnalysisResult = {
      isSpam,
      confidence: Math.random() * 30 + 70,
      category: isSpam ? 
        (singleSMS.toLowerCase().includes('bank') ? 'phishing' : 
         singleSMS.toLowerCase().includes('win') ? 'scam' : 'suspicious') : 
        'legitimate',
      riskScore: isSpam ? Math.random() * 40 + 60 : Math.random() * 30 + 10,
      flags: [
        'Urgency language detected',
        'External links present', 
        'Monetary offers mentioned',
        'Unknown sender'
      ].filter(() => Math.random() > 0.6),
      phoneNumber: phoneNumber || undefined,
      messageLength: singleSMS.length,
      linkCount: (singleSMS.match(/http[s]?:\/\//g) || []).length
    };
    
    setSingleResult(mockResult);
    setIsAnalyzing(false);
  };

  const addBulkMessage = () => {
    const newMessage: SMSMessage = {
      id: Date.now().toString(),
      content: '',
      phoneNumber: ''
    };
    setBulkMessages([...bulkMessages, newMessage]);
  };

  const updateBulkMessage = (id: string, field: keyof SMSMessage, value: string) => {
    setBulkMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, [field]: value } : msg
      )
    );
  };

  const removeBulkMessage = (id: string) => {
    setBulkMessages(prev => prev.filter(msg => msg.id !== id));
    setBulkResults(prev => {
      const newResults = new Map(prev);
      newResults.delete(id);
      return newResults;
    });
  };

  const analyzeBulkSMS = async () => {
    if (bulkMessages.length === 0) return;
    
    setIsAnalyzing(true);
    const newResults = new Map<string, SMSAnalysisResult>();
    
    // Simulate analyzing each message
    for (const message of bulkMessages) {
      if (!message.content.trim()) continue;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const isSpam = message.content.toLowerCase().includes('urgent') || 
                     message.content.toLowerCase().includes('win') ||
                     message.content.toLowerCase().includes('prize');
      
      const result: SMSAnalysisResult = {
        isSpam,
        confidence: Math.random() * 30 + 70,
        category: isSpam ? 'scam' : 'legitimate',
        riskScore: isSpam ? Math.random() * 40 + 60 : Math.random() * 30 + 10,
        flags: ['Urgency language', 'External links'].filter(() => Math.random() > 0.7),
        phoneNumber: message.phoneNumber || undefined,
        messageLength: message.content.length,
        linkCount: (message.content.match(/http[s]?:\/\//g) || []).length
      };
      
      newResults.set(message.id, result);
    }
    
    setBulkResults(newResults);
    setIsAnalyzing(false);
  };

  const loadExample = (example: any) => {
    setSingleSMS(example.content);
    setPhoneNumber(example.phoneNumber);
    setSingleResult(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'scam':
      case 'phishing':
        return 'bg-destructive/20 text-destructive border-destructive';
      case 'suspicious':
        return 'bg-warning/20 text-warning border-warning';
      case 'promotional':
        return 'bg-blue-500/20 text-blue-400 border-blue-500';
      default:
        return 'bg-success/20 text-success border-success';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">SMS Analyzer</h1>
        <p className="text-muted-foreground">Advanced SMS spam detection and bulk analysis</p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single">Single SMS</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Analysis</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  SMS Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone Number (Optional)</Label>
                  <Input
                    id="phone-number"
                    placeholder="+1-555-0123"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sms-content">SMS Message</Label>
                  <Textarea
                    id="sms-content"
                    placeholder="Enter SMS message content here..."
                    value={singleSMS}
                    onChange={(e) => setSingleSMS(e.target.value)}
                    className="min-h-[200px] bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="text-xs text-muted-foreground">
                    Characters: {singleSMS.length}/160
                  </div>
                </div>
                
                <Button
                  onClick={analyzeSingleSMS}
                  disabled={!singleSMS.trim() || isAnalyzing}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isAnalyzing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing SMS...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Analyze SMS
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

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
                      <span className="text-muted-foreground">Analyzing SMS content...</span>
                    </div>
                    <Progress value={50} className="w-full" />
                  </div>
                ) : singleResult ? (
                  <div className="space-y-6">
                    <Alert className={singleResult.isSpam ? "border-destructive" : "border-success"}>
                      <div className="flex items-center gap-2">
                        {singleResult.isSpam ? (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                        <span className="font-semibold">
                          {singleResult.isSpam ? 'SPAM DETECTED' : 'LEGITIMATE SMS'}
                        </span>
                      </div>
                      <AlertDescription className="mt-2">
                        <div className="space-y-1">
                          <div>Confidence: {singleResult.confidence.toFixed(1)}%</div>
                          <div>Risk Score: {singleResult.riskScore.toFixed(1)}/100</div>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Category</h4>
                        <Badge className={getCategoryColor(singleResult.category)}>
                          {singleResult.category.toUpperCase()}
                        </Badge>
                      </div>

                      {singleResult.flags.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Risk Flags</h4>
                          <div className="space-y-1">
                            {singleResult.flags.map((flag, index) => (
                              <Badge key={index} variant="destructive" className="mr-2 mb-1">
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>Length: {singleResult.messageLength} chars</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link className="h-4 w-4" />
                            <span>Links: {singleResult.linkCount}</span>
                          </div>
                        </div>
                        {singleResult.phoneNumber && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4" />
                              <span>{singleResult.phoneNumber}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter SMS content and click "Analyze SMS" to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Bulk SMS Analysis
                </div>
                <Button onClick={addBulkMessage} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Message
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bulkMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Add SMS messages to analyze them in bulk</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {bulkMessages.map((message, index) => {
                      const result = bulkResults.get(message.id);
                      return (
                        <Card key={message.id} className="border border-border/50">
                          <CardContent className="pt-6">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Message {index + 1}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeBulkMessage(message.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input
                                  placeholder="Phone number (optional)"
                                  value={message.phoneNumber || ''}
                                  onChange={(e) => updateBulkMessage(message.id, 'phoneNumber', e.target.value)}
                                />
                                <div className="md:col-span-2">
                                  <Textarea
                                    placeholder="SMS message content..."
                                    value={message.content}
                                    onChange={(e) => updateBulkMessage(message.id, 'content', e.target.value)}
                                    className="min-h-[80px]"
                                  />
                                </div>
                              </div>

                              {result && (
                                <div className="mt-3 p-3 rounded border bg-muted/30">
                                  <div className="flex items-center justify-between">
                                    <Badge className={getCategoryColor(result.category)}>
                                      {result.category.toUpperCase()}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {result.confidence.toFixed(1)}% confidence
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <Button
                    onClick={analyzeBulkSMS}
                    disabled={isAnalyzing || bulkMessages.every(m => !m.content.trim())}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isAnalyzing ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing {bulkMessages.length} Messages...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Analyze All Messages
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Example SMS Messages</CardTitle>
              <p className="text-sm text-muted-foreground">
                Try these sample SMS messages to see how the analyzer works
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {smsExamples.map((example) => (
                  <Card key={example.id} className="border border-border/50">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={example.type === 'scam' ? 'destructive' : 'secondary'}
                          className={example.type === 'legitimate' ? 'bg-success/20 text-success border-success' : ''}
                        >
                          {example.type === 'scam' ? 'SCAM' : 'LEGITIMATE'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{example.phoneNumber}</span>
                      </div>
                      
                      <div className="text-sm bg-muted/30 p-3 rounded border-l-2 border-muted">
                        {example.content}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadExample(example)}
                        className="w-full"
                      >
                        Try This Example
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
