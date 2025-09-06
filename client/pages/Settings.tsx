import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  User,
  Key,
  Database,
  Mail,
  MessageSquare,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle,
  TestTube,
  BarChart3
} from 'lucide-react';

interface SecuritySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  level: 'low' | 'medium' | 'high';
}

const securitySettings: SecuritySetting[] = [
  {
    id: 'real-time-scanning',
    name: 'Real-time Scanning',
    description: 'Automatically scan incoming messages in real-time',
    enabled: true,
    level: 'high'
  },
  {
    id: 'quarantine-suspicious',
    name: 'Quarantine Suspicious Messages',
    description: 'Automatically quarantine messages with medium confidence scores',
    enabled: true,
    level: 'medium'
  },
  {
    id: 'block-known-senders',
    name: 'Block Known Spam Senders',
    description: 'Automatically block messages from known spam sources',
    enabled: true,
    level: 'high'
  },
  {
    id: 'content-analysis',
    name: 'Advanced Content Analysis',
    description: 'Use AI-powered deep content analysis for better detection',
    enabled: true,
    level: 'high'
  },
  {
    id: 'url-scanning',
    name: 'URL Scanning',
    description: 'Scan URLs in messages for malicious content',
    enabled: true,
    level: 'medium'
  }
];

export default function Settings() {
  const [settings, setSettings] = useState(securitySettings);
  const [confidenceThreshold, setConfidenceThreshold] = useState([85]);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    desktop: false,
    summary: true
  });
  const [userProfile, setUserProfile] = useState({
    name: 'Admin User',
    email: 'admin@securemail.com',
    role: 'Administrator',
    timezone: 'UTC-5'
  });
  const [apiSettings, setApiSettings] = useState({
    rateLimit: 1000,
    timeout: 30,
    retries: 3,
    batchSize: 50
  });
  const [dataRetention, setDataRetention] = useState(90);

  const toggleSetting = (id: string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const saveSettings = () => {
    // Simulate saving settings
    alert('Settings saved successfully!');
  };

  const resetSettings = () => {
    setSettings(securitySettings);
    setConfidenceThreshold([85]);
    setDataRetention(90);
    alert('Settings reset to defaults!');
  };

  const exportSettings = () => {
    const settingsData = {
      security: settings,
      confidenceThreshold: confidenceThreshold[0],
      notifications,
      apiSettings,
      dataRetention
    };
    
    const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'securemail-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-warning/20 text-warning border-warning">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">{level}</Badge>;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure your SecureMail preferences and security settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetSettings} className="bg-black text-white border-black hover:bg-gray-800 hover:text-white">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="security" className="w-full thin-scrollbar">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="facelock">Face Lock</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Features */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.map((setting) => (
                  <div key={setting.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={setting.id} className="font-medium">
                            {setting.name}
                          </Label>
                          {getLevelBadge(setting.level)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {setting.description}
                        </p>
                      </div>
                      <Switch
                        id={setting.id}
                        checked={setting.enabled}
                        onCheckedChange={() => toggleSetting(setting.id)}
                      />
                    </div>
                    <Separator />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Detection Thresholds */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Detection Thresholds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Confidence Threshold: {confidenceThreshold[0]}%</Label>
                    <Slider
                      value={confidenceThreshold}
                      onValueChange={setConfidenceThreshold}
                      max={100}
                      min={50}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Messages below this threshold will be flagged as suspicious
                    </p>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Higher thresholds increase security but may result in more false positives.
                      Current setting: {confidenceThreshold[0] >= 90 ? 'Very Strict' : 
                                       confidenceThreshold[0] >= 80 ? 'Strict' : 
                                       confidenceThreshold[0] >= 70 ? 'Moderate' : 'Lenient'}
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Action Thresholds</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Auto-block (Spam)</span>
                      <Badge variant="destructive">≥95%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Quarantine (Suspicious)</span>
                      <Badge variant="secondary" className="bg-warning/20 text-warning border-warning">
                        {confidenceThreshold[0]}-94%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Allow (Clean)</span>
                      <Badge variant="secondary" className="bg-success/20 text-success border-success">
                        &lt;{confidenceThreshold[0]}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="facelock" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Face Lock Configuration */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Face Lock Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enable-facelock">Enable Face Lock</Label>
                    <p className="text-sm text-muted-foreground">
                      Use facial recognition for secure authentication
                    </p>
                  </div>
                  <Switch
                    id="enable-facelock"
                    defaultChecked={true}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sensitivity Level</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - More tolerant (may allow similar faces)</SelectItem>
                        <SelectItem value="medium">Medium - Balanced security</SelectItem>
                        <SelectItem value="high">High - Maximum security (may require multiple attempts)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Require Periodic Re-verification</Label>
                      <p className="text-sm text-muted-foreground">
                        Require face verification every 24 hours
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>

                  <div className="space-y-2">
                    <Label>Camera Quality</Label>
                    <Select defaultValue="auto">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto - Best available quality</SelectItem>
                        <SelectItem value="hd">HD (1280x720) - High quality</SelectItem>
                        <SelectItem value="standard">Standard (640x480) - Faster processing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Re-train Face Lock
                  </Button>
                  <Button variant="outline" className="w-full">
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Face Recognition
                  </Button>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Disable Face Lock
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Face Lock Status */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Face Lock Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Verification</span>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Next Required</span>
                    <span className="text-sm text-muted-foreground">In 22 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Successful Attempts</span>
                    <span className="text-sm text-muted-foreground">247 / 251</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Security Information</h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Face data encrypted with AES-256</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Processing done locally on device</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>No biometric data sent to servers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Compliant with GDPR and CCPA</span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Your face lock data is stored securely on your device and never transmitted over the internet.
                    Even if compromised, the encrypted data cannot be used to reconstruct your facial features.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Preferences */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email alerts for spam detection
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.email}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, email: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive SMS alerts for critical threats
                      </p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={notifications.sms}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, sms: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show browser notifications
                      </p>
                    </div>
                    <Switch
                      id="desktop-notifications"
                      checked={notifications.desktop}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, desktop: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="summary-notifications">Daily Summary</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive daily activity summaries
                      </p>
                    </div>
                    <Switch
                      id="summary-notifications"
                      checked={notifications.summary}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, summary: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Channels */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Notification Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-address">Email Address</Label>
                    <Input
                      id="email-address"
                      type="email"
                      placeholder="admin@securemail.com"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <Input
                      id="phone-number"
                      type="tel"
                      placeholder="+1-555-0123"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notification-frequency">Notification Frequency</Label>
                    <Select defaultValue="immediate">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Profile */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  User Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={userProfile.name}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue={userProfile.role}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrator">Administrator</SelectItem>
                      <SelectItem value="Operator">Operator</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue={userProfile.timezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="UTC+0">UTC</SelectItem>
                      <SelectItem value="UTC+1">Central European Time (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>

                <Button className="w-full">
                  Update Password
                </Button>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enable 2FA</span>
                    <Switch defaultChecked={false} />
                  </div>
                  <Button variant="outline" className="w-full">
                    Configure 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Configuration */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  API Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rate-limit">Rate Limit (requests/hour)</Label>
                  <Input
                    id="rate-limit"
                    type="number"
                    value={apiSettings.rateLimit}
                    onChange={(e) => setApiSettings(prev => ({ ...prev, rateLimit: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout">Request Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={apiSettings.timeout}
                    onChange={(e) => setApiSettings(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retries">Max Retries</Label>
                  <Input
                    id="retries"
                    type="number"
                    value={apiSettings.retries}
                    onChange={(e) => setApiSettings(prev => ({ ...prev, retries: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    value={apiSettings.batchSize}
                    onChange={(e) => setApiSettings(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* API Keys */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 rounded border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">Production Key</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          sk-****-****-****-1234
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-success/20 text-success border-success">
                        Active
                      </Badge>
                    </div>
                  </div>

                  <div className="p-3 rounded border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">Development Key</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          sk-****-****-****-5678
                        </div>
                      </div>
                      <Badge variant="secondary">
                        Inactive
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  Generate New API Key
                </Button>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Keep your API keys secure. Never share them publicly or commit them to version control.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          {/* Scrollbar Showcase */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Custom Scrollbar Showcase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Standard Custom Scrollbar */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Standard Scrollbar</Label>
                  <div className="h-32 bg-muted/30 rounded border custom-scrollbar overflow-y-auto p-3">
                    <div className="space-y-2">
                      {Array.from({ length: 20 }, (_, i) => (
                        <div key={i} className="bg-primary/10 rounded p-2 text-xs">
                          Custom scrollbar item {i + 1} with smooth gradients
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Animated Scrollbar */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Animated Scrollbar</Label>
                  <div className="h-32 bg-muted/30 rounded border animated-scrollbar overflow-y-auto p-3">
                    <div className="space-y-2">
                      {Array.from({ length: 15 }, (_, i) => (
                        <div key={i} className="bg-accent/20 rounded p-2 text-xs">
                          Animated gradient scrollbar {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Glow Scrollbar */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Glow Scrollbar</Label>
                  <div className="h-32 bg-muted/30 rounded border glow-scrollbar overflow-y-auto p-3">
                    <div className="space-y-2">
                      {Array.from({ length: 18 }, (_, i) => (
                        <div key={i} className="bg-destructive/10 rounded p-2 text-xs">
                          Glowing scrollbar item {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Custom Scrollbars:</strong> Hover over the scrollable areas above to see different scrollbar styles.
                  The app uses intelligent scrollbar selection - standard for main content, animated for analytics,
                  glow for threat intelligence, and thin for compact areas.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Management */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Data Retention Period: {dataRetention} days</Label>
                  <Slider
                    value={[dataRetention]}
                    onValueChange={(value) => setDataRetention(value[0])}
                    max={365}
                    min={30}
                    step={30}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Scan records older than this will be automatically deleted
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Storage Usage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Scan Records</span>
                      <span>2.3 GB</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quarantined Messages</span>
                      <span>450 MB</span>
                    </div>
                    <Progress value={23} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Import/Export */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Import/Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Export Data</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" onClick={exportSettings}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Settings
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export Scan History
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export All Data
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Import Data</h4>
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Settings
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium text-destructive">Danger Zone</h4>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    This action cannot be undone. All scan records and settings will be permanently deleted.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
