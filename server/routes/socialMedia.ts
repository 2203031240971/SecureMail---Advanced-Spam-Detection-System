import { Request, Response } from 'express';
import { testConnection } from '../db/connection';

const isMockMode = process.env.USE_MOCK_DATA === 'true' || !process.env.DATABASE_URL;

// Mock data for social media analytics
const mockSocialMediaAnalytics = {
  total_analyzed: 342,
  platform_distribution: [
    { platform: 'instagram', count: 120, spam: 30 },
    { platform: 'facebook', count: 95, spam: 25 },
    { platform: 'whatsapp', count: 60, spam: 10 },
    { platform: 'twitter', count: 40, spam: 8 },
    { platform: 'linkedin', count: 20, spam: 2 },
    { platform: 'youtube', count: 7, spam: 1 },
  ],
  recent_activity: Array.from({ length: 7 }).map((_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
    total: Math.floor(30 + Math.random() * 40),
    spam: Math.floor(10 + Math.random() * 15),
    clean: Math.floor(15 + Math.random() * 20),
    suspicious: Math.floor(2 + Math.random() * 8),
  })),
};

// Enhanced content analysis function (server-side logic, shared)
function analyzeContentQuality(content: string, platform: string) {
  const lc = content.toLowerCase();
  let riskScore = 10;
  const flags: string[] = [];

  const urgency = ['urgent', 'immediately', 'now', 'hurry'];
  const monetary = ['win', 'prize', 'gift card', 'cash', 'money', 'free'];
  const actions = ['click', 'verify', 'confirm', 'update', 'claim', 'download'];

  urgency.forEach((p) => lc.includes(p) && (riskScore += 15, flags.push('Urgency language')));
  monetary.forEach((p) => lc.includes(p) && (riskScore += 18, flags.push('Monetary offers')));
  actions.forEach((p) => lc.includes(p) && (riskScore += 12, flags.push('Suspicious actions')));

  const isSpam = riskScore >= 50;

  return {
    isSpam,
    riskScore: Math.min(100, riskScore),
    confidence: isSpam ? 92 : 85,
    flags,
  };
}

export async function analyzeSocialMediaContent(req: Request, res: Response) {
  try {
    const { content, platforms } = req.body;
    if (!content || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ success: false, error: 'content and platforms[] are required' });
    }

    const results = platforms.map((platformId: string) => {
      const a = analyzeContentQuality(content, platformId);
      return {
        platform: platformId.charAt(0).toUpperCase() + platformId.slice(1),
        content,
        result: a.isSpam ? 'spam' : a.riskScore > 40 ? 'suspicious' : 'clean',
        confidence: a.confidence,
        riskScore: a.riskScore,
        reason: a.flags.join(', ') || 'No significant risk factors detected',
        flags: a.flags,
        timestamp: new Date().toISOString(),
      };
    });

    // In mock mode or when DB is not connected, return directly
    if (isMockMode || !(await testConnection())) {
      return res.json({ success: true, data: results });
    }

    // TODO: Save to DB when not in mock mode
    return res.json({ success: true, data: results });
  } catch (error) {
    console.error('analyzeSocialMediaContent error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function getSocialMediaAnalytics(req: Request, res: Response) {
  try {
    if (isMockMode || !(await testConnection())) {
      return res.json({ success: true, data: mockSocialMediaAnalytics });
    }
    // TODO: Aggregate analytics from DB
    return res.json({ success: true, data: mockSocialMediaAnalytics });
  } catch (error) {
    console.error('getSocialMediaAnalytics error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function getSocialMediaHistory(req: Request, res: Response) {
  try {
    // Mock-only for now
    if (isMockMode || !(await testConnection())) {
      return res.json({
        success: true,
        data: {
          records: mockSocialMediaAnalytics.platform_distribution.map((p, i) => ({
            id: `mock-${i}`,
            platform: p.platform,
            content: 'Sample content',
            result: i % 2 === 0 ? 'spam' : 'clean',
            confidence: 90,
            riskScore: i % 2 === 0 ? 70 : 20,
            flags: i % 2 === 0 ? ['Urgency language'] : [],
            timestamp: new Date().toISOString(),
          })),
          pagination: { hasNext: false, hasPrevious: false, nextCursor: null, previousCursor: null, total: 6 },
        },
      });
    }
    // TODO: read from DB
    return res.json({ success: true, data: { records: [], pagination: { hasNext: false, hasPrevious: false } } });
  } catch (error) {
    console.error('getSocialMediaHistory error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function getSocialMediaAnalysisById(req: Request, res: Response) {
  try {
    if (isMockMode || !(await testConnection())) {
      return res.json({ success: true, data: { id: req.params.id, platform: 'instagram', content: 'Sample content', result: 'spam', confidence: 92, riskScore: 75, flags: ['Urgency language'], timestamp: new Date().toISOString() } });
    }
    // TODO: fetch from DB
    return res.status(404).json({ success: false, error: 'Not found' });
  } catch (error) {
    console.error('getSocialMediaAnalysisById error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function deleteSocialMediaAnalysis(req: Request, res: Response) {
  try {
    if (isMockMode || !(await testConnection())) {
      return res.json({ success: true, message: 'Deleted (mock)' });
    }
    // TODO: delete from DB
    return res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    console.error('deleteSocialMediaAnalysis error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function exportSocialMediaReport(req: Request, res: Response) {
  try {
    // Mock CSV
    const csv = 'platform,result,confidence,riskScore\ninstagram,spam,92,75\nfacebook,clean,88,22\n';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="social_report.csv"');
    res.send(csv);
  } catch (error) {
    console.error('exportSocialMediaReport error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export async function socialMediaHealthCheck(req: Request, res: Response) {
  try {
    if (isMockMode) {
      return res.json({ status: 'ok', database: 'mock', timestamp: new Date().toISOString() });
    }
    const dbConnected = await testConnection();
    res.json({ status: 'ok', database: dbConnected ? 'connected' : 'disconnected', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('socialMediaHealthCheck error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
