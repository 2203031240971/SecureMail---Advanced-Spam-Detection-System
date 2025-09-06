import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  History, 
  Search, 
  Filter, 
  Calendar,
  Mail,
  MessageSquare,
  Shield,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface ScanRecord {
  id: string;
  timestamp: string;
  type: 'email' | 'sms';
  content: string;
  sender?: string;
  subject?: string;
  phoneNumber?: string;
  result: 'spam' | 'clean' | 'suspicious';
  confidence: number;
  riskScore: number;
  flags: string[];
  category?: string;
}

// Mock scan history data
const mockScanHistory: ScanRecord[] = [
  {
    id: '1',
    timestamp: '2024-01-15T14:32:00Z',
    type: 'sms',
    content: 'Your package has been shipped and will arrive today between 2-4 PM.',
    phoneNumber: '+1-206-266-1000',
    result: 'clean',
    confidence: 95.2,
    riskScore: 8.1,
    flags: [],
    category: 'delivery'
  },
  {
    id: '2',
    timestamp: '2024-01-15T13:45:00Z',
    type: 'email',
    content: 'Congratulations! You\'ve won a $1000 gift card. Click here immediately to claim your prize!',
    sender: 'winner@prizes.fake',
    subject: 'URGENT: Claim your $1000 prize NOW!',
    result: 'spam',
    confidence: 98.7,
    riskScore: 92.3,
    flags: ['Urgency language', 'Monetary offers', 'Suspicious domain', 'External links'],
    category: 'scam'
  },
  {
    id: '3',
    timestamp: '2024-01-15T11:15:00Z',
    type: 'email',
    content: 'Hi John, Just a reminder about our team meeting tomorrow at 2 PM in Conference Room A.',
    sender: 'sarah.johnson@company.com',
    subject: 'Meeting reminder for tomorrow',
    result: 'clean',
    confidence: 97.1,
    riskScore: 5.2,
    flags: [],
    category: 'business'
  },
  {
    id: '4',
    timestamp: '2024-01-15T09:32:00Z',
    type: 'sms',
    content: 'Your account needs verification. Click link: http://suspicious-bank.fake/verify',
    phoneNumber: '+1-555-SCAM',
    result: 'spam',
    confidence: 99.1,
    riskScore: 95.8,
    flags: ['Phishing attempt', 'Suspicious links', 'Account verification scam'],
    category: 'phishing'
  },
  {
    id: '5',
    timestamp: '2024-01-14T17:30:00Z',
    type: 'email',
    content: 'Your monthly statement is ready for download in your account portal.',
    sender: 'statements@mybank.com',
    subject: 'Monthly statement available',
    result: 'clean',
    confidence: 94.8,
    riskScore: 12.1,
    flags: [],
    category: 'financial'
  },
  {
    id: '6',
    timestamp: '2024-01-14T16:22:00Z',
    type: 'sms',
    content: 'Limited time offer! Get 50% off everything. Use code SAVE50. Shop now!',
    phoneNumber: '+1-555-PROMO',
    result: 'suspicious',
    confidence: 76.4,
    riskScore: 45.3,
    flags: ['Promotional content', 'Urgency language'],
    category: 'promotional'
  },
  {
    id: '7',
    timestamp: '2024-01-14T14:18:00Z',
    type: 'email',
    content: 'Your prescription is ready for pickup at CVS Pharmacy #1234.',
    sender: 'notifications@cvs.com',
    subject: 'Prescription ready for pickup',
    result: 'clean',
    confidence: 96.3,
    riskScore: 7.8,
    flags: [],
    category: 'healthcare'
  },
  {
    id: '8',
    timestamp: '2024-01-14T12:05:00Z',
    type: 'sms',
    content: 'URGENT: IRS tax refund of $2,847 pending. Claim now: http://fake-irs.scam',
    phoneNumber: '+1-555-FAKE',
    result: 'spam',
    confidence: 99.5,
    riskScore: 97.2,
    flags: ['Government impersonation', 'Tax scam', 'Suspicious links', 'Urgency language'],
    category: 'scam'
  }
];

