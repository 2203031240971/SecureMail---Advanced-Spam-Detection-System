// Social Media API service for analyzing content across multiple platforms

const API_BASE = "/api/social-media";

// Mock data for fallback when database is not connected
const mockSocialMediaAnalytics = {
  total_analyzed: 1247,
  spam_detected: 89,
  clean_content: 1158,
  suspicious_content: 12,
  platform_breakdown: [
    { platform: "Instagram", total: 456, spam: 34, clean: 422, suspicious: 2 },
    { platform: "Facebook", total: 389, spam: 28, clean: 361, suspicious: 4 },
    { platform: "WhatsApp", total: 402, spam: 27, clean: 375, suspicious: 6 },
    { platform: "Twitter", total: 234, spam: 15, clean: 219, suspicious: 0 },
    { platform: "LinkedIn", total: 156, spam: 8, clean: 148, suspicious: 0 },
    { platform: "YouTube", total: 89, spam: 5, clean: 84, suspicious: 0 },
    {
      platform: "Other Platforms",
      total: 78,
      spam: 3,
      clean: 75,
      suspicious: 0,
    },
  ],
  threat_categories: [
    { category: "Phishing Scams", count: 45, avg_risk_score: 87.3 },
    { category: "Fake Promotions", count: 23, avg_risk_score: 76.8 },
    { category: "Malware Links", count: 21, avg_risk_score: 92.1 },
    { category: "Account Takeover", count: 18, avg_risk_score: 89.5 },
    { category: "Fake News", count: 15, avg_risk_score: 71.2 },
    { category: "Social Engineering", count: 12, avg_risk_score: 83.7 },
  ],
  recent_activity: [
    { date: "2024-01-15", total: 45, spam: 8, clean: 37, suspicious: 2 },
    { date: "2024-01-14", total: 52, spam: 12, clean: 40, suspicious: 3 },
    { date: "2024-01-13", total: 38, spam: 6, clean: 32, suspicious: 1 },
    { date: "2024-01-12", total: 41, spam: 7, clean: 34, suspicious: 2 },
    { date: "2024-01-11", total: 35, spam: 5, clean: 30, suspicious: 1 },
    { date: "2024-01-10", total: 48, spam: 9, clean: 39, suspicious: 2 },
    { date: "2024-01-09", total: 42, spam: 6, clean: 36, suspicious: 1 },
  ],
};

// Helper function for API requests with fallback to mock data
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": "demo-user-id", // In real app, get from auth context
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`Making API request to: ${url}`);
    const response = await fetch(url, config);
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    // If Vercel protection page or any HTML is returned, fallback to mock
    if (!isJson) {
      console.warn(
        `Non-JSON response detected for ${endpoint}; falling back to mock data`,
      );
      if (endpoint === "/analytics") {
        return { success: true, data: mockSocialMediaAnalytics } as T;
      }
      if (endpoint === "/health") {
        return {
          status: "ok",
          database: "mock",
          timestamp: new Date().toISOString(),
        } as T;
      }
      throw new Error("Non-JSON response");
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Request failed" }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Social Media API request failed: ${endpoint}`, error);

    // Enhanced fallback logic for better user experience
    console.log("Falling back to mock data due to API failure");
    
    // Don't throw error immediately - the server should handle fallbacks
    // Only fall back here if the server is completely unreachable
    const isNetworkError =
      error instanceof TypeError && error.message.includes("fetch");

    if (isNetworkError || (error as any)?.message === "Non-JSON response") {
      // Fallback to mock data when server is unreachable
      if (endpoint === "/analytics") {
        console.log(
          "Server unreachable, falling back to mock social media analytics",
        );
        return { success: true, data: mockSocialMediaAnalytics } as T;
      }
    }

    throw error;
  }
}

// Types
export interface SocialMediaAnalysisRequest {
  content: string;
  platforms: string[];
  user_id?: string;
  session_id?: string;
}

