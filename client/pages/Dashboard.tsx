import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Shield, CheckCircle, Search, Globe } from "lucide-react";
import {
  analyzeMessage,
  getScanHistory,
  getAnalytics,
  type ScanRecord,
  type AnalyticsData,
} from "../services/api";
import { DatabaseStatus } from "../components/DatabaseStatus";
import { FaceLockSetupPrompt } from "@/components/FaceLockSetupPrompt";
import { faceAuthService, isFaceLockEnabled } from "@/services/faceAuth";
import { useAuth } from "@/contexts/AuthContext";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  icon: React.ReactNode;
}

function StatCard({ title, value, change, changeType, icon }: StatCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p
          className={`text-xs ${changeType === "positive" ? "text-success" : "text-destructive"}`}
        >
          {change}
        </p>
      </CardContent>
    </Card>
  );
}

interface RecentScan {
  date: string;
  time: string;
  content: string;
  type: "SMS" | "Email";
  status: "Clean" | "Spam";
}

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Face Lock setup prompt state
  const [showFaceLockPrompt, setShowFaceLockPrompt] = useState(false);
  const [faceLockPromptTrigger, setFaceLockPromptTrigger] = useState<
    "signup" | "login" | "manual"
  >("manual");

  // Check if Face Lock setup prompt should be shown
  useEffect(() => {
    // Check if user just signed up or logged in and Face Lock is not enabled
    const messageFromSignup = location.state?.message;
    const fromSignup = location.state?.fromSignup;
    const fromLogin = location.state?.fromLogin;

    if (
      !isFaceLockEnabled() &&
      (fromSignup || fromLogin || messageFromSignup)
    ) {
      // Show Face Lock setup prompt for new users or returning users without Face Lock
      setFaceLockPromptTrigger(fromSignup ? "signup" : "login");
      // Delay showing prompt to let dashboard load first
      setTimeout(() => {
        setShowFaceLockPrompt(true);
      }, 1500);
    }
  }, [location.state]);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [scansData, analyticsData] = await Promise.all([
        getScanHistory({ limit: 5 }),
        getAnalytics(7),
      ]);

      setRecentScans(scansData?.data || []);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      // Set safe defaults on error
      setRecentScans([]);
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!message.trim()) return;

    setIsAnalyzing(true);
    try {
      // Enhanced message format detection
      const isEmail =
        message.includes("@") ||
        message.toLowerCase().includes("subject:") ||
        message.toLowerCase().includes("from:") ||
        message.toLowerCase().includes("to:");

      const messageType = isEmail ? "email" : "sms";

      // Extract email components if it's an email format
      let sender, subject, phoneNumber;

      if (isEmail) {
        // Extract sender from "From:" line
        const fromMatch = message.match(/from:\s*([^\n\r]+)/i);
        sender = fromMatch ? fromMatch[1].trim() : undefined;

        // Extract subject from "Subject:" line
        const subjectMatch = message.match(/subject:\s*([^\n\r]+)/i);
        subject = subjectMatch ? subjectMatch[1].trim() : undefined;
      } else {
        // For SMS, look for phone number patterns
        const phoneMatch = message.match(/(\+?[\d\s\-\(\)]{10,})/);
        phoneNumber = phoneMatch ? phoneMatch[1].trim() : undefined;
      }

      const result = await analyzeMessage({
        content: message,
        message_type: messageType,
        sender: sender,
        subject: subject,
        phone_number: phoneNumber,
      });

      // Show detailed result
      const resultText =
        result.result === "spam"
          ? "🚨 SPAM DETECTED"
          : result.result === "suspicious"
            ? "⚠️ SUSPICIOUS"
            : "✅ CLEAN";

      const flags =
        result.flags && result.flags.length > 0
          ? `\nRisk Flags: ${result.flags.join(", ")}`
          : "";

      alert(
        `${resultText}\n\nConfidence: ${result.confidence_score}%\nRisk Score: ${result.risk_score}/100\nCategory: ${result.category || "Unknown"}${flags}\n\nMessage saved to scan history!`,
      );

      // Reload recent scans to show the new one
      loadDashboardData();

      // Clear the message
      setMessage("");
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("❌ Analysis failed. Please try again or check your connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Face Lock prompt handlers
  const handleFaceLockSetup = () => {
    setShowFaceLockPrompt(false);
    // Navigation will be handled by the FaceLockSetupPrompt component
  };

  const handleFaceLockSkip = () => {
    setShowFaceLockPrompt(false);
    // Store that user skipped for this session
    sessionStorage.setItem("faceLockSkipped", "true");
  };

  const handleFaceLockClose = () => {
    setShowFaceLockPrompt(false);
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            Email/SMS Spam Classifier
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze messages for spam detection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DatabaseStatus />
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate("/social-media-analyzer")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Globe className="h-4 w-4 mr-2" />
            Social Media Analyzer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title="Total Scans"
          value={
            isLoading
              ? "..."
              : (analytics?.summary?.total_scans ?? 0).toLocaleString()
          }
          change={isLoading ? "..." : "Last 7 days"}
          changeType="positive"
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Spam Detected"
          value={
            isLoading
              ? "..."
              : (analytics?.summary?.spam_detected ?? 0).toLocaleString()
          }
          change={
            isLoading
              ? "..."
              : (() => {
                  const total = analytics?.summary?.total_scans ?? 0;
                  const spam = analytics?.summary?.spam_detected ?? 0;
                  const pct =
                    total > 0 ? ((spam / total) * 100).toFixed(1) : "0.0";
                  return `${pct}% of total`;
                })()
          }
          changeType="negative"
          icon={<Shield className="h-4 w-4 text-destructive" />}
        />
        <StatCard
          title="Clean Messages"
          value={
            isLoading
              ? "..."
              : (analytics?.summary?.clean_messages ?? 0).toLocaleString()
          }
          change={
            isLoading
              ? "..."
              : (() => {
                  const total = analytics?.summary?.total_scans ?? 0;
                  const clean = analytics?.summary?.clean_messages ?? 0;
                  const pct =
                    total > 0 ? ((clean / total) * 100).toFixed(1) : "0.0";
                  return `${pct}% of total`;
                })()
          }
          changeType="positive"
          icon={<CheckCircle className="h-4 w-4 text-success" />}
        />
      </div>

      {/* Email/SMS Analyzer */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Search className="h-5 w-5 text-destructive" />
            Email/SMS-Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Paste your message content below to analyze if it's spam or
              legitimate. Supports both email and SMS formats.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg border overflow-hidden">
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-foreground">
                  📧 Email Format Example:
                </h4>
                <code className="text-xs text-muted-foreground block">
                  Subject: Amazing offer!
                  <br />
                  From: sender@domain.com
                  <br />
                  <br />
                  Your message content here...
                </code>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-foreground">
                  📱 SMS Format Example:
                </h4>
                <code className="text-xs text-muted-foreground block">
                  From: +1-555-0123
                  <br />
                  <br />
                  Your SMS message content here...
                </code>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Paste email or SMS content here...

Examples:
• Email: Subject: Win $1000! From: fake@scam.com (Your email body)
• SMS: You've won a prize! Click: http://suspicious-link.com"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[140px] bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
            />

            {message.trim() && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <span>📊 Detection hints:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      message.includes("@") ||
                      message.toLowerCase().includes("subject:") ||
                      message.toLowerCase().includes("from:")
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {message.includes("@") ||
                    message.toLowerCase().includes("subject:") ||
                    message.toLowerCase().includes("from:")
                      ? "📧 Email format detected"
                      : "📱 SMS format detected"}
                  </span>
                  {message.length > 0 && (
                    <span className="text-muted-foreground">
                      ({message.length} characters)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleAnalyze}
              disabled={!message.trim() || isAnalyzing}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              {isAnalyzing ? "ANALYZING..." : "▶ ANALYZE MESSAGE"}
            </Button>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Quick test examples:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMessage(
                      "Subject: URGENT: Claim your $1000 prize NOW!\nFrom: winner@prizes.fake\n\nCongratulations! You've won a $1000 gift card. Click here immediately to claim your prize before it expires!",
                    )
                  }
                  className="text-xs"
                >
                  📧 Spam Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMessage(
                      "From: +1-555-SCAM\n\nYour account needs verification. Click link: http://suspicious-bank.fake/verify",
                    )
                  }
                  className="text-xs"
                >
                  📱 Spam SMS
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMessage(
                      "Subject: Meeting reminder for tomorrow\nFrom: sarah.johnson@company.com\n\nHi John, Just a reminder about our team meeting tomorrow at 2 PM in Conference Room A.",
                    )
                  }
                  className="text-xs"
                >
                  📧 Clean Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMessage(
                      "From: +1-206-266-1000\n\nYour package has been shipped and will arrive today between 2-4 PM. Track: https://ups.com/track/123456",
                    )
                  }
                  className="text-xs"
                >
                  📱 Clean SMS
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Features */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Globe className="h-5 w-5 text-primary" />
            Quick Access Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Social Media Analyzer
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Multi-platform spam detection
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Analyze content from Instagram, Facebook, WhatsApp, Twitter,
                LinkedIn, YouTube, and more for spam detection and content
                classification.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/social-media-analyzer")}
                className="w-full"
              >
                Open Social Media Analyzer
              </Button>
            </div>
            <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Advanced Threat Protection
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive security suite
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Access advanced threat detection, phishing protection, live
                analysis, and automated threat response systems.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/threat-automation")}
                className="w-full"
              >
                View Threat Tools
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Scans */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="h-2 w-2 rounded-full bg-destructive"></div>
            Recent Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 min-w-[80px]">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 min-w-[200px]">
                    Content Preview
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 min-w-[60px]">
                    Type
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 min-w-[80px]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Loading recent scans...
                    </td>
                  </tr>
                ) : !recentScans || recentScans.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No scans yet. Try analyzing a message above!
                    </td>
                  </tr>
                ) : (
                  (recentScans || []).map((scan) => {
                    const date = new Date(scan.created_at);
                    const isToday =
                      date.toDateString() === new Date().toDateString();
                    const dateStr = isToday
                      ? "Today"
                      : date.toLocaleDateString();
                    const timeStr = date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={scan.id} className="border-b border-border/50">
                        <td className="py-3 text-sm text-foreground">
                          <div className="flex flex-col">
                            <span>{dateStr}</span>
                            <span className="text-xs text-muted-foreground">
                              {timeStr}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-foreground max-w-xs truncate">
                          {scan.subject && (
                            <div className="font-medium truncate">
                              {scan.subject}
                            </div>
                          )}
                          {scan.content.substring(0, 100)}...
                        </td>
                        <td className="py-3 text-sm text-foreground capitalize">
                          {scan.message_type}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              scan.result === "clean"
                                ? "bg-success/20 text-success"
                                : scan.result === "suspicious"
                                  ? "bg-warning/20 text-warning"
                                  : "bg-destructive/20 text-destructive"
                            }`}
                          >
                            {scan.result.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-4">
        © 2025 SecureMail Spam Protection System. All rights reserved.
      </div>

      {/* Face Lock Setup Prompt */}
      <FaceLockSetupPrompt
        isOpen={showFaceLockPrompt}
        onClose={handleFaceLockClose}
        onSkip={handleFaceLockSkip}
        onSetup={handleFaceLockSetup}
        trigger={faceLockPromptTrigger}
      />
    </div>
  );
}