export default function ScanHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<ScanRecord | null>(null);
  const [sortBy, setSortBy] = useState<'timestamp' | 'confidence' | 'risk'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedRecords = useMemo(() => {
    let filtered = mockScanHistory.filter(record => {
      const matchesSearch = 
        record.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.sender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || record.type === typeFilter;
      const matchesResult = resultFilter === 'all' || record.result === resultFilter;
      
      return matchesSearch && matchesType && matchesResult;
    });

    return filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
          break;
        case 'risk':
          aValue = a.riskScore;
          bValue = b.riskScore;
          break;
        default:
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }, [searchTerm, typeFilter, resultFilter, sortBy, sortOrder]);

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'spam':
        return <Badge variant="destructive">SPAM</Badge>;
      case 'suspicious':
        return <Badge variant="secondary" className="bg-warning/20 text-warning border-warning">SUSPICIOUS</Badge>;
      case 'clean':
        return <Badge variant="secondary" className="bg-success/20 text-success border-success">CLEAN</Badge>;
      default:
        return <Badge variant="secondary">{result.toUpperCase()}</Badge>;
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'spam':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'suspicious':
        return <Shield className="h-4 w-4 text-warning" />;
      case 'clean':
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const exportHistory = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Result', 'Confidence', 'Risk Score', 'Content', 'Sender/Phone', 'Subject'].join(','),
      ...filteredAndSortedRecords.map(record => [
        record.timestamp,
        record.type,
        record.result,
        record.confidence,
        record.riskScore,
        `"${record.content.replace(/"/g, '""')}"`,
        record.sender || record.phoneNumber || '',
        record.subject || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scan-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Scan History</h1>
        <p className="text-muted-foreground">View and manage your spam detection scan history</p>
      </div>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search content, sender, subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Result</Label>
              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Results</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="suspicious">Suspicious</SelectItem>
                  <SelectItem value="clean">Clean</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Sort By</Label>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field as any);
                setSortOrder(order as any);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="timestamp-desc">Newest First</SelectItem>
                  <SelectItem value="timestamp-asc">Oldest First</SelectItem>
                  <SelectItem value="confidence-desc">Highest Confidence</SelectItem>
                  <SelectItem value="confidence-asc">Lowest Confidence</SelectItem>
                  <SelectItem value="risk-desc">Highest Risk</SelectItem>
                  <SelectItem value="risk-asc">Lowest Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedRecords.length} of {mockScanHistory.length} records
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportHistory}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Scan Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3">Date/Time</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3">Type</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3">Content Preview</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3">Sender/Phone</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3">Result</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3">Confidence</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedRecords.map((record) => {
                  const { date, time } = formatTimestamp(record.timestamp);
                  return (
                    <tr key={record.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 text-sm text-foreground">
                        <div className="flex flex-col">
                          <span>{date}</span>
                          <span className="text-xs text-muted-foreground">{time}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {record.type === 'email' ? (
                            <Mail className="h-4 w-4" />
                          ) : (
                            <MessageSquare className="h-4 w-4" />
                          )}
                          <span className="text-sm capitalize">{record.type}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-foreground max-w-xs">
                        <div className="truncate">
                          {record.subject && (
                            <div className="font-medium truncate">{record.subject}</div>
                          )}
                          <div className="text-muted-foreground truncate">
                            {record.content.substring(0, 100)}...
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-foreground">
                        {record.sender || record.phoneNumber}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {getResultIcon(record.result)}
                          {getResultBadge(record.result)}
                        </div>
                      </td>
                      <td className="py-3 text-sm text-foreground">
                        <div className="flex flex-col">
                          <span>{record.confidence.toFixed(1)}%</span>
                          <span className="text-xs text-muted-foreground">
                            Risk: {record.riskScore.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedRecord(record)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Scan Details</DialogTitle>
                              </DialogHeader>
                              {selectedRecord && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Type</Label>
                                      <div className="flex items-center gap-2 mt-1">
                                        {selectedRecord.type === 'email' ? (
                                          <Mail className="h-4 w-4" />
                                        ) : (
                                          <MessageSquare className="h-4 w-4" />
                                        )}
                                        <span className="capitalize">{selectedRecord.type}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Timestamp</Label>
                                      <div className="mt-1">
                                        {new Date(selectedRecord.timestamp).toLocaleString()}
                                      </div>
                                    </div>
                                  </div>

                                  {selectedRecord.subject && (
                                    <div>
                                      <Label>Subject</Label>
                                      <div className="mt-1 p-2 bg-muted rounded">
                                        {selectedRecord.subject}
                                      </div>
                                    </div>
                                  )}

                                  <div>
                                    <Label>Content</Label>
                                    <div className="mt-1 p-3 bg-muted rounded max-h-40 overflow-y-auto">
                                      {selectedRecord.content}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Result</Label>
                                      <div className="mt-1">
                                        {getResultBadge(selectedRecord.result)}
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Confidence</Label>
                                      <div className="mt-1">
                                        {selectedRecord.confidence.toFixed(1)}%
                                      </div>
                                    </div>
                                  </div>

                                  {selectedRecord.flags.length > 0 && (
                                    <div>
                                      <Label>Risk Flags</Label>
                                      <div className="mt-1 space-y-1">
                                        {selectedRecord.flags.map((flag, index) => (
                                          <Badge key={index} variant="destructive" className="mr-2">
                                            {flag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAndSortedRecords.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scan records found matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