export interface SocialMediaAnalysisResult {
  platform: string;
  content: string;
  result: "spam" | "clean" | "suspicious";
  confidence_score: number;
  risk_score: number;
  category?: string;
  flags: string[];
  analysis_details: {
    language: string;
    sentiment: "positive" | "negative" | "neutral";
    urgency_level: "low" | "medium" | "high";
    suspicious_patterns: string[];
    user_behavior_score: number;
    content_quality_score: number;
    platform_specific_risks?: string[];
    content_moderation_score?: number;
    brand_safety_score?: number;
  };
  timestamp: string;
  scan_id?: string;
}

export interface SocialMediaAnalytics {
  total_analyzed: number;
  spam_detected: number;
  clean_content: number;
  suspicious_content: number;
  platform_breakdown: Array<{
    platform: string;
    total: number;
    spam: number;
    clean: number;
    suspicious: number;
  }>;
  threat_categories: Array<{
    category: string;
    count: number;
    avg_risk_score: number;
  }>;
  recent_activity: Array<{
    date: string;
    total: number;
    spam: number;
    clean: number;
    suspicious: number;
  }>;
  platform_risk_assessment?: Array<{
    platform: string;
    risk_level: "low" | "medium" | "high";
    spam_rate: number;
    avg_risk_score: number;
    top_threats: string[];
  }>;
  content_trends?: Array<{
    date: string;
    total_content: number;
    spam_trend: number;
    clean_trend: number;
    suspicious_trend: number;
  }>;
}

