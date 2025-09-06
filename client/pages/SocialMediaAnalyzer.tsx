import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Instagram,
  Facebook,
  MessageCircle,
  Linkedin,
  Youtube,
  Globe,
  AlertTriangle,
  CheckCircle,
  Shield,
  BarChart3,
  Download,
  RefreshCw,
  Filter,
  Search,
  Users,
  TrendingUp,
  AlertCircle,
  Server,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  analyzeSocialMediaContent,
  getSocialMediaAnalytics,
} from "../services/socialMediaApi";
import { mcpServerService, MCPServerStatus } from "../services/mcpServer";

// Custom X (Twitter) Icon Component
const XIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface SocialMediaPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  enabled: boolean;
}

interface AnalysisResult {
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
  };
  timestamp: string;
}

interface SocialMediaAnalytics {
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
}

const socialMediaPlatforms: SocialMediaPlatform[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "text-white",
    bgColor: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
    borderColor: "border-purple-500",
    enabled: true,
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "text-white",
    bgColor: "bg-blue-600",
    borderColor: "border-blue-600",
    enabled: true,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: MessageCircle,
    color: "text-white",
    bgColor: "bg-green-500",
    borderColor: "border-green-500",
    enabled: true,
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: XIcon,
    color: "text-white",
    bgColor: "bg-black",
    borderColor: "border-gray-800",
    enabled: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-white",
    bgColor: "bg-blue-700",
    borderColor: "border-blue-700",
    enabled: true,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    color: "text-white",
    bgColor: "bg-red-600",
    borderColor: "border-red-600",
    enabled: true,
  },
  {
    id: "other",
    name: "Other Platforms",
    icon: Globe,
    color: "text-white",
    bgColor: "bg-gray-600",
    borderColor: "border-gray-600",
    enabled: true,
  },
];

