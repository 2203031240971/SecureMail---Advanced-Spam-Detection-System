import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  HelpCircle, 
  Search,
  Book,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Shield,
  Zap,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink,
  Download,
  Video,
  Bug
} from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  steps?: string[];
}

const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'How does SecureMail detect spam?',
    answer: 'SecureMail uses advanced AI algorithms to analyze email and SMS content, sender reputation, and pattern recognition to identify spam with over 96% accuracy. Our system continuously learns from new threats to improve detection rates.',
    category: 'general',
    tags: ['detection', 'ai', 'accuracy']
  },
  {
    id: '2',
    question: 'What should I do if a legitimate message is marked as spam?',
    answer: 'You can manually mark the message as "not spam" in your scan history. This helps train our system and reduces false positives. You can also add the sender to your whitelist in Settings.',
    category: 'troubleshooting',
    tags: ['false positive', 'whitelist', 'training']
  },
  {
    id: '3',
    question: 'How can I bulk analyze multiple messages?',
    answer: 'Use the SMS Analyzer\'s bulk analysis feature. You can add multiple messages and analyze them all at once. For emails, you can upload a batch file or use our API for automated processing.',
    category: 'features',
    tags: ['bulk analysis', 'api', 'automation']
  },
  {
    id: '4',
    question: 'Is my data secure?',
    answer: 'Yes, all data is encrypted in transit and at rest. We don\'t store message content longer than necessary for analysis, and you can configure data retention periods in Settings. We comply with GDPR and other privacy regulations.',
    category: 'security',
    tags: ['encryption', 'privacy', 'gdpr']
  },
  {
    id: '5',
    question: 'Can I integrate SecureMail with my existing email system?',
    answer: 'Yes, SecureMail provides REST APIs for integration with email servers, security gateways, and other systems. Check our API documentation for implementation details.',
    category: 'integration',
    tags: ['api', 'integration', 'email servers']
  },
  {
    id: '6',
    question: 'How do I adjust the spam detection sensitivity?',
    answer: 'Go to Settings > Security and adjust the confidence threshold slider. Higher values make detection more strict but may increase false positives. We recommend starting with 85% and adjusting based on your needs.',
    category: 'configuration',
    tags: ['sensitivity', 'threshold', 'configuration']
  }
];

const guides: GuideSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using SecureMail',
    icon: <Zap className="h-5 w-5 text-primary" />,
    steps: [
      'Navigate to the Email or SMS Analyzer',
      'Paste your message content',
      'Click "Analyze" to get instant results',
      'Review the confidence score and risk factors',
      'Check scan history for past analyses'
    ]
  },
  {
    id: 'advanced-features',
    title: 'Advanced Features',
    description: 'Explore powerful features for power users',
    icon: <Settings className="h-5 w-5 text-primary" />,
    steps: [
      'Configure custom detection thresholds',
      'Set up automated notifications',
      'Use bulk analysis for multiple messages',
      'Export scan history and analytics',
      'Integrate with external systems via API'
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics Dashboard',
    description: 'Understanding your security metrics',
    icon: <BarChart3 className="h-5 w-5 text-primary" />,
    steps: [
      'View real-time threat statistics',
      'Analyze detection trends over time',
      'Identify top threat sources',
      'Monitor system performance',
      'Generate compliance reports'
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Resolve common issues',
    icon: <AlertTriangle className="h-5 w-5 text-warning" />,
    steps: [
      'Check system status and connectivity',
      'Verify API key configuration',
      'Review error logs in settings',
      'Test with known spam/clean samples',
      'Contact support if issues persist'
    ]
  }
];

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(faqItems.map(item => item.category))];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Help & Documentation</h1>
        <p className="text-muted-foreground">Get help and learn how to use SecureMail effectively</p>
      </div>

      <Tabs defaultValue="guides" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide) => (
              <Card key={guide.id} className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {guide.icon}
                    {guide.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{guide.description}</p>
                </CardHeader>
                <CardContent>
                  {guide.steps && (
                    <ol className="space-y-2">
                      {guide.steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="text-sm">{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Start Guide */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5 text-primary" />
                Quick Start Tutorial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    New to SecureMail? Follow this step-by-step tutorial to get started quickly.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto">
                      <Mail className="h-6 w-6" />
                    </div>
                    <h4 className="font-medium">Analyze Your First Message</h4>
                    <p className="text-sm text-muted-foreground">
                      Start by analyzing a sample email or SMS message
                    </p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto">
                      <Settings className="h-6 w-6" />
                    </div>
                    <h4 className="font-medium">Configure Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Adjust detection thresholds and notification preferences
                    </p>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <h4 className="font-medium">View Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitor your security metrics and trends
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          {/* Search and Filters */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search FAQ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Items */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Find answers to common questions about SecureMail
              </p>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQs.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-left">
                      <div className="space-y-1">
                        <div>{item.question}</div>
                        <div className="flex gap-1">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-muted-foreground">{item.answer}</div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No FAQ items found matching your search criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Documentation */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Documentation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-between">
                  User Manual
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  API Reference
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Integration Guide
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Security Whitepaper
                  <Download className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Video Tutorials */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Video Tutorials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-between">
                  Getting Started (5 min)
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Advanced Configuration (12 min)
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  API Integration (8 min)
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Analytics Deep Dive (15 min)
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Community */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-between">
                  Discussion Forum
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Feature Requests
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Bug Reports
                  <Bug className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  Release Notes
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card className="bg-card border-border md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Security Recommendations</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        Set confidence threshold between 80-90% for optimal balance
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        Enable real-time scanning for immediate threat detection
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        Regularly review quarantined messages for false positives
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        Keep API keys secure and rotate them periodically
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Performance Tips</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        Use batch processing for large volumes of messages
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        Configure appropriate data retention to manage storage
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        Monitor system metrics in the Analytics dashboard
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        Set up notifications for critical threats and system issues
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Support */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded border bg-muted/30">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Email Support</div>
                      <div className="text-sm text-muted-foreground">support@securemail.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded border bg-muted/30">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Phone Support</div>
                      <div className="text-sm text-muted-foreground">+1-800-SECURE-1</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded border bg-muted/30">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Live Chat</div>
                      <div className="text-sm text-muted-foreground">Available 24/7</div>
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  Start Live Chat
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>API Status</span>
                    <Badge variant="secondary" className="bg-success/20 text-success border-success">
                      Operational
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Email Analysis</span>
                    <Badge variant="secondary" className="bg-success/20 text-success border-success">
                      Operational
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>SMS Analysis</span>
                    <Badge variant="secondary" className="bg-success/20 text-success border-success">
                      Operational
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Dashboard</span>
                    <Badge variant="secondary" className="bg-success/20 text-success border-success">
                      Operational
                    </Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  View Full Status Page
                </Button>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    All systems are currently operational. Last updated: {new Date().toLocaleString()}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Support Ticket */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Submit Support Ticket</CardTitle>
              <p className="text-sm text-muted-foreground">
                Can't find what you're looking for? Submit a support ticket and we'll help you out.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="Brief description of your issue" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select className="w-full px-3 py-2 border border-border rounded-md bg-background">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  className="w-full px-3 py-2 border border-border rounded-md bg-background min-h-[120px]"
                  placeholder="Please provide detailed information about your issue..."
                />
              </div>
              
              <Button className="w-full">
                Submit Ticket
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
