import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Globe, 
  MapPin, 
  AlertTriangle, 
  Shield, 
  Activity,
  Filter,
  Zap,
  TrendingUp,
  Eye,
  BarChart3,
  Clock,
  Users,
  Target,
  RefreshCw
} from 'lucide-react';

interface ThreatLocation {
  id: string;
  lat: number;
  lng: number;
  country: string;
  city: string;
  threatCount: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  primaryType: string;
  lastSeen: string;
  blocked: number;
  active: boolean;
}

interface ThreatStats {
  totalThreats: number;
  blockedThreats: number;
  activeThreats: number;
  topCountries: Array<{ country: string; count: number; }>;
  threatTypes: Array<{ type: string; count: number; percentage: number; }>;
}

const ThreatMapping: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('global');
  const [threatFilter, setThreatFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [selectedThreat, setSelectedThreat] = useState<ThreatLocation | null>(null);
  const [isRealTime, setIsRealTime] = useState(true);

  // Mock threat locations data
  const [threats] = useState<ThreatLocation[]>([
    {
      id: '1',
      lat: 39.9042,
      lng: 116.4074,
      country: 'China',
      city: 'Beijing',
      threatCount: 847,
      threatLevel: 'critical',
      primaryType: 'Phishing',
      lastSeen: '2 minutes ago',
      blocked: 723,
      active: true
    },
    {
      id: '2',
      lat: 55.7558,
      lng: 37.6176,
      country: 'Russia',
      city: 'Moscow',
      threatCount: 634,
      threatLevel: 'high',
      primaryType: 'Malware',
      lastSeen: '5 minutes ago',
      blocked: 521,
      active: true
    },
    {
      id: '3',
      lat: 40.7128,
      lng: -74.0060,
      country: 'USA',
      city: 'New York',
      threatCount: 423,
      threatLevel: 'medium',
      primaryType: 'Spam',
      lastSeen: '1 minute ago',
      blocked: 398,
      active: true
    },
    {
      id: '4',
      lat: 51.5074,
      lng: -0.1278,
      country: 'UK',
      city: 'London',
      threatCount: 312,
      threatLevel: 'medium',
      primaryType: 'Phishing',
      lastSeen: '8 minutes ago',
      blocked: 287,
      active: true
    },
    {
      id: '5',
      lat: 35.6762,
      lng: 139.6503,
      country: 'Japan',
      city: 'Tokyo',
      threatCount: 198,
      threatLevel: 'low',
      primaryType: 'Suspicious Activity',
      lastSeen: '15 minutes ago',
      blocked: 156,
      active: false
    }
  ]);

  const [stats] = useState<ThreatStats>({
    totalThreats: 2414,
    blockedThreats: 2085,
    activeThreats: 329,
    topCountries: [
      { country: 'China', count: 847 },
      { country: 'Russia', count: 634 },
      { country: 'USA', count: 423 },
      { country: 'UK', count: 312 },
      { country: 'Japan', count: 198 }
    ],
    threatTypes: [
      { type: 'Phishing', count: 1159, percentage: 48 },
      { type: 'Malware', count: 634, percentage: 26 },
      { type: 'Spam', count: 423, percentage: 18 },
      { type: 'Suspicious Activity', count: 198, percentage: 8 }
    ]
  });

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getThreatBadgeColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600 animate-pulse';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getThreatSize = (count: number) => {
    if (count > 500) return 'w-6 h-6';
    if (count > 200) return 'w-5 h-5';
    if (count > 100) return 'w-4 h-4';
    return 'w-3 h-3';
  };

  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Globe className="w-8 h-8 text-red-500" />
            Location-Based Threat Mapping
          </h1>
          <p className="text-gray-400 mt-2">Global visualization of threat origins and attack patterns</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsRealTime(!isRealTime)}
            variant={isRealTime ? "default" : "outline"}
            className={isRealTime ? "bg-red-600 hover:bg-red-700" : "border-gray-600 text-white hover:bg-gray-700"}
          >
            <Activity className="w-4 h-4 mr-2" />
            {isRealTime ? 'Live Mode' : 'Paused'}
          </Button>
          <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-400">Total Threats</p>
                <p className="text-2xl font-bold text-white">{stats.totalThreats.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Blocked</p>
                <p className="text-2xl font-bold text-white">{stats.blockedThreats.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-400">Active Threats</p>
                <p className="text-2xl font-bold text-white">{stats.activeThreats}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">Block Rate</p>
                <p className="text-2xl font-bold text-white">
                  {((stats.blockedThreats / stats.totalThreats) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Filters:</span>
            </div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="americas">Americas</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="asia">Asia Pacific</SelectItem>
                <SelectItem value="africa">Africa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={threatFilter} onValueChange={setThreatFilter}>
              <SelectTrigger className="w-36 bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all">All Threats</SelectItem>
                <SelectItem value="phishing">Phishing</SelectItem>
                <SelectItem value="malware">Malware</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="suspicious">Suspicious</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-24 bg-gray-700 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="24h">24 Hours</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Global Map */}
        <Card className="lg:col-span-2 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              Global Threat Map
            </CardTitle>
            <CardDescription className="text-gray-400">
              Real-time visualization of threat origins and intensity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              {/* Simplified world map visualization */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900">
                <svg className="w-full h-full" viewBox="0 0 800 400">
                  {/* Simple world map outline */}
                  <rect width="800" height="400" fill="#1f2937" />
                  
                  {/* Threat location pins */}
                  {threats.map((threat) => {
                    const x = ((threat.lng + 180) / 360) * 800;
                    const y = ((90 - threat.lat) / 180) * 400;
                    
                    return (
                      <g key={threat.id}>
                        {/* Pulsing circle for active threats */}
                        {threat.active && (
                          <circle
                            cx={x}
                            cy={y}
                            r="20"
                            fill={threat.threatLevel === 'critical' ? '#ef4444' : 
                                   threat.threatLevel === 'high' ? '#f97316' :
                                   threat.threatLevel === 'medium' ? '#eab308' : '#22c55e'}
                            opacity="0.3"
                            className="animate-ping"
                          />
                        )}
                        
                        {/* Main threat pin */}
                        <circle
                          cx={x}
                          cy={y}
                          r={threat.threatCount > 500 ? '8' : threat.threatCount > 200 ? '6' : '4'}
                          fill={threat.threatLevel === 'critical' ? '#ef4444' : 
                                 threat.threatLevel === 'high' ? '#f97316' :
                                 threat.threatLevel === 'medium' ? '#eab308' : '#22c55e'}
                          className="cursor-pointer hover:opacity-80"
                          onClick={() => setSelectedThreat(threat)}
                        />
                        
                        {/* Threat count label */}
                        <text
                          x={x}
                          y={y - 15}
                          textAnchor="middle"
                          className="fill-white text-xs font-bold"
                        >
                          {threat.threatCount}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                
                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-gray-800/90 rounded-lg p-3 space-y-2">
                  <h4 className="text-white font-medium text-sm">Threat Levels</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-300">Critical</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-300">High</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-gray-300">Medium</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-300">Low</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Threat Details / Analytics */}
        <div className="space-y-6">
          {/* Selected Threat Details */}
          {selectedThreat && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-red-500" />
                  Threat Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium">{selectedThreat.city}, {selectedThreat.country}</h3>
                  <Badge className={getThreatBadgeColor(selectedThreat.threatLevel)}>
                    {selectedThreat.threatLevel.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Threats:</span>
                    <span className="text-white font-medium">{selectedThreat.threatCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Blocked:</span>
                    <span className="text-green-400 font-medium">{selectedThreat.blocked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Primary Type:</span>
                    <span className="text-white font-medium">{selectedThreat.primaryType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Seen:</span>
                    <span className="text-gray-300">{selectedThreat.lastSeen}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${selectedThreat.active ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                      <span className="text-white">{selectedThreat.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Countries */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-500" />
                Top Threat Origins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.topCountries.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">#{index + 1}</span>
                    <span className="text-white">{country.country}</span>
                  </div>
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    {country.count}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Threat Types */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-500" />
                Threat Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.threatTypes.map((type) => (
                <div key={type.type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white">{type.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">{type.percentage}%</span>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {type.count}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${type.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-500" />
            Recent Threat Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {threats.slice(0, 3).map((threat) => (
              <div key={threat.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${threat.active ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <div>
                    <p className="text-white font-medium">{threat.city}, {threat.country}</p>
                    <p className="text-gray-400 text-sm">{threat.primaryType} • {threat.lastSeen}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getThreatBadgeColor(threat.threatLevel)}>
                    {threat.threatLevel}
                  </Badge>
                  <span className="text-white font-medium">{threat.threatCount}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThreatMapping;
