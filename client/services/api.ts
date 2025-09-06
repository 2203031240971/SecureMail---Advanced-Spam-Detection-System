// API service for communicating with the backend database

const API_BASE = '/api';

// Mock data for fallback when database is not connected
const mockScanHistory: ScanRecord[] = [
  {
    id: '1',
    content: 'Your package has been shipped and will arrive today between 2-4 PM.',
    message_type: 'sms',
    phone_number: '+1-206-266-1000',
    result: 'clean',
    confidence_score: 95.2,
    risk_score: 8.1,
    category: 'delivery',
    flags: [],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: '2',
    content: 'Congratulations! You\'ve won a $1000 gift card. Click here immediately to claim your prize!',
    message_type: 'email',
    sender: 'winner@prizes.fake',
    subject: 'URGENT: Claim your $1000 prize NOW!',
    result: 'spam',
    confidence_score: 98.7,
    risk_score: 92.3,
    category: 'scam',
    flags: ['Urgency language', 'Monetary offers', 'Suspicious domain'],
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
  },
  {
    id: '3',
    content: 'Hi John, Just a reminder about our team meeting tomorrow at 2 PM in Conference Room A.',
    message_type: 'email',
    sender: 'sarah.johnson@company.com',
    subject: 'Meeting reminder for tomorrow',
    result: 'clean',
    confidence_score: 97.1,
    risk_score: 5.2,
    category: 'business',
    flags: [],
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
  }
];

const mockAnalytics: AnalyticsData = {
  summary: {
    total_scans: 247,
    spam_detected: 89,
    clean_messages: 158,
    suspicious_messages: 12,
    email_scans: 168,
    sms_scans: 79,
    avg_confidence: 92.4,
    avg_risk_score: 23.7
  },
  threat_categories: [
    { category: 'scam', count: 45, avg_confidence: 95.2 },
    { category: 'phishing', count: 32, avg_confidence: 94.1 },
    { category: 'promotional', count: 12, avg_confidence: 78.3 }
  ],
  daily_activity: [
    { date: '2024-01-15', total: 45, spam: 18, clean: 27, suspicious: 2 },
    { date: '2024-01-14', total: 52, spam: 21, clean: 31, suspicious: 3 },
    { date: '2024-01-13', total: 38, spam: 14, clean: 24, suspicious: 1 }
  ]
};

// Helper function for API requests with fallback to mock data
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': 'demo-user-id', // In real app, get from auth context
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    // If Vercel protection page or any HTML is returned, fallback to mock
    if (!isJson) {
      console.warn(`Non-JSON response detected for ${endpoint}; falling back to mock data`);
      if (endpoint === '/scans' || endpoint.startsWith('/scans?')) {
        return {
          success: true,
          data: {
            data: mockScanHistory.slice(0, 5),
            pagination: { total: mockScanHistory.length, page: 1, limit: 5, pages: 1 }
          }
        } as T;
      }
      if (endpoint.startsWith('/analytics')) {
        return { success: true, data: mockAnalytics } as T;
      }
      if (endpoint === '/health') {
        return { status: 'ok', database: 'mock', timestamp: new Date().toISOString() } as T;
      }
      throw new Error('Non-JSON response');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);

    // Don't throw error immediately - the server should handle fallbacks
    // Only fall back here if the server is completely unreachable
    const isNetworkError = error instanceof TypeError && error.message.includes('fetch');

    if (isNetworkError || (error as any)?.message === 'Non-JSON response') {
      // Fallback to mock data for certain endpoints when server is unreachable
      if (endpoint === '/scans' || endpoint.startsWith('/scans?')) {
        console.log('Server unreachable, falling back to mock scan history');
        return {
          success: true,
          data: {
            data: mockScanHistory.slice(0, 5),
            pagination: { total: mockScanHistory.length, page: 1, limit: 5, pages: 1 }
          }
        } as T;
      }

      if (endpoint.startsWith('/analytics')) {
        console.log('Server unreachable, falling back to mock analytics');
        return { success: true, data: mockAnalytics } as T;
      }
    }

    throw error;
  }
}

// Types
export interface ScanRecord {
  id: string;
  content: string;
  message_type: 'email' | 'sms';
  sender?: string;
  subject?: string;
  phone_number?: string;
  result: 'spam' | 'clean' | 'suspicious';
  confidence_score: number;
  risk_score: number;
  category?: string;
  flags?: string[];
  analysis_details?: any;
  created_at: string;
}

