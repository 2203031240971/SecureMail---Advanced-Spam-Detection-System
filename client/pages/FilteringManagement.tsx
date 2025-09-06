import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Filter, 
  Plus, 
  Trash2, 
  Edit, 
  Brain, 
  Sparkles, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Target,
  List,
  Settings,
  Download,
  Upload,
  Zap,
  TrendingUp,
  Clock,
  User,
  Globe,
  Eye,
  Shield,
  RefreshCw
} from 'lucide-react';

interface FilterRule {
  id: string;
  name: string;
  type: 'whitelist' | 'blacklist' | 'keyword' | 'domain' | 'ip';
  value: string;
  action: 'allow' | 'block' | 'quarantine' | 'flag';
  enabled: boolean;
  aiSuggested: boolean;
  confidence: number;
  createdAt: string;
  lastMatched?: string;
  matchCount: number;
  source: 'manual' | 'ai' | 'imported';
}

interface AIInsight {
  id: string;
  type: 'suggestion' | 'optimization' | 'warning';
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  status: 'pending' | 'accepted' | 'dismissed';
}

const FilteringManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('rules');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'blacklist' as const,
    value: '',
    action: 'block' as const,
    enabled: true
  });

  const [rules, setRules] = useState<FilterRule[]>([
    {
      id: '1',
      name: 'Phishing Domain Block',
      type: 'domain',
      value: 'suspicious-bank-login.com',
      action: 'block',
      enabled: true,
      aiSuggested: true,
      confidence: 95,
      createdAt: '2024-01-15T10:00:00Z',
      lastMatched: '2024-01-15T10:30:00Z',
      matchCount: 23,
      source: 'ai'
    },
    {
      id: '2',
      name: 'Crypto Scam Keywords',
      type: 'keyword',
      value: 'urgent bitcoin investment opportunity',
      action: 'quarantine',
      enabled: true,
      aiSuggested: true,
      confidence: 88,
      createdAt: '2024-01-15T09:45:00Z',
      lastMatched: '2024-01-15T10:15:00Z',
      matchCount: 67,
      source: 'ai'
    },
    {
      id: '3',
      name: 'Known Botnet IPs',
      type: 'ip',
      value: '192.168.1.100-200',
      action: 'block',
      enabled: true,
      aiSuggested: false,
      confidence: 100,
      createdAt: '2024-01-15T08:00:00Z',
      matchCount: 156,
      source: 'manual'
    },
    {
      id: '4',
      name: 'Trusted Financial Domains',
      type: 'whitelist',
      value: '*.chase.com, *.bankofamerica.com',
      action: 'allow',
      enabled: true,
      aiSuggested: false,
      confidence: 100,
      createdAt: '2024-01-14T16:30:00Z',
      matchCount: 1247,
      source: 'manual'
    }
  ]);

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      type: 'suggestion',
      title: 'New Phishing Pattern Detected',
      description: 'AI has identified a new phishing pattern targeting cryptocurrency users',
      recommendation: 'Add keyword filter: "claim your crypto reward"',
      confidence: 92,
      impact: 'high',
      category: 'Phishing Protection',
      status: 'pending'
    },
    {
      id: '2',
      type: 'optimization',
      title: 'Redundant Rules Detected',
      description: 'Multiple rules are blocking similar content with overlap',
      recommendation: 'Consolidate rules for "investment opportunity" keywords',
      confidence: 78,
      impact: 'medium',
      category: 'Performance',
      status: 'pending'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Whitelist Entry Compromised',
      description: 'A previously trusted domain is now showing suspicious activity',
      recommendation: 'Review and potentially remove "marketing-deals.com" from whitelist',
      confidence: 85,
      impact: 'high',
      category: 'Security Alert',
      status: 'pending'
    }
  ]);

  const addRule = () => {
    if (!newRule.name || !newRule.value) return;

    const rule: FilterRule = {
      id: Date.now().toString(),
      ...newRule,
      aiSuggested: false,
      confidence: 100,
      createdAt: new Date().toISOString(),
      matchCount: 0,
      source: 'manual'
    };

    setRules(prev => [rule, ...prev]);
    setNewRule({
      name: '',
      type: 'blacklist',
      value: '',
      action: 'block',
      enabled: true
    });
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(rule => rule.id !== id));
  };

  const handleAIInsight = (insightId: string, action: 'accept' | 'dismiss') => {
    setAiInsights(prev => prev.map(insight => 
      insight.id === insightId ? { ...insight, status: action === 'accept' ? 'accepted' : 'dismissed' } : insight
    ));

    if (action === 'accept') {
      const insight = aiInsights.find(i => i.id === insightId);
      if (insight && insight.type === 'suggestion') {
        // Auto-create rule from AI suggestion
        const autoRule: FilterRule = {
          id: Date.now().toString(),
          name: `AI Suggested: ${insight.title}`,
          type: 'keyword',
          value: insight.recommendation.split('"')[1] || insight.recommendation,
          action: 'quarantine',
          enabled: true,
          aiSuggested: true,
          confidence: insight.confidence,
          createdAt: new Date().toISOString(),
          matchCount: 0,
          source: 'ai'
        };
        setRules(prev => [autoRule, ...prev]);
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whitelist': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'blacklist': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'keyword': return <Target className="w-4 h-4 text-blue-500" />;
      case 'domain': return <Globe className="w-4 h-4 text-purple-500" />;
      case 'ip': return <Shield className="w-4 h-4 text-orange-500" />;
      default: return <Filter className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'allow': return 'text-green-500';
      case 'block': return 'text-red-500';
      case 'quarantine': return 'text-yellow-500';
      case 'flag': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return <Sparkles className="w-4 h-4 text-blue-500" />;
      case 'optimization': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Brain className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredRules = rules.filter(rule => 
    selectedType === 'all' || rule.type === selectedType
  );

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Filter className="w-8 h-8 text-red-500" />
            Custom Filtering & AI-Adaptive Lists
          </h1>
          <p className="text-gray-400 mt-2">Intelligent content filtering with AI-powered suggestions</p>
        </div>
        <div className="flex gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <List className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-400">Active Rules</p>
                  <p className="text-xl font-bold text-white">{rules.filter(r => r.enabled).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-400">AI Suggested</p>
                  <p className="text-xl font-bold text-white">{rules.filter(r => r.aiSuggested).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="rules" className="data-[state=active]:bg-red-600">
            <List className="w-4 h-4 mr-2" />
            Filter Rules
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="data-[state=active]:bg-red-600">
            <Brain className="w-4 h-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-red-600">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Filter Rules */}
        <TabsContent value="rules" className="space-y-6">
          {/* Add New Rule */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-500" />
                Add New Filter Rule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Rule Name</Label>
                  <Input
                    value={newRule.name}
                    onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter rule name"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Type</Label>
                  <Select value={newRule.type} onValueChange={(value: any) => setNewRule(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="blacklist">Blacklist</SelectItem>
                      <SelectItem value="whitelist">Whitelist</SelectItem>
                      <SelectItem value="keyword">Keyword</SelectItem>
                      <SelectItem value="domain">Domain</SelectItem>
                      <SelectItem value="ip">IP Address</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-400">Filter Value</Label>
                <Textarea
                  value={newRule.value}
                  onChange={(e) => setNewRule(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Enter filter value (domains, keywords, IPs, etc.)"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Action</Label>
                  <Select value={newRule.action} onValueChange={(value: any) => setNewRule(prev => ({ ...prev, action: value }))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="allow">Allow</SelectItem>
                      <SelectItem value="block">Block</SelectItem>
                      <SelectItem value="quarantine">Quarantine</SelectItem>
                      <SelectItem value="flag">Flag for Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={addRule} className="bg-red-600 hover:bg-red-700 w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter and Bulk Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="whitelist">Whitelist</SelectItem>
                  <SelectItem value="blacklist">Blacklist</SelectItem>
                  <SelectItem value="keyword">Keywords</SelectItem>
                  <SelectItem value="domain">Domains</SelectItem>
                  <SelectItem value="ip">IP Addresses</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                {filteredRules.length} rules
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-3">
            {filteredRules.map((rule) => (
              <Card key={rule.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(rule.type)}
                        <h3 className="text-white font-semibold">{rule.name}</h3>
                        <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize">
                          {rule.type}
                        </Badge>
                        <Badge className={getActionColor(rule.action).replace('text-', 'bg-').replace('-500', '-600')}>
                          {rule.action.toUpperCase()}
                        </Badge>
                        {rule.aiSuggested && (
                          <Badge className="bg-purple-600">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Suggested
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-400 mb-3 font-mono text-sm">{rule.value}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Matches:</span>
                          <p className="text-white">{rule.matchCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Confidence:</span>
                          <p className="text-white">{rule.confidence}%</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Source:</span>
                          <p className="text-white capitalize">{rule.source}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Match:</span>
                          <p className="text-white">{rule.lastMatched ? new Date(rule.lastMatched).toLocaleString() : 'Never'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-4">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-white hover:bg-gray-700"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-900"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights */}
        <TabsContent value="ai-insights" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">AI-Powered Insights & Recommendations</h2>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Insights
            </Button>
          </div>

          <div className="space-y-4">
            {aiInsights.map((insight) => (
              <Card key={insight.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getInsightIcon(insight.type)}
                        <h3 className="text-white font-semibold">{insight.title}</h3>
                        <Badge className={
                          insight.impact === 'high' ? 'bg-red-600' :
                          insight.impact === 'medium' ? 'bg-yellow-600' :
                          'bg-green-600'
                        }>
                          {insight.impact.toUpperCase()} IMPACT
                        </Badge>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      
                      <p className="text-gray-400 mb-2">{insight.description}</p>
                      <div className="bg-gray-700 rounded-lg p-3 mb-3">
                        <p className="text-white font-medium">Recommendation:</p>
                        <p className="text-gray-300">{insight.recommendation}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Category: {insight.category}</span>
                        <span>Type: {insight.type}</span>
                      </div>
                    </div>
                    
                    {insight.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAIInsight(insight.id, 'accept')}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-white hover:bg-gray-700"
                          onClick={() => handleAIInsight(insight.id, 'dismiss')}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    )}
                    
                    {insight.status !== 'pending' && (
                      <Badge className={insight.status === 'accepted' ? 'bg-green-600' : 'bg-gray-600'}>
                        {insight.status.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-400">Total Rules</p>
                    <p className="text-2xl font-bold text-white">{rules.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-400">Total Matches</p>
                    <p className="text-2xl font-bold text-white">
                      {rules.reduce((sum, rule) => sum + rule.matchCount, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-400">AI Efficiency</p>
                    <p className="text-2xl font-bold text-white">94.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-400">Threats Blocked</p>
                    <p className="text-2xl font-bold text-white">2,847</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Rule Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rules.slice(0, 5).map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(rule.type)}
                        <span className="text-white">{rule.name}</span>
                      </div>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {rule.matchCount} matches
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Rule Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['blacklist', 'whitelist', 'keyword', 'domain', 'ip'].map((type) => {
                    const count = rules.filter(r => r.type === type).length;
                    const percentage = (count / rules.length) * 100;
                    
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(type)}
                            <span className="text-white capitalize">{type}</span>
                          </div>
                          <span className="text-gray-400">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FilteringManagement;
