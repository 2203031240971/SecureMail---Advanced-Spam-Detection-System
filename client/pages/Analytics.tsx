import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Shield, 
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Users,
  Globe,
  Activity,
  Calendar,
  Zap
} from 'lucide-react';

interface AnalyticsStat {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

interface ThreatCategory {
  name: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface TimeSeriesData {
  date: string;
  total: number;
  spam: number;
  clean: number;
}

const analyticsStats: AnalyticsStat[] = [
  {
    title: 'Total Scans Today',
    value: 147,
    change: '+23% from yesterday',
    changeType: 'positive',
    icon: <Activity className="h-4 w-4 text-primary" />
  },
  {
    title: 'Spam Detection Rate',
    value: '89.2%',
    change: '+2.1% this week',
    changeType: 'positive',
    icon: <Shield className="h-4 w-4 text-success" />
  },
  {
    title: 'False Positives',
    value: '3.1%',
    change: '-0.8% this week',
    changeType: 'positive',
    icon: <Target className="h-4 w-4 text-warning" />
  },
  {
    title: 'Avg Response Time',
    value: '1.2s',
    change: '-0.3s improvement',
    changeType: 'positive',
    icon: <Clock className="h-4 w-4 text-blue-400" />
  }
];

const threatCategories: ThreatCategory[] = [
  { name: 'Phishing', count: 142, percentage: 38, trend: 'up', color: 'bg-red-500' },
  { name: 'Scam', count: 98, percentage: 26, trend: 'down', color: 'bg-orange-500' },
  { name: 'Promotional Spam', count: 75, percentage: 20, trend: 'stable', color: 'bg-yellow-500' },
  { name: 'Malware', count: 34, percentage: 9, trend: 'down', color: 'bg-purple-500' },
  { name: 'Social Engineering', count: 26, percentage: 7, trend: 'up', color: 'bg-pink-500' }
];

const weeklyData: TimeSeriesData[] = [
  { date: 'Mon', total: 156, spam: 48, clean: 108 },
  { date: 'Tue', total: 142, spam: 52, clean: 90 },
  { date: 'Wed', total: 189, spam: 71, clean: 118 },
  { date: 'Thu', total: 167, spam: 58, clean: 109 },
  { date: 'Fri', total: 203, spam: 89, clean: 114 },
  { date: 'Sat', total: 98, spam: 31, clean: 67 },
  { date: 'Sun', total: 87, spam: 24, clean: 63 }
];

const topSenders = [
  { sender: 'phishing@fake-bank.com', count: 23, blocked: 23, rate: 100 },
  { sender: 'winner@lottery-scam.net', count: 18, blocked: 18, rate: 100 },
  { sender: 'urgent@suspicious-domain.fake', count: 15, blocked: 14, rate: 93 },
  { sender: 'promo@spam-central.biz', count: 12, blocked: 11, rate: 92 },
  { sender: 'security@fake-microsoft.com', count: 9, blocked: 9, rate: 100 }
];

const geoData = [
  { country: 'United States', threats: 234, percentage: 42 },
  { country: 'Russia', threats: 156, percentage: 28 },
  { country: 'China', threats: 89, percentage: 16 },
  { country: 'Nigeria', threats: 45, percentage: 8 },
  { country: 'Other', threats: 33, percentage: 6 }
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const renderBarChart = (data: TimeSeriesData[]) => {
    const maxValue = Math.max(...data.map(d => d.total));
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{item.date}</span>
              <span className="text-muted-foreground">{item.total}</span>
            </div>
            <div className="flex h-6 rounded overflow-hidden bg-muted">
              <div 
                className="bg-success" 
                style={{ width: `${(item.clean / maxValue) * 100}%` }}
              />
              <div 
                className="bg-destructive" 
                style={{ width: `${(item.spam / maxValue) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Clean: {item.clean}</span>
              <span>Spam: {item.spam}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive spam detection analytics and insights</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsStats.map((stat, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className={`text-xs flex items-center gap-1 ${
                    stat.changeType === 'positive' ? 'text-success' : 
                    stat.changeType === 'negative' ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : stat.changeType === 'negative' ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : null}
                    {stat.change}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-muted">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threat Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderBarChart(weeklyData)}
                <div className="flex justify-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success rounded"></div>
                    <span>Clean Messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-destructive rounded"></div>
                    <span>Spam Messages</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Message Types */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Message Type Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">68%</span>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-[68%] h-full bg-primary"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>SMS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">32%</span>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-[32%] h-full bg-primary"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-3">Detection Accuracy</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Accuracy</span>
                      <span className="font-medium">96.7%</span>
                    </div>
                    <Progress value={96.7} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="threats" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Threat Categories */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Threat Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threatCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                          <span className="font-medium">{category.name}</span>
                          {category.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-destructive" />
                          ) : category.trend === 'down' ? (
                            <TrendingDown className="h-3 w-3 text-success" />
                          ) : null}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{category.count}</div>
                          <div className="text-xs text-muted-foreground">{category.percentage}%</div>
                        </div>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Threat Sources */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Top Threat Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topSenders.map((sender, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded border bg-muted/30">
                      <div className="space-y-1">
                        <div className="font-medium text-sm truncate max-w-48">
                          {sender.sender}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {sender.count} attempts
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={sender.rate === 100 ? "destructive" : "secondary"}
                          className={sender.rate === 100 ? "" : "bg-warning/20 text-warning border-warning"}
                        >
                          {sender.rate}% blocked
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Performance */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>23%</span>
                  </div>
                  <Progress value={23} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Queue Depth</span>
                    <span>12</span>
                  </div>
                  <Progress value={12} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Detection Metrics */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Detection Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-success">96.7%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-success">98.2%</div>
                    <div className="text-xs text-muted-foreground">Sensitivity</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-primary">94.8%</div>
                    <div className="text-xs text-muted-foreground">Specificity</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Performance */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>API Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Response Time</span>
                    <span className="font-medium">1.2s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Requests/minute</span>
                    <span className="font-medium">847</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-medium text-success">99.9%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Uptime</span>
                    <span className="font-medium text-success">99.98%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Geographic Distribution */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Threat Origins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {geoData.map((country, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{country.country}</span>
                        <div className="text-right">
                          <div className="font-medium">{country.threats}</div>
                          <div className="text-xs text-muted-foreground">{country.percentage}%</div>
                        </div>
                      </div>
                      <Progress value={country.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Zone Activity */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Activity by Time Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-sm text-muted-foreground mb-4">
                    Peak activity hours (UTC)
                  </div>
                  
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from({length: 24}, (_, i) => (
                      <div key={i} className="text-center">
                        <div className="text-xs mb-1">{i.toString().padStart(2, '0')}</div>
                        <div 
                          className="w-full bg-muted rounded"
                          style={{ 
                            height: `${Math.random() * 40 + 10}px`,
                            backgroundColor: Math.random() > 0.5 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
                          }}
                        ></div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    Highest activity: 14:00-16:00 UTC
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
