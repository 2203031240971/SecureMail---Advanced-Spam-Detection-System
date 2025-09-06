import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  Calendar, 
  Download, 
  Filter,
  Brain,
  Zap,
  AlertTriangle,
  Shield,
  Target,
  Globe,
  Clock,
  Users,
  Mail,
  Eye,
  RefreshCw,
  FileText,
  PieChart,
  LineChart
} from 'lucide-react';

interface ThreatTrend {
  date: string;
  phishing: number;
  malware: number;
  spam: number;
  suspicious: number;
  total: number;
}

interface HeatmapData {
  hour: number;
  day: string;
  value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface IncidentSeverity {
  severity: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  avgResolutionTime: number;
}

interface GeographicData {
  country: string;
  threatCount: number;
  percentage: number;
  primaryType: string;
  riskLevel: number;
}

const AdvancedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('threats');
  const [reportType, setReportType] = useState('summary');

  // Mock data for charts
  const [trendData] = useState<ThreatTrend[]>([
    { date: '2024-01-09', phishing: 145, malware: 89, spam: 234, suspicious: 67, total: 535 },
    { date: '2024-01-10', phishing: 167, malware: 92, spam: 198, suspicious: 73, total: 530 },
    { date: '2024-01-11', phishing: 189, malware: 105, spam: 267, suspicious: 81, total: 642 },
    { date: '2024-01-12', phishing: 223, malware: 118, spam: 189, suspicious: 95, total: 625 },
    { date: '2024-01-13', phishing: 198, malware: 134, spam: 156, suspicious: 88, total: 576 },
    { date: '2024-01-14', phishing: 256, malware: 89, spam: 223, suspicious: 102, total: 670 },
    { date: '2024-01-15', phishing: 301, malware: 145, spam: 198, suspicious: 115, total: 759 }
  ]);

