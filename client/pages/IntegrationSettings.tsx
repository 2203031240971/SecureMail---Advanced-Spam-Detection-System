import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Key, 
  Webhook, 
  TestTube,
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Copy,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Slack,
  Mail,
  MessageSquare,
  Zap,
  Globe,
  Code,
  Activity,
  Lock,
  Unlock,
  Download,
  Upload
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  enabled: boolean;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  rateLimit: number;
  environment: 'production' | 'staging' | 'development';
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  secret: string;
  lastTriggered?: string;
  successRate: number;
  retries: number;
  timeout: number;
  headers: Record<string, string>;
}

interface Integration {
  id: string;
  name: string;
  type: 'slack' | 'teams' | 'email' | 'webhook' | 'sms';
  enabled: boolean;
  config: Record<string, any>;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  lastSync?: string;
  errorMessage?: string;
}

interface TestResult {
  success: boolean;
  message: string;
  duration: number;
  timestamp: string;
  details?: Record<string, any>;
}

const IntegrationSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('api-keys');
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const copyToClipboard = useRef<HTMLInputElement>(null);

  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'sk_live_1234567890abcdef',
      permissions: ['read', 'write', 'admin'],
      enabled: true,
      createdAt: '2024-01-10T10:00:00Z',
      lastUsed: '2024-01-15T09:30:00Z',
      usageCount: 15847,
      rateLimit: 1000,
      environment: 'production'
    },
    {
      id: '2',
      name: 'Development Key',
      key: 'sk_dev_fedcba0987654321',
      permissions: ['read', 'write'],
      enabled: true,
      createdAt: '2024-01-08T14:20:00Z',
      lastUsed: '2024-01-15T11:15:00Z',
      usageCount: 3421,
      rateLimit: 500,
      environment: 'development'
    }
  ]);

  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([
    {
      id: '1',
      name: 'Alert Notifications',
      url: 'https://api.company.com/webhooks/alerts',
      events: ['alert.created', 'alert.resolved', 'threat.detected'],
      enabled: true,
      secret: 'whsec_abcdef123456',
      lastTriggered: '2024-01-15T10:45:00Z',
      successRate: 98.7,
      retries: 3,
      timeout: 30,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token123' }
    },
    {
      id: '2',
      name: 'Incident Reports',
      url: 'https://incident-manager.company.com/webhook',
      events: ['incident.created', 'incident.escalated'],
      enabled: false,
      secret: 'whsec_789xyz987654',
      successRate: 95.2,
      retries: 5,
      timeout: 60,
      headers: { 'Content-Type': 'application/json' }
    }
  ]);

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Security Slack Channel',
      type: 'slack',
      enabled: true,
      config: { webhook: 'https://hooks.slack.com/...', channel: '#security-alerts' },
      status: 'connected',
      lastSync: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Microsoft Teams',
      type: 'teams',
      enabled: true,
      config: { webhook: 'https://outlook.office.com/webhook/...' },
      status: 'connected',
      lastSync: '2024-01-15T09:45:00Z'
    },
    {
      id: '3',
      name: 'Email Alerts',
      type: 'email',
      enabled: true,
      config: { 
        smtp: 'smtp.company.com', 
        port: 587, 
        username: 'alerts@company.com',
        recipients: ['security@company.com', 'admin@company.com']
      },
      status: 'connected',
      lastSync: '2024-01-15T11:00:00Z'
    }
  ]);

  const generateApiKey = async () => {
    setIsGenerating(true);
    // Simulate API key generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: `sk_${Math.random().toString(36).substr(2, 20)}`,
      permissions: ['read'],
      enabled: true,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      rateLimit: 100,
      environment: 'development'
    };
    
    setApiKeys(prev => [newKey, ...prev]);
    setIsGenerating(false);
  };

  const testIntegration = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    setIntegrations(prev => prev.map(i => 
      i.id === integrationId ? { ...i, status: 'testing' } : i
    ));

    // Simulate test
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const success = Math.random() > 0.2; // 80% success rate
    const result: TestResult = {
      success,
      message: success ? 'Connection successful' : 'Connection failed - timeout',
      duration: Math.floor(Math.random() * 3000) + 500,
      timestamp: new Date().toISOString(),
      details: success ? { statusCode: 200 } : { error: 'Network timeout' }
    };

    setTestResults(prev => ({ ...prev, [integrationId]: result }));
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId ? { 
        ...i, 
        status: success ? 'connected' : 'error',
        errorMessage: success ? undefined : result.message
      } : i
    ));
  };

  const testWebhook = async (webhookId: string) => {
    const webhook = webhooks.find(w => w.id === webhookId);
    if (!webhook) return;

    const success = Math.random() > 0.15; // 85% success rate
    const result: TestResult = {
      success,
      message: success ? 'Webhook delivered successfully' : 'Webhook delivery failed',
      duration: Math.floor(Math.random() * 2000) + 200,
      timestamp: new Date().toISOString(),
      details: success ? { statusCode: 200, responseTime: '145ms' } : { error: 'HTTP 500' }
    };

    setTestResults(prev => ({ ...prev, [webhookId]: result }));
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'disconnected': return 'text-gray-500';
      case 'error': return 'text-red-500';
      case 'testing': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-600';
      case 'disconnected': return 'bg-gray-600';
      case 'error': return 'bg-red-600';
      case 'testing': return 'bg-yellow-600 animate-pulse';
      default: return 'bg-gray-600';
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'slack': return <Slack className="w-5 h-5" />;
      case 'teams': return <MessageSquare className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'webhook': return <Webhook className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-red-500" />
            APIs & Integration Settings
          </h1>
          <p className="text-gray-400 mt-2">Manage API keys, webhooks, and external integrations</p>
        </div>
        <div className="flex gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-400">Active API Keys</p>
                  <p className="text-xl font-bold text-white">{apiKeys.filter(k => k.enabled).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-400">Connected</p>
                  <p className="text-xl font-bold text-white">
                    {integrations.filter(i => i.status === 'connected').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="api-keys" className="data-[state=active]:bg-red-600">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-red-600">
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-red-600">
            <Zap className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="testing" className="data-[state=active]:bg-red-600">
            <TestTube className="w-4 h-4 mr-2" />
            Testing
          </TabsTrigger>
        </TabsList>

        {/* API Keys */}
        <TabsContent value="api-keys" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">API Key Management</h2>
            <Button 
              onClick={generateApiKey} 
              disabled={isGenerating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Key'}
            </Button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold">{apiKey.name}</h3>
                        <Badge className={apiKey.enabled ? 'bg-green-600' : 'bg-gray-600'}>
                          {apiKey.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize">
                          {apiKey.environment}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Label className="text-gray-400">API Key:</Label>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-700 px-2 py-1 rounded text-white font-mono text-sm">
                            {showApiKey[apiKey.id] ? apiKey.key : '•��••••••••••••••••••'}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowApiKey(prev => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}
                            className="text-gray-400 hover:text-white"
                          >
                            {showApiKey[apiKey.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyApiKey(apiKey.key)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Usage:</span>
                          <p className="text-white">{apiKey.usageCount.toLocaleString()} requests</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Rate Limit:</span>
                          <p className="text-white">{apiKey.rateLimit}/hour</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Used:</span>
                          <p className="text-white">
                            {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <p className="text-white">{new Date(apiKey.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <span className="text-gray-500 text-sm">Permissions:</span>
                        <div className="flex gap-1 mt-1">
                          {apiKey.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="border-blue-600 text-blue-400">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Switch
                        checked={apiKey.enabled}
                        onCheckedChange={(checked) => {
                          setApiKeys(prev => prev.map(k => 
                            k.id === apiKey.id ? { ...k, enabled: checked } : k
                          ));
                        }}
                      />
                      <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-900">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Webhook Endpoints</h2>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Webhook
            </Button>
          </div>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold">{webhook.name}</h3>
                        <Badge className={webhook.enabled ? 'bg-green-600' : 'bg-gray-600'}>
                          {webhook.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="border-green-600 text-green-400">
                          {webhook.successRate}% Success
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div>
                          <Label className="text-gray-400">URL:</Label>
                          <p className="text-white font-mono text-sm">{webhook.url}</p>
                        </div>
                        
                        <div>
                          <Label className="text-gray-400">Events:</Label>
                          <div className="flex gap-1 mt-1">
                            {webhook.events.map((event) => (
                              <Badge key={event} variant="outline" className="border-blue-600 text-blue-400">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Timeout:</span>
                          <p className="text-white">{webhook.timeout}s</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Retries:</span>
                          <p className="text-white">{webhook.retries}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Triggered:</span>
                          <p className="text-white">
                            {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleString() : 'Never'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Success Rate:</span>
                          <p className="text-white">{webhook.successRate}%</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => testWebhook(webhook.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <TestTube className="w-3 h-3 mr-1" />
                        Test
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {testResults[webhook.id] && (
                    <Alert className={testResults[webhook.id].success ? "bg-green-900/50 border-green-700" : "bg-red-900/50 border-red-700"}>
                      {testResults[webhook.id].success ? 
                        <CheckCircle className="h-4 w-4 text-green-400" /> :
                        <XCircle className="h-4 w-4 text-red-400" />
                      }
                      <AlertDescription className={testResults[webhook.id].success ? "text-green-100" : "text-red-100"}>
                        {testResults[webhook.id].message} ({testResults[webhook.id].duration}ms)
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">External Integrations</h2>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getIntegrationIcon(integration.type)}
                      <div>
                        <h3 className="text-white font-semibold">{integration.name}</h3>
                        <p className="text-gray-400 text-sm capitalize">{integration.type}</p>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeColor(integration.status)}>
                      {integration.status}
                    </Badge>
                  </div>
                  
                  {integration.errorMessage && (
                    <Alert className="mb-4 bg-red-900/50 border-red-700">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-100">
                        {integration.errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={getStatusColor(integration.status)}>
                        {integration.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Sync:</span>
                      <span className="text-white">
                        {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Enabled:</span>
                      <Switch
                        checked={integration.enabled}
                        onCheckedChange={(checked) => {
                          setIntegrations(prev => prev.map(i => 
                            i.id === integration.id ? { ...i, enabled: checked } : i
                          ));
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => testIntegration(integration.id)}
                      disabled={integration.status === 'testing'}
                      className="bg-blue-600 hover:bg-blue-700 flex-1"
                    >
                      {integration.status === 'testing' ? (
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <TestTube className="w-3 h-3 mr-1" />
                      )}
                      {integration.status === 'testing' ? 'Testing...' : 'Test'}
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  {testResults[integration.id] && (
                    <Alert className={`mt-3 ${testResults[integration.id].success ? "bg-green-900/50 border-green-700" : "bg-red-900/50 border-red-700"}`}>
                      {testResults[integration.id].success ? 
                        <CheckCircle className="h-4 w-4 text-green-400" /> :
                        <XCircle className="h-4 w-4 text-red-400" />
                      }
                      <AlertDescription className={testResults[integration.id].success ? "text-green-100" : "text-red-100"}>
                        {testResults[integration.id].message}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Testing */}
        <TabsContent value="testing" className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Connectivity Testing</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-blue-500" />
                  API Endpoint Test
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Test API connectivity and response times
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-400">Endpoint URL</Label>
                  <Input 
                    placeholder="https://api.example.com/test"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Method</Label>
                  <Select defaultValue="GET">
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-400">Headers</Label>
                  <Textarea 
                    placeholder="Authorization: Bearer token&#10;Content-Type: application/json"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <TestTube className="w-4 h-4 mr-2" />
                  Run Test
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  Recent Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(testResults).slice(-5).map(([id, result]) => (
                    <div key={id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        {result.success ? 
                          <CheckCircle className="w-5 h-5 text-green-500" /> :
                          <XCircle className="w-5 h-5 text-red-500" />
                        }
                        <div>
                          <p className="text-white font-medium">{result.message}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(result.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {result.duration}ms
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-500" />
                Sample Code Examples
              </CardTitle>
              <CardDescription className="text-gray-400">
                Implementation examples for common integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="curl" className="space-y-4">
                <TabsList className="bg-gray-700">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>
                
                <TabsContent value="curl">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-gray-300 text-sm overflow-x-auto">
{`curl -X POST https://api.securemail.com/v1/alerts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Test Alert",
    "severity": "high",
    "description": "Testing API integration"
  }'`}
                    </pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="javascript">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-gray-300 text-sm overflow-x-auto">
{`const response = await fetch('https://api.securemail.com/v1/alerts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Test Alert',
    severity: 'high',
    description: 'Testing API integration'
  })
});`}
                    </pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="python">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-gray-300 text-sm overflow-x-auto">
{`import requests

response = requests.post(
    'https://api.securemail.com/v1/alerts',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'title': 'Test Alert',
        'severity': 'high',
        'description': 'Testing API integration'
    }
)`}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationSettings;
