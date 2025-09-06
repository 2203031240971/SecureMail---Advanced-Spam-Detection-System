import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  User, 
  Users, 
  Mail, 
  Smartphone, 
  Slack,
  MessageSquare,
  Settings,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  ArrowUp,
  Filter,
  Calendar,
  Activity,
  Zap,
  Shield,
  FileText,
  Download
} from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved';
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  source: string;
  affectedUsers: number;
  escalated: boolean;
  autoResolved: boolean;
}

interface EscalationRule {
  id: string;
  name: string;
  enabled: boolean;
  triggers: string[];
  conditions: string[];
  actions: string[];
  timeframe: number;
  recipients: string[];
}

interface NotificationChannel {
  id: string;
  type: 'email' | 'sms' | 'slack' | 'teams' | 'webhook';
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  testStatus: 'success' | 'failed' | 'pending' | 'never';
}

const AlertsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      title: 'Critical Phishing Campaign Detected',
      description: 'Mass phishing attack targeting financial institutions detected from Beijing',
      severity: 'critical',
      type: 'Phishing',
      status: 'investigating',
      assignee: 'admin@company.com',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:45:00Z',
      source: 'AI Detection Engine',
      affectedUsers: 847,
      escalated: true,
      autoResolved: false
    },
    {
      id: '2',
      title: 'Malware Distribution Network',
      description: 'Coordinated malware distribution detected across multiple regions',
      severity: 'high',
      type: 'Malware',
      status: 'acknowledged',
      assignee: 'security@company.com',
      createdAt: '2024-01-15T09:15:00Z',
      updatedAt: '2024-01-15T09:20:00Z',
      source: 'Network Analysis',
      affectedUsers: 234,
      escalated: false,
      autoResolved: false
    },
    {
      id: '3',
      title: 'Spam Volume Spike',
      description: 'Unusual spike in spam volume from known botnet',
      severity: 'medium',
      type: 'Spam',
      status: 'resolved',
      assignee: 'analyst@company.com',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:30:00Z',
      source: 'Volume Monitor',
      affectedUsers: 156,
      escalated: false,
      autoResolved: true
    }
  ]);

  const [escalationRules] = useState<EscalationRule[]>([
    {
      id: '1',
      name: 'Critical Threat Auto-Escalation',
      enabled: true,
      triggers: ['severity:critical', 'affected_users:>500'],
      conditions: ['no_response:15min', 'not_acknowledged'],
      actions: ['notify_admin', 'create_incident', 'auto_block'],
      timeframe: 15,
      recipients: ['admin@company.com', 'security-team@company.com']
    },
    {
      id: '2',
      name: 'High Volume Attack Response',
      enabled: true,
      triggers: ['type:phishing', 'volume:>100'],
      conditions: ['timeframe:1hour'],
      actions: ['notify_soc', 'enhance_filtering'],
      timeframe: 60,
      recipients: ['soc@company.com']
    }
  ]);

  const [channels] = useState<NotificationChannel[]>([
    {
      id: '1',
      type: 'email',
      name: 'Security Team Email',
      enabled: true,
      config: { recipients: ['security@company.com', 'admin@company.com'] },
      testStatus: 'success'
    },
    {
      id: '2',
      type: 'slack',
      name: 'Security Slack Channel',
      enabled: true,
      config: { webhook: 'https://hooks.slack.com/...', channel: '#security-alerts' },
      testStatus: 'success'
    },
    {
      id: '3',
      type: 'sms',
      name: 'Emergency SMS',
      enabled: false,
      config: { numbers: ['+1234567890'] },
      testStatus: 'never'
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 animate-pulse';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-500';
      case 'acknowledged': return 'text-yellow-500';
      case 'investigating': return 'text-orange-500';
      case 'resolved': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      case 'slack': return <Slack className="w-4 h-4" />;
      case 'teams': return <MessageSquare className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const updateAlertStatus = (alertId: string, newStatus: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: newStatus as any, updatedAt: new Date().toISOString() }
        : alert
    ));
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-red-500" />
            Automated Alerts & Incident Management
          </h1>
          <p className="text-gray-400 mt-2">Intelligent threat response and escalation workflows</p>
        </div>
        <div className="flex gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-400">Active Alerts</p>
                  <p className="text-xl font-bold text-white">
                    {alerts.filter(a => a.status !== 'resolved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ArrowUp className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-400">Escalated</p>
                  <p className="text-xl font-bold text-white">
                    {alerts.filter(a => a.escalated).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="alerts" className="data-[state=active]:bg-red-600">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Active Alerts
          </TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-red-600">
            <Settings className="w-4 h-4 mr-2" />
            Escalation Rules
          </TabsTrigger>
          <TabsTrigger value="channels" className="data-[state=active]:bg-red-600">
            <Bell className="w-4 h-4 mr-2" />
            Notification Channels
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-red-600">
            <FileText className="w-4 h-4 mr-2" />
            Event Logs
          </TabsTrigger>
        </TabsList>

        {/* Active Alerts */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="flex items-center gap-4">
            <Button className="bg-red-600 hover:bg-red-700">
              <Filter className="w-4 h-4 mr-2" />
              Filter Alerts
            </Button>
            <Select defaultValue="all">
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">{alert.title}</h3>
                        <Badge className={getSeverityBadgeColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={`border-gray-600 ${getStatusColor(alert.status)}`}>
                          {alert.status.toUpperCase()}
                        </Badge>
                        {alert.escalated && (
                          <Badge className="bg-red-600 animate-pulse">
                            <ArrowUp className="w-3 h-3 mr-1" />
                            ESCALATED
                          </Badge>
                        )}
                        {alert.autoResolved && (
                          <Badge className="bg-blue-600">
                            <Zap className="w-3 h-3 mr-1" />
                            AUTO-RESOLVED
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-400 mb-3">{alert.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <p className="text-white">{alert.type}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Source:</span>
                          <p className="text-white">{alert.source}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Affected Users:</span>
                          <p className="text-white">{alert.affectedUsers.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Assignee:</span>
                          <p className="text-white">{alert.assignee || 'Unassigned'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {alert.status !== 'resolved' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-white hover:bg-gray-700"
                            onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => updateAlertStatus(alert.id, 'resolved')}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Resolve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-700">
                    <div className="flex items-center gap-4">
                      <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
                      <span>Updated: {new Date(alert.updatedAt).toLocaleString()}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <FileText className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Escalation Rules */}
        <TabsContent value="rules" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Escalation Rules</h2>
            <Button className="bg-red-600 hover:bg-red-700">
              <Play className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </div>

          <div className="space-y-4">
            {escalationRules.map((rule) => (
              <Card key={rule.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold">{rule.name}</h3>
                      <p className="text-gray-400 text-sm">Timeframe: {rule.timeframe} minutes</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={rule.enabled} />
                      <span className={rule.enabled ? 'text-green-400' : 'text-gray-500'}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Triggers</h4>
                      <div className="space-y-1">
                        {rule.triggers.map((trigger, index) => (
                          <Badge key={index} variant="outline" className="border-blue-600 text-blue-400 mr-1 mb-1">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-2">Conditions</h4>
                      <div className="space-y-1">
                        {rule.conditions.map((condition, index) => (
                          <Badge key={index} variant="outline" className="border-yellow-600 text-yellow-400 mr-1 mb-1">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-2">Actions</h4>
                      <div className="space-y-1">
                        {rule.actions.map((action, index) => (
                          <Badge key={index} variant="outline" className="border-green-600 text-green-400 mr-1 mb-1">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-700">
                    <h4 className="text-white font-medium mb-2">Recipients</h4>
                    <div className="flex gap-2">
                      {rule.recipients.map((recipient, index) => (
                        <Badge key={index} className="bg-gray-700">
                          <User className="w-3 h-3 mr-1" />
                          {recipient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Notification Channels */}
        <TabsContent value="channels" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Notification Channels</h2>
            <Button className="bg-red-600 hover:bg-red-700">
              <Bell className="w-4 h-4 mr-2" />
              Add Channel
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {channels.map((channel) => (
              <Card key={channel.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getChannelIcon(channel.type)}
                      <div>
                        <h3 className="text-white font-semibold">{channel.name}</h3>
                        <p className="text-gray-400 text-sm capitalize">{channel.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={channel.enabled} />
                      <Badge className={
                        channel.testStatus === 'success' ? 'bg-green-600' :
                        channel.testStatus === 'failed' ? 'bg-red-600' :
                        channel.testStatus === 'pending' ? 'bg-yellow-600' :
                        'bg-gray-600'
                      }>
                        {channel.testStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-gray-400">Configuration</Label>
                      <div className="bg-gray-700 rounded p-3 mt-1">
                        <code className="text-gray-300 text-sm">
                          {JSON.stringify(channel.config, null, 2)}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                      <Settings className="w-3 h-3 mr-1" />
                      Configure
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Zap className="w-3 h-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Event Logs */}
        <TabsContent value="logs" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Event Logs</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-0">
              <div className="space-y-0">
                {[
                  { time: '10:45:23', action: 'Alert Escalated', details: 'Critical phishing alert escalated to admin team', severity: 'critical' },
                  { time: '10:30:15', action: 'Alert Created', details: 'New phishing campaign detected from Beijing', severity: 'critical' },
                  { time: '09:20:42', action: 'Alert Acknowledged', details: 'Malware alert acknowledged by security@company.com', severity: 'high' },
                  { time: '09:15:30', action: 'Alert Created', details: 'Malware distribution network detected', severity: 'high' },
                  { time: '08:30:11', action: 'Alert Resolved', details: 'Spam volume spike automatically resolved', severity: 'medium' },
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-750">
                    <div className="flex items-center gap-4">
                      <Badge className={getSeverityBadgeColor(log.severity)}>
                        {log.severity}
                      </Badge>
                      <div>
                        <p className="text-white font-medium">{log.action}</p>
                        <p className="text-gray-400 text-sm">{log.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock className="w-4 h-4" />
                      {log.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertsManagement;