export interface AnalysisResult {
  scan_id: string;
  result: 'spam' | 'clean' | 'suspicious';
  confidence_score: number;
  risk_score: number;
  category?: string;
  flags?: string[];
  analysis_details?: any;
}

export interface ScanFilters {
  message_type?: 'email' | 'sms';
  result?: 'spam' | 'clean' | 'suspicious';
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AnalyticsData {
  summary: {
    total_scans: number;
    spam_detected: number;
    clean_messages: number;
    suspicious_messages: number;
    email_scans: number;
    sms_scans: number;
    avg_confidence: number;
    avg_risk_score: number;
  };
  threat_categories: Array<{
    category: string;
    count: number;
    avg_confidence: number;
  }>;
  daily_activity: Array<{
    date: string;
    total: number;
    spam: number;
    clean: number;
    suspicious: number;
  }>;
}

// API methods
export const scanAPI = {
  // Analyze a message and save to database
  async analyzeMessage(data: {
    content: string;
    message_type: 'email' | 'sms';
    sender?: string;
    subject?: string;
    phone_number?: string;
  }): Promise<AnalysisResult> {
    try {
      const response = await apiRequest<{ success: boolean; data: AnalysisResult }>('/analyze', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.data;
    } catch (error) {
      // Fallback to client-side analysis when API is unavailable
      console.log('API unavailable, using client-side analysis');

      const isSpam = data.content.toLowerCase().includes('urgent') ||
                     data.content.toLowerCase().includes('win') ||
                     data.content.toLowerCase().includes('prize') ||
                     data.content.toLowerCase().includes('click') ||
                     data.content.toLowerCase().includes('congratulations');

      const confidence = Math.random() * 30 + (isSpam ? 70 : 20);
      const riskScore = isSpam ? Math.random() * 40 + 60 : Math.random() * 30 + 10;

      return {
        scan_id: `mock-${Date.now()}`,
        result: isSpam ? 'spam' : 'clean',
        confidence_score: parseFloat(confidence.toFixed(1)),
        risk_score: parseFloat(riskScore.toFixed(1)),
        category: isSpam ? 'scam' : 'legitimate',
        flags: isSpam ? ['Urgency language', 'Suspicious patterns'] : [],
        analysis_details: {
          note: 'Client-side analysis (database not connected)'
        }
      };
    }
  },

  // Get scan history with filters
  async getScanHistory(filters: ScanFilters = {}): Promise<PaginatedResponse<ScanRecord>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await apiRequest<{ success: boolean; data: any }>(
      `/scans?${params.toString()}`
    );

    // Normalize server/mock shapes:
    // - Shape A (DB): { data: { data: ScanRecord[], pagination: {...} } }
    // - Shape B (Mock): { data: { records: ScanRecordLike[], pagination: {...} } }
    const payload = response.data || {};
    const records: any[] = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.records)
        ? payload.records
        : [];

    // Map fields to expected client shape
    const normalized: ScanRecord[] = records.map((r: any) => ({
      id: r.id,
      content: r.content || r.subject || '',
      message_type: (r.message_type || 'email') as 'email' | 'sms',
      sender: r.sender,
      subject: r.subject,
      phone_number: r.phone_number,
      result: r.result || 'clean',
      confidence_score: r.confidence_score ?? 90,
      risk_score: r.risk_score ?? 10,
      category: r.category,
      flags: r.flags,
      analysis_details: r.analysis_details,
      // Server mock uses `timestamp`; DB uses `created_at`
      created_at: r.created_at || r.timestamp || new Date().toISOString(),
    }));

    const pagination = payload.pagination || { total: normalized.length, page: 1, limit: normalized.length, pages: 1 };

    return { data: normalized, pagination };
  },

  // Get single scan by ID
  async getScanById(id: string): Promise<ScanRecord> {
    const response = await apiRequest<{ success: boolean; data: ScanRecord }>(`/scans/${id}`);
    return response.data;
  },

  // Delete scan
  async deleteScan(id: string): Promise<void> {
    await apiRequest(`/scans/${id}`, { method: 'DELETE' });
  },

  // Get analytics data
  async getAnalytics(days: number = 7): Promise<AnalyticsData> {
    const response = await apiRequest<{ success: boolean; data: AnalyticsData }>(
      `/analytics?days=${days}`
    );
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<{ status: string; database: string; timestamp: string }> {
    return await apiRequest('/health');
  },
};

// Export convenience methods
export const {
  analyzeMessage,
  getScanHistory,
  getScanById,
  deleteScan,
  getAnalytics,
  healthCheck,
} = scanAPI;

export default scanAPI;