  const [heatmapData] = useState<HeatmapData[]>([
    // Generate 24x7 heatmap data
    ...Array.from({ length: 168 }, (_, i) => ({
      hour: i % 24,
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][Math.floor(i / 24)],
      value: Math.floor(Math.random() * 100) + 20,
      severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any
    }))
  ]);

  const [severityData] = useState<IncidentSeverity[]>([
    { severity: 'Critical', count: 23, percentage: 3.1, trend: 'up', avgResolutionTime: 15 },
    { severity: 'High', count: 156, percentage: 20.8, trend: 'down', avgResolutionTime: 45 },
    { severity: 'Medium', count: 342, percentage: 45.6, trend: 'stable', avgResolutionTime: 120 },
    { severity: 'Low', count: 228, percentage: 30.5, trend: 'down', avgResolutionTime: 240 }
  ]);

  const [geoData] = useState<GeographicData[]>([
    { country: 'China', threatCount: 847, percentage: 35.1, primaryType: 'Phishing', riskLevel: 95 },
    { country: 'Russia', threatCount: 634, percentage: 26.3, primaryType: 'Malware', riskLevel: 88 },
    { country: 'USA', threatCount: 423, percentage: 17.5, primaryType: 'Spam', riskLevel: 45 },
    { country: 'Brazil', threatCount: 298, percentage: 12.4, primaryType: 'Phishing', riskLevel: 67 },
    { country: 'India', threatCount: 211, percentage: 8.7, primaryType: 'Suspicious', riskLevel: 52 }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getHeatmapColor = (value: number) => {
    if (value > 80) return 'bg-red-500';
    if (value > 60) return 'bg-orange-500';
    if (value > 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const generateReport = () => {
    // Mock report generation
    const report = {
      period: timeRange,
      totalThreats: trendData.reduce((sum, day) => sum + day.total, 0),
      avgDaily: Math.round(trendData.reduce((sum, day) => sum + day.total, 0) / trendData.length),
      topThreat: 'Phishing (42.3%)',
      riskScore: 73,
      recommendations: [
        'Increase phishing protection filters',
        'Monitor Chinese IP ranges more closely',
        'Review weekend security coverage'
      ]
    };
    
    console.log('Generated Report:', report);
    // In real implementation, this would trigger a download
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen animated-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-red-500" />
            Enhanced Analytics Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Advanced threat intelligence and AI-driven insights</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateReport} className="bg-red-600 hover:bg-red-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-400">Total Threats</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-white">4,237</p>
                  <div className="flex items-center text-red-400 text-sm">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12.3%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Blocked Rate</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-white">98.7%</p>
                  <div className="flex items-center text-green-400 text-sm">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2.1%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">Avg Response Time</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-white">2.3m</p>
                  <div className="flex items-center text-green-400 text-sm">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    -15.2%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-400">AI Accuracy</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-white">96.2%</p>
                  <div className="flex items-center text-green-400 text-sm">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +0.8%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="trends" className="data-[state=active]:bg-red-600">
            <LineChart className="w-4 h-4 mr-2" />
            Threat Trends
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="data-[state=active]:bg-red-600">
            <Activity className="w-4 h-4 mr-2" />
            Activity Heatmap
          </TabsTrigger>
          <TabsTrigger value="severity" className="data-[state=active]:bg-red-600">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Incident Severity
          </TabsTrigger>
          <TabsTrigger value="geographic" className="data-[state=active]:bg-red-600">
            <Globe className="w-4 h-4 mr-2" />
            Geographic Analysis
          </TabsTrigger>
        </TabsList>

        {/* Threat Trends */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-red-500" />
                  Threat Volume Trends
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Daily threat detection over the past 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Simple trend visualization */}
                  {trendData.map((day, index) => (
                    <div key={day.date} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">
                          {new Date(day.date).toLocaleDateString()}
                        </span>
                        <span className="text-white font-medium">{day.total}</span>
                      </div>
                      <div className="flex space-x-1 h-2">
                        <div 
                          className="bg-red-500 rounded-sm"
                          style={{ width: `${(day.phishing / day.total) * 100}%` }}
                          title={`Phishing: ${day.phishing}`}
                        ></div>
                        <div 
                          className="bg-orange-500 rounded-sm"
                          style={{ width: `${(day.malware / day.total) * 100}%` }}
                          title={`Malware: ${day.malware}`}
                        ></div>
                        <div 
                          className="bg-yellow-500 rounded-sm"
                          style={{ width: `${(day.spam / day.total) * 100}%` }}
                          title={`Spam: ${day.spam}`}
                        ></div>
                        <div 
                          className="bg-blue-500 rounded-sm"
                          style={{ width: `${(day.suspicious / day.total) * 100}%` }}
                          title={`Suspicious: ${day.suspicious}`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-gray-300">Phishing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span className="text-gray-300">Malware</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span className="text-gray-300">Spam</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-gray-300">Suspicious</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Top Threat Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Phishing', count: 1479, percentage: 42.3, color: 'bg-red-500' },
                    { name: 'Spam', count: 1065, percentage: 30.5, color: 'bg-yellow-500' },
                    { name: 'Malware', count: 672, percentage: 19.2, color: 'bg-orange-500' },
                    { name: 'Suspicious', count: 279, percentage: 8.0, color: 'bg-blue-500' }
                  ].map((threat) => (
                    <div key={threat.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white">{threat.name}</span>
                        <div className="text-right">
                          <span className="text-white font-medium">{threat.count}</span>
                          <span className="text-gray-400 text-sm ml-2">({threat.percentage}%)</span>
                        </div>
                      </div>
                      <Progress value={threat.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">AI Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-900/30 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Peak Activity Detected</p>
                      <p className="text-gray-400 text-sm">Unusual spike in phishing attempts during weekend hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-900/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">New Pattern Identified</p>
                      <p className="text-gray-400 text-sm">AI detected emerging malware signature</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Activity Heatmap */}
        <TabsContent value="heatmap" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-500" />
                24/7 Threat Activity Heatmap
              </CardTitle>
              <CardDescription className="text-gray-400">
                Hourly threat activity patterns over the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Heatmap grid */}
                <div className="grid grid-cols-25 gap-1 text-xs">
                  {/* Hour labels */}
                  <div></div>
                  {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} className="text-center text-gray-400 font-mono text-xs">
                      {i.toString().padStart(2, '0')}
                    </div>
                  ))}
                  
                  {/* Day rows */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
                    <React.Fragment key={day}>
                      <div className="text-gray-400 text-xs font-medium py-1">{day}</div>
                      {Array.from({ length: 24 }, (_, hour) => {
                        const dataPoint = heatmapData.find(d => d.day === day && d.hour === hour);
                        const intensity = dataPoint ? dataPoint.value / 100 : 0;
                        return (
                          <div
                            key={`${day}-${hour}`}
                            className={`w-3 h-3 rounded-sm ${getHeatmapColor(dataPoint?.value || 0)}`}
                            style={{ opacity: intensity }}
                            title={`${day} ${hour}:00 - ${dataPoint?.value || 0} threats`}
                          />
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
                
                {/* Heatmap legend */}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-gray-400 text-sm">Low Activity</span>
                  <div className="flex gap-1">
                    {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity, index) => (
                      <div
                        key={index}
                        className="w-3 h-3 rounded-sm bg-red-500"
                        style={{ opacity }}
                      />
                    ))}
                  </div>
                  <span className="text-gray-400 text-sm">High Activity</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incident Severity */}
        <TabsContent value="severity" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Incident Severity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {severityData.map((item) => (
                  <div key={item.severity} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getSeverityBadgeColor(item.severity)}>
                          {item.severity}
                        </Badge>
                        <span className="text-white font-medium">{item.count} incidents</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(item.trend)}
                        <span className="text-gray-400">{item.percentage}%</span>
                      </div>
                    </div>
                    
                    <Progress value={item.percentage} className="h-2" />
                    
                    <div className="text-sm text-gray-400">
                      Avg. Resolution Time: {item.avgResolutionTime} minutes
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Resolution Time Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Average Resolution</p>
                    <p className="text-2xl font-bold text-white">45.2m</p>
                    <div className="flex items-center text-green-400 text-sm">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      -12% from last week
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">SLA Compliance</p>
                    <p className="text-2xl font-bold text-white">94.7%</p>
                    <div className="flex items-center text-green-400 text-sm">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +3% from last week
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <h4 className="text-white font-medium">Time to Detection</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mean Time</span>
                      <span className="text-white">2.3 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">95th Percentile</span>
                      <span className="text-white">8.7 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">False Positive Rate</span>
                      <span className="text-white">1.2%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geographic Analysis */}
        <TabsContent value="geographic" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-red-500" />
                  Global Threat Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {geoData.map((country) => (
                    <div key={country.country} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">{country.country}</span>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {country.primaryType}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-medium">{country.threatCount.toLocaleString()}</span>
                          <span className="text-gray-400 text-sm ml-2">({country.percentage}%)</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Progress value={country.percentage} className="h-2" />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">Risk:</span>
                          <Badge className={
                            country.riskLevel > 80 ? 'bg-red-600' :
                            country.riskLevel > 60 ? 'bg-orange-600' :
                            country.riskLevel > 40 ? 'bg-yellow-600' : 'bg-green-600'
                          }>
                            {country.riskLevel}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Regional Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Highest Risk Region</p>
                    <p className="text-white font-semibold">Asia Pacific</p>
                    <p className="text-red-400 text-sm">1,847 threats (61.3%)</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Most Active Attack Type</p>
                    <p className="text-white font-semibold">Phishing Campaigns</p>
                    <p className="text-orange-400 text-sm">Targeting financial sector</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm">Emerging Threat Region</p>
                    <p className="text-white font-semibold">Eastern Europe</p>
                    <p className="text-yellow-400 text-sm">+45% increase this week</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-900/30 rounded-lg">
                    <p className="text-blue-400 font-medium">Geographic Filtering</p>
                    <p className="text-gray-300 text-sm">Consider implementing stricter filtering for high-risk regions</p>
                  </div>
                  
                  <div className="p-3 bg-yellow-900/30 rounded-lg">
                    <p className="text-yellow-400 font-medium">Pattern Detection</p>
                    <p className="text-gray-300 text-sm">Monitor for coordinated attacks across multiple regions</p>
                  </div>
                  
                  <div className="p-3 bg-green-900/30 rounded-lg">
                    <p className="text-green-400 font-medium">Response Strategy</p>
                    <p className="text-gray-300 text-sm">Deploy additional monitoring during peak hours</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
