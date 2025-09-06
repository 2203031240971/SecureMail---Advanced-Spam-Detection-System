import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bot, 
  Zap, 
  Shield, 
  Trash2, 
  Archive, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Play,
  Pause,
  Edit,
  Plus,
  Target,
  Clock,
  BarChart3,
  Brain,
  Eye,
  FileWarning,
  Sparkles,
  Activity,
  Gauge
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  triggers: string[];
  actions: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  processed: number;
  blocked: number;
  lastTriggered?: string;
  aiSuggested?: boolean;
}

interface AutomationStats {
  totalRules: number;
  activeRules: number;
  threatsBlocked: number;
  processing: number;
  accuracy: number;
  avgResponseTime: number;
}

export default function ThreatAutomation() {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: 'rule-1',
      name: 'High-Risk Phishing Auto-Quarantine',
      description: 'Automatically quarantine emails with phishing confidence > 85%',
      enabled: true,
      triggers: ['phishing_detected', 'suspicious_links', 'domain_spoofing'],
      actions: ['quarantine', 'notify_admin', 'log_incident'],
      priority: 'critical',
      confidence: 96,
      processed: 1247,
      blocked: 1189,
      lastTriggered: '2 minutes ago',
      aiSuggested: false
    },
    {
      id: 'rule-2',
      name: 'Spam Auto-Delete (Low Risk)',
      description: 'Auto-delete obvious spam emails to reduce inbox clutter',
      enabled: true,
      triggers: ['spam_confidence_high', 'known_spam_patterns'],
      actions: ['delete', 'update_sender_reputation'],
      priority: 'medium',
      confidence: 92,
      processed: 3421,
      blocked: 3144,
      lastTriggered: '5 minutes ago',
      aiSuggested: true
    },
    {
      id: 'rule-3',
      name: 'Deepfake Attachment Scanner',
      description: 'Scan attachments for deepfake content and suspicious files',
      enabled: true,
      triggers: ['deepfake_detected', 'suspicious_attachment'],
      actions: ['quarantine', 'scan_attachment', 'alert_user'],
      priority: 'high',
      confidence: 89,
      processed: 156,
      blocked: 23,
      lastTriggered: '1 hour ago',
      aiSuggested: true
    }
  ]);

  const [stats, setStats] = useState<AutomationStats>({
    totalRules: 12,
    activeRules: 9,
    threatsBlocked: 4352,
    processing: 3,
    accuracy: 96.4,
    avgResponseTime: 0.2
  });

  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [aiMode, setAiMode] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        threatsBlocked: prev.threatsBlocked + Math.floor(Math.random() * 3),
        processing: Math.floor(Math.random() * 8),
        accuracy: 96 + Math.random() * 2,
        avgResponseTime: 0.1 + Math.random() * 0.3
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleRule = (ruleId: string) => {
    setAutomationRules(rules =>
      rules.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'quarantine': return <Shield className="w-3 h-3" />;
      case 'delete': return <Trash2 className="w-3 h-3" />;
      case 'archive': return <Archive className="w-3 h-3" />;
      case 'notify_admin': return <AlertTriangle className="w-3 h-3" />;
      default: return <CheckCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto glow-scrollbar">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="relative">
              <Bot className="h-8 w-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
            </div>
            Advanced Threat Automation
          </h1>
          <p className="text-muted-foreground mt-2">
            AI-powered automated threat response and intelligent security workflows
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI Mode</span>
            <Switch checked={aiMode} onCheckedChange={setAiMode} />
          </div>
          <Button onClick={() => setIsCreating(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Real-time Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Active Rules
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.activeRules}
                </p>
              </div>
              <div className="relative">
                <Settings className="h-8 w-8 text-primary animate-spin-slow" />
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Threats Blocked
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.threatsBlocked.toLocaleString()}
                </p>
              </div>
              <Shield className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Processing
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.processing}
                </p>
              </div>
              <div className="relative">
                <Activity className="h-8 w-8 text-warning" />
                {stats.processing > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full animate-pulse" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Accuracy
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.accuracy.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Response Time
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.avgResponseTime.toFixed(1)}s
                </p>
              </div>
              <Gauge className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Total Rules
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalRules}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions Alert */}
      {aiMode && (
        <Alert className="border-primary/50 bg-gradient-to-r from-primary/5 to-transparent">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <AlertDescription className="text-foreground">
            <strong>AI Intelligence Active:</strong> 2 new automation rules suggested based on recent threat patterns. 
            <Button variant="link" className="p-0 h-auto ml-2 text-primary">
              Review Suggestions →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Automation Rules
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          {/* Automation Rules Grid */}
          <div className="grid gap-4">
            {automationRules.map((rule) => (
              <Card 
                key={rule.id} 
                className={`transition-all duration-300 hover:shadow-lg border-l-4 ${
                  rule.enabled 
                    ? 'border-l-success bg-gradient-to-r from-success/5 to-transparent' 
                    : 'border-l-muted bg-muted/20'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Bot className={`w-6 h-6 ${rule.enabled ? 'text-success' : 'text-muted-foreground'}`} />
                        {rule.enabled && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          {rule.name}
                          {rule.aiSuggested && (
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Suggested
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getPriorityColor(rule.priority)}>
                        {rule.priority.toUpperCase()}
                      </Badge>
                      <Switch 
                        checked={rule.enabled} 
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                      <Button variant="ghost" size="sm" onClick={() => setSelectedRule(rule)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{rule.confidence}%</p>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-foreground">{rule.processed.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Processed</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold text-success">{rule.blocked.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Blocked</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium text-foreground">{rule.lastTriggered || 'Never'}</p>
                      <p className="text-xs text-muted-foreground">Last Triggered</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs font-medium text-muted-foreground">Triggers:</span>
                    {rule.triggers.map((trigger, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {trigger.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Actions:</span>
                    {rule.actions.map((action, index) => (
                      <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                        {getActionIcon(action)}
                        {action.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 h-5 text-primary" />
                Automation Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Advanced Workflow Builder</h3>
                <p className="text-muted-foreground mb-4">
                  Create complex multi-step automation workflows with conditional logic
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 h-5 text-primary" />
                Real-Time Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Active Threats</h4>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          <span className="text-sm font-medium">Phishing attempt blocked</span>
                        </div>
                        <Badge variant="destructive">Critical</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">System Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Engine</span>
                      <Badge className="bg-success text-success-foreground">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Threat Database</span>
                      <Badge className="bg-success text-success-foreground">Updated</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-Response</span>
                      <Badge className="bg-success text-success-foreground">Active</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Automation Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gradient-to-r from-primary/20 to-success/20 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Performance Chart Visualization</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Threat Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gradient-to-r from-warning/20 to-destructive/20 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Category Breakdown Chart</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