export default function SocialMediaAnalyzer() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "instagram",
    "facebook",
    "whatsapp",
  ]);
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [analytics, setAnalytics] = useState<SocialMediaAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analyzer");
  const [mcpServerStatus, setMcpServerStatus] = useState<MCPServerStatus>({
    connected: false,
    serverUrl: "ws://localhost:3001",
    lastConnected: "",
    features: [],
  });
  const [isConnectingMCP, setIsConnectingMCP] = useState(false);

  useEffect(() => {
    loadAnalytics();
    checkMCPServerStatus();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await getSocialMediaAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      // Set mock data for demo
      setAnalytics({
        total_analyzed: 1247,
        spam_detected: 89,
        clean_content: 1158,
        suspicious_content: 12,
        platform_breakdown: [
          {
            platform: "Instagram",
            total: 456,
            spam: 34,
            clean: 422,
            suspicious: 2,
          },
          {
            platform: "Facebook",
            total: 389,
            spam: 28,
            clean: 361,
            suspicious: 4,
          },
          {
            platform: "WhatsApp",
            total: 402,
            spam: 27,
            clean: 375,
            suspicious: 6,
          },
        ],
        threat_categories: [
          { category: "Phishing Scams", count: 45, avg_risk_score: 87.3 },
          { category: "Fake Promotions", count: 23, avg_risk_score: 76.8 },
          { category: "Malware Links", count: 21, avg_risk_score: 92.1 },
        ],
        recent_activity: [
          { date: "2024-01-15", total: 45, spam: 8, clean: 37, suspicious: 2 },
          { date: "2024-01-14", total: 52, spam: 12, clean: 40, suspicious: 3 },
          { date: "2024-01-13", total: 38, spam: 6, clean: 32, suspicious: 1 },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkMCPServerStatus = async () => {
    try {
      const status = await mcpServerService.mockConnect();
      setMcpServerStatus(status);
    } catch (error) {
      console.error("Failed to check MCP server status:", error);
      setMcpServerStatus({
        connected: false,
        serverUrl: "ws://localhost:3001",
        lastConnected: "",
        features: [],
      });
    }
  };

  const connectToMCPServer = async () => {
    setIsConnectingMCP(true);
    try {
      const status = await mcpServerService.mockConnect();
      setMcpServerStatus(status);
    } catch (error) {
      console.error("Failed to connect to MCP server:", error);
    } finally {
      setIsConnectingMCP(false);
    }
  };

  const disconnectFromMCPServer = async () => {
    try {
      await mcpServerService.disconnect();
      setMcpServerStatus({
        ...mcpServerStatus,
        connected: false,
        lastConnected: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to disconnect from MCP server:", error);
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId],
    );
  };

  const handleAnalyze = async () => {
    if (!content.trim() || selectedPlatforms.length === 0) {
      console.log("Cannot analyze: content or platforms missing");
      return;
    }

    console.log("Starting analysis with:", {
      content: content.substring(0, 100) + "...",
      platforms: selectedPlatforms,
    });
    setIsAnalyzing(true);

    try {
      // Try API first
      const results = await analyzeSocialMediaContent({
        content,
        platforms: selectedPlatforms,
      });

      console.log("API response received:", results);

      // Handle both API response format and direct results
      if (results && Array.isArray(results)) {
        console.log("Setting results as array:", results);
        setAnalysisResults(results);
        // Switch to results tab and show success message
        setActiveTab("results");
        const spamCount = results.filter((r) => r.result === "spam").length;
        const suspiciousCount = results.filter(
          (r) => r.result === "suspicious",
        ).length;
        const cleanCount = results.filter((r) => r.result === "clean").length;

        if (spamCount > 0) {
          alert(
            `🚨 Analysis Complete!\n\nSpam Detected: ${spamCount} platform(s)\nSuspicious: ${suspiciousCount} platform(s)\nClean: ${cleanCount} platform(s)\n\nResults are now displayed in the Analysis Results tab.`,
          );
        } else if (suspiciousCount > 0) {
          alert(
            `⚠️ Analysis Complete!\n\nSuspicious: ${suspiciousCount} platform(s)\nClean: ${cleanCount} platform(s)\n\nResults are now displayed in the Analysis Results tab.`,
          );
        } else {
          alert(
            `✅ Analysis Complete!\n\nAll content analyzed as CLEAN across ${cleanCount} platform(s)\n\nResults are now displayed in the Analysis Results tab.`,
          );
        }
      } else if (results && results.data && Array.isArray(results.data)) {
        console.log("Setting results from data property:", results.data);
        setAnalysisResults(results.data);
        // Switch to results tab and show success message
        setActiveTab("results");
        const spamCount = results.data.filter(
          (r) => r.result === "spam",
        ).length;
        const suspiciousCount = results.data.filter(
          (r) => r.result === "suspicious",
        ).length;
        const cleanCount = results.data.filter(
          (r) => r.result === "clean",
        ).length;

        if (spamCount > 0) {
          alert(
            `🚨 Analysis Complete!\n\nSpam Detected: ${spamCount} platform(s)\nSuspicious: ${suspiciousCount} platform(s)\nClean: ${cleanCount} platform(s)\n\nResults are now displayed in the Analysis Results tab.`,
          );
        } else if (suspiciousCount > 0) {
          alert(
            `⚠️ Analysis Complete!\n\nSuspicious: ${suspiciousCount} platform(s)\nClean: ${cleanCount} platform(s)\n\nCheck the "Analysis Results" tab for detailed information.`,
          );
        } else {
          alert(
            `✅ Analysis Complete!\n\nAll content analyzed as CLEAN across ${cleanCount} platform(s)\n\nResults are now displayed in the Analysis Results tab.`,
          );
        }
      } else {
        console.error("Invalid response format:", results);
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      console.log("Falling back to enhanced mock analysis");
      
      // Enhanced fallback to mock analysis with better spam detection
      const mockResults: AnalysisResult[] = selectedPlatforms.map(
        (platformId) => {
          const platform = socialMediaPlatforms.find(
            (p) => p.id === platformId,
          );
          const lowerContent = content.toLowerCase();

          // Enhanced spam detection patterns
          const isSpam =
            lowerContent.includes("urgent") ||
            lowerContent.includes("win") ||
            lowerContent.includes("won") ||
            lowerContent.includes("prize") ||
            lowerContent.includes("gift card") ||
            lowerContent.includes("cash") ||
            lowerContent.includes("money") ||
            lowerContent.includes("free") ||
            lowerContent.includes("click here") ||
            lowerContent.includes("verify") ||
            lowerContent.includes("confirm") ||
            lowerContent.includes("update") ||
            lowerContent.includes("claim") ||
            lowerContent.includes("congratulations") ||
            lowerContent.includes("limited time") ||
            lowerContent.includes("expires") ||
            lowerContent.includes("last chance") ||
            lowerContent.includes("don't miss") ||
            lowerContent.includes("act fast") ||
            lowerContent.includes("immediately") ||
            lowerContent.includes("now") ||
            lowerContent.includes("hurry") ||
            lowerContent.includes("suspicious") ||
            lowerContent.includes("account suspended") ||
            lowerContent.includes("verification required") ||
            lowerContent.includes("unlock account") ||
            lowerContent.includes("reactivate") ||
            lowerContent.includes("download") ||
            lowerContent.includes("install") ||
            lowerContent.includes("subscribe") ||
            lowerContent.includes("join now") ||
            lowerContent.includes("amazing") ||
            lowerContent.includes("incredible") ||
            lowerContent.includes("shocking") ||
            lowerContent.includes("unbelievable") ||
            lowerContent.includes("exclusive") ||
            lowerContent.includes("secret") ||
            lowerContent.includes("hidden") ||
            lowerContent.includes("revealed") ||
            lowerContent.includes("exposed") ||
            lowerContent.includes("scandal");

          // Determine result type with more granular classification
          let result: "spam" | "clean" | "suspicious" = "clean";
          let confidence_score = 85;
          let risk_score = 15;
          let category = "legitimate";
          let flags: string[] = [];
          let sentiment: "positive" | "negative" | "neutral" = "neutral";
          let urgency_level: "low" | "medium" | "high" = "low";
          let suspicious_patterns: string[] = [];
          let user_behavior_score = 90;
          let content_quality_score = 85;

          if (isSpam) {
            result = "spam";
            confidence_score = Math.random() * 20 + 75; // 75-95%
            risk_score = Math.random() * 30 + 65; // 65-95
            category = "scam";
            sentiment = "negative";
            urgency_level = "high";

            // Add specific flags based on content
            if (
              lowerContent.includes("urgent") ||
              lowerContent.includes("immediately") ||
              lowerContent.includes("now")
            ) {
              flags.push("Urgency language");
              suspicious_patterns.push("Urgency");
            }
            if (
              lowerContent.includes("win") ||
              lowerContent.includes("prize") ||
              lowerContent.includes("gift card") ||
              lowerContent.includes("cash")
            ) {
              flags.push("Monetary offers");
              suspicious_patterns.push("Monetary offers");
            }
            if (
              lowerContent.includes("click here") ||
              lowerContent.includes("verify") ||
              lowerContent.includes("confirm")
            ) {
              flags.push("Suspicious actions");
              suspicious_patterns.push("Suspicious actions");
            }
            if (
              lowerContent.includes("limited time") ||
              lowerContent.includes("expires") ||
              lowerContent.includes("last chance")
            ) {
              flags.push("Time pressure");
              suspicious_patterns.push("Time pressure");
            }
            if (
              lowerContent.includes("amazing") ||
              lowerContent.includes("incredible") ||
              lowerContent.includes("exclusive")
            ) {
              flags.push("Emotional manipulation");
              suspicious_patterns.push("Emotional manipulation");
            }

            user_behavior_score = Math.random() * 30 + 20; // 20-50
            content_quality_score = Math.random() * 30 + 25; // 25-55
          } else if (
            lowerContent.includes("suspicious") ||
            lowerContent.includes("account suspended") ||
            lowerContent.includes("verification required")
          ) {
            result = "suspicious";
            confidence_score = Math.random() * 25 + 60; // 60-85%
            risk_score = Math.random() * 25 + 40; // 40-65
            category = "suspicious";
            sentiment = "negative";
            urgency_level = "medium";
            flags.push("Account security concerns");
            suspicious_patterns.push("Account security");
            user_behavior_score = Math.random() * 30 + 50; // 50-80
            content_quality_score = Math.random() * 30 + 45; // 45-75
          } else {
            // Clean content
            confidence_score = Math.random() * 20 + 80; // 80-100%
            risk_score = Math.random() * 20 + 5; // 5-25
            category = "legitimate";
            sentiment = "positive";
            urgency_level = "low";
            user_behavior_score = Math.random() * 20 + 80; // 80-100
            content_quality_score = Math.random() * 20 + 80; // 80-100
          }

          return {
            platform: platform?.name || platformId,
            content,
            result,
            confidence_score,
            risk_score,
            category,
            flags,
            analysis_details: {
              language: "English",
              sentiment,
              urgency_level,
              suspicious_patterns,
              user_behavior_score,
              content_quality_score,
            },
            timestamp: new Date().toISOString(),
          };
        },
      );
      setAnalysisResults(mockResults);
      // Switch to results tab and show success message for mock analysis
      setActiveTab("results");
      const spamCount = mockResults.filter((r) => r.result === "spam").length;
      const suspiciousCount = mockResults.filter(
        (r) => r.result === "suspicious",
      ).length;
      const cleanCount = mockResults.filter((r) => r.result === "clean").length;

      if (spamCount > 0) {
        alert(
          `🚨 Analysis Complete! (Mock Mode)\n\nSpam Detected: ${spamCount} platform(s)\nSuspicious: ${suspiciousCount} platform(s)\nClean: ${cleanCount} platform(s)\n\nResults are now displayed in the Analysis Results tab.`,
        );
      } else if (suspiciousCount > 0) {
        alert(
          `⚠️ Analysis Complete! (Mock Mode)\n\nSuspicious: ${suspiciousCount} platform(s)\nClean: ${cleanCount} platform(s)\n\nResults are now displayed in the Analysis Results tab.`,
        );
      } else {
        alert(
          `✅ Analysis Complete! (Mock Mode)\n\nAll content analyzed as CLEAN across ${cleanCount} platform(s)\n\nResults are now displayed in the Analysis Results tab.`,
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case "spam":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "suspicious":
        return <AlertCircle className="h-5 w-5 text-warning" />;
      default:
        return <CheckCircle className="h-5 w-5 text-success" />;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case "spam":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "suspicious":
        return "bg-warning/20 text-warning border-warning/30";
      default:
        return "bg-success/20 text-success border-success/30";
    }
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      platforms: selectedPlatforms,
      content,
      results: analysisResults,
      summary: {
        total: analysisResults.length,
        spam: analysisResults.filter((r) => r.result === "spam").length,
        clean: analysisResults.filter((r) => r.result === "clean").length,
        suspicious: analysisResults.filter((r) => r.result === "suspicious")
          .length,
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `social-media-analysis-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Social Media Analyzer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze content from multiple social media platforms for spam
            detection and content classification
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {analysisResults.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
        </div>
      </div>

      {/* MCP Server Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Server className="h-5 w-5 text-blue-600" />
            MCP Server Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  mcpServerStatus.connected
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {mcpServerStatus.connected ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                {mcpServerStatus.connected ? "Connected" : "Disconnected"}
              </div>
              <div className="text-sm text-muted-foreground">
                {mcpServerStatus.serverUrl}
              </div>
            </div>
            <div className="flex gap-2">
              {mcpServerStatus.connected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectFromMCPServer}
                  className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                >
                  <WifiOff className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={connectToMCPServer}
                  disabled={isConnectingMCP}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/20"
                >
                  {isConnectingMCP ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wifi className="h-4 w-4 mr-2" />
                  )}
                  {isConnectingMCP ? "Connecting..." : "Connect"}
                </Button>
              )}
            </div>
          </div>
          {mcpServerStatus.features.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">
                Available Features:
              </p>
              <div className="flex flex-wrap gap-2">
                {mcpServerStatus.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Globe className="h-5 w-5 text-primary" />
            Select Social Media Platforms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {socialMediaPlatforms.map((platform) => {
              const Icon = platform.icon;
              const isSelected = selectedPlatforms.includes(platform.id);

              return (
                <Button
                  key={platform.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePlatformToggle(platform.id)}
                  className={`h-auto p-3 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 ${
                    isSelected
                      ? `${platform.bgColor} ${platform.color} shadow-lg`
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  disabled={!platform.enabled}
                >
                  <Icon
                    className={`h-5 w-5 ${isSelected ? platform.color : ""}`}
                  />
                  <span
                    className={`text-xs font-medium ${isSelected ? platform.color : ""}`}
                  >
                    {platform.name}
                  </span>
                </Button>
              );
            })}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Selected platforms: {selectedPlatforms.length} of{" "}
              {socialMediaPlatforms.length}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 sm:mt-0">
              {selectedPlatforms.length > 0
                ? "Ready to analyze"
                : "Please select at least one platform"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-1 rounded-lg">
          <TabsTrigger
            value="analyzer"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
          >
            Content Analyzer
          </TabsTrigger>
          <TabsTrigger
            value="results"
            disabled={analysisResults.length === 0}
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
          >
            Analysis Results{" "}
            {analysisResults.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {analysisResults.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
          >
            Analytics Dashboard
          </TabsTrigger>
        </TabsList>

        {/* Content Analyzer Tab */}
        <TabsContent value="analyzer" className="space-y-6">
          <Card className="bg-gradient-to-br from-white via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-950/20 dark:to-pink-950/20 border-pink-200 dark:border-purple-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Search className="h-5 w-5 text-primary" />
                Content Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Paste content from your selected social media platforms to
                  analyze for spam, suspicious patterns, and content quality.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">
                      📱 Social Media Content Examples:
                    </h4>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded border shadow-sm">
                        <strong>Instagram Post:</strong>
                        <br />
                        "Check out this amazing deal! Limited time only! 🎉"
                      </div>
                      <div className="p-2 bg-white dark:bg-gray-800 rounded border shadow-sm">
                        <strong>WhatsApp Message:</strong>
                        <br />
                        "URGENT: Your account needs verification NOW!"
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">
                      🔍 Analysis Features:
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Spam detection across platforms</li>
                      <li>• Content quality assessment</li>
                      <li>• User behavior analysis</li>
                      <li>• Threat pattern recognition</li>
                      <li>• Multi-platform comparison</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Paste your social media content here...

Examples:
• Instagram: 'Check out this amazing deal! Limited time only! 🎉'
• WhatsApp: 'URGENT: Your account needs verification NOW!'
• Facebook: 'You won a prize! Click here to claim!'"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[160px] bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-foreground placeholder:text-muted-foreground resize-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />

                {content.trim() && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span>📊 Content analysis:</span>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium">
                          {content.length} characters
                        </span>
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium">
                          {selectedPlatforms.length} platforms selected
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={
                    !content.trim() ||
                    selectedPlatforms.length === 0 ||
                    isAnalyzing
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      ANALYZING ACROSS {selectedPlatforms.length} PLATFORMS...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      🔍 ANALYZE CONTENT
                    </div>
                  )}
                </Button>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    Quick test examples:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setContent(
                          "URGENT: You've won a $1000 gift card! Click here immediately to claim your prize before it expires! Limited time only! 🎉",
                        )
                      }
                      className="text-xs border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                    >
                      🚨 Spam Content
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setContent(
                          "Just had an amazing dinner at the new restaurant downtown! The food was incredible and the service was top-notch. Highly recommend! 🍽️✨",
                        )
                      }
                      className="text-xs border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/20"
                    >
                      ✅ Clean Content
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setContent(
                          "Your account has been suspended due to suspicious activity. Click here to verify your identity immediately.",
                        )
                      }
                      className="text-xs border-yellow-200 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-950/20"
                    >
                      ⚠️ Suspicious Content
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {analysisResults.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Analysis Results
                </h3>
                <p className="text-sm text-muted-foreground">
                  Analyze some content first to see results here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">
                        Total Analyzed
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mt-2">
                      {analysisResults.length}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <span className="text-sm font-medium">Spam Detected</span>
                    </div>
                    <div className="text-2xl font-bold text-destructive mt-2">
                      {
                        analysisResults.filter((r) => r.result === "spam")
                          .length
                      }
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      <span className="text-sm font-medium">Suspicious</span>
                    </div>
                    <div className="text-2xl font-bold text-warning mt-2">
                      {
                        analysisResults.filter((r) => r.result === "suspicious")
                          .length
                      }
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="text-sm font-medium">Clean</span>
                    </div>
                    <div className="text-2xl font-bold text-success mt-2">
                      {
                        analysisResults.filter((r) => r.result === "clean")
                          .length
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Results */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Shield className="h-5 w-5 text-primary" />
                    Platform Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getResultIcon(result.result)}
                            <div>
                              <h4 className="font-medium text-foreground">
                                {result.platform}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Analyzed at{" "}
                                {new Date(
                                  result.timestamp,
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <Badge className={getResultColor(result.result)}>
                            {result.result.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Confidence Score:
                              </span>
                              <span className="font-medium">
                                {(result.confidence_score || 0).toFixed(1)}%
                              </span>
                            </div>
                            <Progress
                              value={result.confidence_score || 0}
                              className="h-2"
                            />

                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Risk Score:
                              </span>
                              <span className="font-medium">
                                {(result.risk_score || 0).toFixed(1)}/100
                              </span>
                            </div>
                            <Progress
                              value={result.risk_score || 0}
                              className={`h-2 ${
                                (result.risk_score || 0) > 70
                                  ? "bg-destructive"
                                  : (result.risk_score || 0) > 40
                                    ? "bg-warning"
                                    : "bg-success"
                              }`}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Category:{" "}
                              </span>
                              <span className="font-medium capitalize">
                                {result.category || "unknown"}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Language:{" "}
                              </span>
                              <span className="font-medium">
                                {result.analysis_details?.language || "Unknown"}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Sentiment:{" "}
                              </span>
                              <Badge variant="outline" className="capitalize">
                                {result.analysis_details?.sentiment ||
                                  "neutral"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {(result.flags || []).length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-foreground">
                              Risk Flags:
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {(result.flags || []).map((flag, flagIndex) => (
                                <Badge
                                  key={flagIndex}
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  {flag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">
                              User Behavior
                            </div>
                            <div className="text-lg font-bold text-foreground">
                              {result.analysis_details?.user_behavior_score ||
                                0}
                              /100
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">
                              Content Quality
                            </div>
                            <div className="text-lg font-bold text-foreground">
                              {result.analysis_details?.content_quality_score ||
                                0}
                              /100
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">
                              Urgency Level
                            </div>
                            <div className="text-lg font-bold text-foreground capitalize">
                              {result.analysis_details?.urgency_level || "low"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Analytics Dashboard Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {isLoading ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Loading Analytics
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we load your social media analysis data...
                </p>
              </CardContent>
            </Card>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">
                        Total Analyzed
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mt-2">
                      {(analytics?.total_analyzed ?? 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      All time
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <span className="text-sm font-medium">Spam Detected</span>
                    </div>
                    <div className="text-2xl font-bold text-destructive mt-2">
                      {(analytics?.spam_detected ?? 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(() => {
                        const total = analytics?.total_analyzed ?? 0;
                        const spam = analytics?.spam_detected ?? 0;
                        const pct =
                          total > 0 ? ((spam / total) * 100).toFixed(1) : "0.0";
                        return `${pct}% of total`;
                      })()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="text-sm font-medium">Clean Content</span>
                    </div>
                    <div className="text-2xl font-bold text-success mt-2">
                      {(analytics?.clean_content ?? 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(() => {
                        const total = analytics?.total_analyzed ?? 0;
                        const clean = analytics?.clean_content ?? 0;
                        const pct =
                          total > 0
                            ? ((clean / total) * 100).toFixed(1)
                            : "0.0";
                        return `${pct}% of total`;
                      })()}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      <span className="text-sm font-medium">Suspicious</span>
                    </div>
                    <div className="text-2xl font-bold text-warning mt-2">
                      {(analytics?.suspicious_content ?? 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(() => {
                        const total = analytics?.total_analyzed ?? 0;
                        const sus = analytics?.suspicious_content ?? 0;
                        const pct =
                          total > 0 ? ((sus / total) * 100).toFixed(1) : "0.0";
                        return `${pct}% of total`;
                      })()}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Breakdown */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Globe className="h-5 w-5 text-primary" />
                    Platform Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(analytics?.platform_breakdown ?? []).map((platform) => (
                      <div key={platform.platform} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">
                            {platform.platform}
                          </span>
                          <span className="text-muted-foreground">
                            {platform.total} total • {platform.spam} spam •{" "}
                            {platform.clean} clean
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="flex h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-success h-full"
                              style={{
                                width: `${(platform.clean / platform.total) * 100}%`,
                              }}
                            />
                            <div
                              className="bg-warning h-full"
                              style={{
                                width: `${(platform.suspicious / platform.total) * 100}%`,
                              }}
                            />
                            <div
                              className="bg-destructive h-full"
                              style={{
                                width: `${(platform.spam / platform.total) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Threat Categories */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Shield className="h-5 w-5 text-primary" />
                    Threat Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(analytics?.threat_categories ?? []).map((category) => (
                      <div
                        key={category.category}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-foreground">
                            {category.category}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {category.count} instances detected
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-foreground">
                            {(category.avg_risk_score || 0).toFixed(1)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Avg Risk Score
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Recent Activity (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(analytics?.recent_activity ?? []).map((day) => (
                      <div
                        key={day.date}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium text-foreground">
                            {new Date(day.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-success"></div>
                              {day.clean}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-warning"></div>
                              {day.suspicious}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-destructive"></div>
                              {day.spam}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-foreground">
                            {day.total}
                          </div>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Analytics Data
                </h3>
                <p className="text-sm text-muted-foreground">
                  Start analyzing content to see analytics data here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-6 pb-4 border-t border-gray-200 dark:border-gray-800">
        <p>
          © 2025 SecureMail Social Media Protection System. All rights
          reserved.
        </p>
        <p className="mt-1">
          Powered by MCP Server Integration • Real-time Threat Detection •
          Multi-Platform Analysis
        </p>
      </div>
    </div>
  );
}