export interface SocialMediaFilters {
  platforms?: string[];
  result?: "spam" | "clean" | "suspicious";
  start_date?: string;
  end_date?: string;
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedSocialMediaResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Advanced spam detection patterns
const SPAM_PATTERNS = {
  urgency: [
    "urgent",
    "immediately",
    "now",
    "hurry",
    "limited time",
    "expires soon",
    "last chance",
    "don't miss out",
    "act fast",
    "time sensitive",
  ],
  monetary: [
    "win",
    "won",
    "prize",
    "gift card",
    "cash",
    "money",
    "free",
    "discount",
    "sale",
    "offer",
    "deal",
    "bonus",
    "reward",
    "million",
    "thousand",
  ],
  suspicious_actions: [
    "click here",
    "verify",
    "confirm",
    "update",
    "reactivate",
    "unlock",
    "claim",
    "download",
    "install",
    "subscribe",
    "join now",
  ],
  suspicious_domains: [
    "bit.ly",
    "tinyurl",
    "goo.gl",
    "is.gd",
    "v.gd",
    "t.co",
    "ow.ly",
  ],
  emotional_manipulation: [
    "amazing",
    "incredible",
    "shocking",
    "unbelievable",
    "exclusive",
    "secret",
    "hidden",
    "revealed",
    "exposed",
    "scandal",
  ],
};

// Content quality assessment
const CONTENT_QUALITY_INDICATORS = {
  positive: [
    "authentic",
    "genuine",
    "verified",
    "official",
    "professional",
    "helpful",
    "informative",
    "educational",
    "entertaining",
  ],
  negative: [
    "fake",
    "scam",
    "fraud",
    "phishing",
    "malware",
    "virus",
    "suspicious",
    "untrusted",
    "dangerous",
    "harmful",
  ],
};

// Platform-specific risk factors
const PLATFORM_RISKS = {
  instagram: [
    "fake followers",
    "engagement pods",
    "bot activity",
    "copyright infringement",
  ],
  facebook: [
    "fake news",
    "clickbait",
    "data harvesting",
    "political manipulation",
  ],
  whatsapp: [
    "forwarded messages",
    "chain messages",
    "fake news",
    "scam groups",
  ],
  twitter: [
    "bot accounts",
    "fake trends",
    "coordinated campaigns",
    "harassment",
  ],
  linkedin: ["fake profiles", "connection spam", "job scams", "business fraud"],
  youtube: [
    "clickbait titles",
    "fake thumbnails",
    "view botting",
    "copyright issues",
  ],
};

// Enhanced content analysis function
function analyzeContentQuality(
  content: string,
  platform: string,
): {
  isSpam: boolean;
  confidence: number;
  riskScore: number;
  category: string;
  flags: string[];
  analysisDetails: any;
} {
  const lowerContent = content.toLowerCase();
  let spamScore = 0;
  let riskScore = 0;
  const flags: string[] = [];
  const suspiciousPatterns: string[] = [];

  // Check urgency patterns
  SPAM_PATTERNS.urgency.forEach((pattern) => {
    if (lowerContent.includes(pattern)) {
      spamScore += 15;
      riskScore += 20;
      flags.push("Urgency language");
      suspiciousPatterns.push("Urgency");
    }
  });

  // Check monetary patterns
  SPAM_PATTERNS.monetary.forEach((pattern) => {
    if (lowerContent.includes(pattern)) {
      spamScore += 20;
      riskScore += 25;
      flags.push("Monetary offers");
      suspiciousPatterns.push("Monetary offers");
    }
  });

  // Check suspicious actions
  SPAM_PATTERNS.suspicious_actions.forEach((pattern) => {
    if (lowerContent.includes(pattern)) {
      spamScore += 18;
      riskScore += 22;
      flags.push("Suspicious actions");
      suspiciousPatterns.push("Suspicious actions");
    }
  });

  // Check suspicious domains
  SPAM_PATTERNS.suspicious_domains.forEach((pattern) => {
    if (lowerContent.includes(pattern)) {
      spamScore += 25;
      riskScore += 30;
      flags.push("Suspicious domains");
      suspiciousPatterns.push("Suspicious domains");
    }
  });

  // Check emotional manipulation
  SPAM_PATTERNS.emotional_manipulation.forEach((pattern) => {
    if (lowerContent.includes(pattern)) {
      spamScore += 12;
      riskScore += 15;
      flags.push("Emotional manipulation");
      suspiciousPatterns.push("Emotional manipulation");
    }
  });

  // Platform-specific risk assessment
  const platformRisk =
    PLATFORM_RISKS[platform as keyof typeof PLATFORM_RISKS] || [];
  platformRisk.forEach((risk) => {
    if (lowerContent.includes(risk.toLowerCase())) {
      spamScore += 10;
      riskScore += 15;
      flags.push(`Platform-specific: ${risk}`);
      suspiciousPatterns.push(`Platform: ${risk}`);
    }
  });

  // Content quality assessment
  let contentQualityScore = 100;
  let userBehaviorScore = 100;
  let sentiment: "positive" | "negative" | "neutral" = "neutral";

  CONTENT_QUALITY_INDICATORS.positive.forEach((indicator) => {
    if (lowerContent.includes(indicator)) {
      contentQualityScore += 5;
      userBehaviorScore += 3;
      sentiment = "positive";
    }
  });

  CONTENT_QUALITY_INDICATORS.negative.forEach((indicator) => {
    if (lowerContent.includes(indicator)) {
      contentQualityScore -= 15;
      userBehaviorScore -= 20;
      sentiment = "negative";
    }
  });

  // Length and complexity analysis
  if (content.length < 10) {
    spamScore += 8;
    riskScore += 10;
    flags.push("Very short content");
  } else if (content.length > 500) {
    contentQualityScore += 5;
  }

  // Emoji analysis (excessive emojis can indicate spam)
  const emojiCount = (
    content.match(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
    ) || []
  ).length;
  if (emojiCount > 5) {
    spamScore += 5;
    riskScore += 8;
    flags.push("Excessive emojis");
  }

  // Determine final classification
  const isSpam = spamScore >= 50;
  const confidence = Math.min(
    100,
    Math.max(20, 100 - Math.abs(spamScore - 50)),
  );
  const finalRiskScore = Math.min(100, Math.max(10, riskScore));

  // Determine urgency level
  let urgencyLevel: "low" | "medium" | "high" = "low";
  if (spamScore >= 40) urgencyLevel = "high";
  else if (spamScore >= 20) urgencyLevel = "medium";

  // Determine category
  let category = "legitimate";
  if (isSpam) {
    if (spamScore >= 70) category = "high_risk_spam";
    else if (spamScore >= 50) category = "spam";
    else category = "suspicious";
  }

  return {
    isSpam,
    confidence,
    riskScore: finalRiskScore,
    category,
    flags: [...new Set(flags)], // Remove duplicates
    analysisDetails: {
      language: "English", // Could be enhanced with language detection
      sentiment,
      urgency_level: urgencyLevel,
      suspicious_patterns: [...new Set(suspiciousPatterns)],
      user_behavior_score: Math.max(0, Math.min(100, userBehaviorScore)),
      content_quality_score: Math.max(0, Math.min(100, contentQualityScore)),
      platform_specific_risks: platformRisk.filter((risk) =>
        lowerContent.includes(risk.toLowerCase()),
      ),
      content_moderation_score: Math.max(0, Math.min(100, 100 - spamScore)),
      brand_safety_score: Math.max(0, Math.min(100, 100 - finalRiskScore)),
    },
  };
}

// API methods
export const socialMediaAPI = {
  // Analyze social media content across multiple platforms
  async analyzeSocialMediaContent(
    data: SocialMediaAnalysisRequest,
  ): Promise<SocialMediaAnalysisResult[]> {
    try {
      const response = await apiRequest<{
        success: boolean;
        data: SocialMediaAnalysisResult[];
      }>("/analyze", {
        method: "POST",
        body: JSON.stringify(data),
      });

      // Handle both response formats
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response && Array.isArray(response)) {
        return response;
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (error) {
      // Fallback to client-side analysis when API is unavailable
      console.log("Social Media API unavailable, using client-side analysis");

      return data.platforms.map((platformId) => {
        const analysis = analyzeContentQuality(data.content, platformId);

        return {
          platform: platformId.charAt(0).toUpperCase() + platformId.slice(1),
          content: data.content,
          result: analysis.isSpam
            ? "spam"
            : analysis.riskScore > 40
              ? "suspicious"
              : "clean",
          confidence_score: analysis.confidence,
          risk_score: analysis.riskScore,
          category: analysis.category,
          flags: analysis.flags,
          analysis_details: analysis.analysisDetails,
          timestamp: new Date().toISOString(),
          scan_id: `mock-${Date.now()}-${platformId}`,
        };
      });
    }
  },

  // Get social media analytics
  async getSocialMediaAnalytics(): Promise<SocialMediaAnalytics> {
    try {
      const response = await apiRequest<{
        success: boolean;
        data: SocialMediaAnalytics;
      }>("/analytics");
      return response.data;
    } catch (error) {
      // Fallback to mock data when API is unavailable
      console.log("Social Media Analytics API unavailable, using mock data");
      return mockSocialMediaAnalytics;
    }
  },

  // Get social media analysis history
  async getSocialMediaHistory(
    filters: SocialMediaFilters = {},
  ): Promise<PaginatedSocialMediaResponse<SocialMediaAnalysisResult>> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await apiRequest<{
        success: boolean;
        data: PaginatedSocialMediaResponse<SocialMediaAnalysisResult>;
      }>(`/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      // Return empty response when API is unavailable
      console.log("Social Media History API unavailable");
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0,
        },
      };
    }
  },

  // Get single analysis by ID
  async getAnalysisById(id: string): Promise<SocialMediaAnalysisResult> {
    try {
      const response = await apiRequest<{
        success: boolean;
        data: SocialMediaAnalysisResult;
      }>(`/analysis/${id}`);
      return response.data;
    } catch (error) {
      throw new Error("Analysis not found");
    }
  },

  // Delete analysis
  async deleteAnalysis(id: string): Promise<void> {
    try {
      await apiRequest(`/analysis/${id}`, { method: "DELETE" });
    } catch (error) {
      throw new Error("Failed to delete analysis");
    }
  },

  // Export analysis report
  async exportReport(filters: SocialMediaFilters = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${API_BASE}/export?${params.toString()}`, {
        headers: {
          "X-User-Id": "demo-user-id",
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      return await response.blob();
    } catch (error) {
      throw new Error("Export service unavailable");
    }
  },

  // Health check
  async healthCheck(): Promise<{
    status: string;
    database: string;
    timestamp: string;
  }> {
    try {
      return await apiRequest("/health");
    } catch (error) {
      return {
        status: "offline",
        database: "unavailable",
        timestamp: new Date().toISOString(),
      };
    }
  },
};

// Export convenience methods
export const {
  analyzeSocialMediaContent,
  getSocialMediaAnalytics,
  getSocialMediaHistory,
  getAnalysisById,
  deleteAnalysis,
  exportReport,
  healthCheck,
} = socialMediaAPI;

export default socialMediaAPI;
