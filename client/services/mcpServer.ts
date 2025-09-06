export interface MCPServerStatus {
  connected: boolean;
  serverUrl: string;
  lastConnected: string;
  features: string[];
}

export interface MCPAnalysisRequest {
  content: string;
  platforms: string[];
  userId?: string;
}

export interface MCPAnalysisResponse {
  success: boolean;
  results: any[];
  enhancedFeatures: string[];
  serverTimestamp: string;
}

class MCPServerService {
  private ws: WebSocket | null = null;
  private serverUrl: string = "ws://localhost:3001";
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  async connect(): Promise<MCPServerStatus> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.serverUrl);

        this.ws.onopen = () => {
          console.log("MCP Server connected");
          this.reconnectAttempts = 0;
          resolve({
            connected: true,
            serverUrl: this.serverUrl,
            lastConnected: new Date().toISOString(),
            features: ["social_media_analysis", "content_filtering", "threat_detection", "real_time_monitoring"],
          });
        };

        this.ws.onclose = () => {
          console.log("MCP Server disconnected");
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error("MCP Server connection error:", error);
          reject(error);
        };

        // Set connection timeout
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error("Connection timeout"));
          }
        }, 5000);

      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async analyzeContent(request: MCPAnalysisRequest): Promise<MCPAnalysisResponse> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("MCP Server not connected"));
        return;
      }

      const messageId = Date.now().toString();
      
      // Set up response handler
      const handleMessage = (event: MessageEvent) => {
        try {
          const response = JSON.parse(event.data);
          if (response.id === messageId) {
            this.ws?.removeEventListener('message', handleMessage);
            resolve(response);
          }
        } catch (error) {
          console.error("Failed to parse MCP response:", error);
        }
      };

      this.ws.addEventListener('message', handleMessage);

      // Send analysis request
      const requestMessage = {
        id: messageId,
        type: "analyze_content",
        data: request,
        timestamp: new Date().toISOString(),
      };

      this.ws.send(JSON.stringify(requestMessage));

      // Set timeout for response
      setTimeout(() => {
        this.ws?.removeEventListener('message', handleMessage);
        reject(new Error("Analysis timeout"));
      }, 30000);
    });
  }

  async getServerStatus(): Promise<MCPServerStatus> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        resolve({
          connected: false,
          serverUrl: this.serverUrl,
          lastConnected: "",
          features: [],
        });
        return;
      }

      const messageId = Date.now().toString();
      
      const handleMessage = (event: MessageEvent) => {
        try {
          const response = JSON.parse(event.data);
          if (response.id === messageId) {
            this.ws?.removeEventListener('message', handleMessage);
            resolve(response.data);
          }
        } catch (error) {
          console.error("Failed to parse status response:", error);
        }
      };

      this.ws.addEventListener('message', handleMessage);

      const statusMessage = {
        id: messageId,
        type: "get_status",
        timestamp: new Date().toISOString(),
      };

      this.ws.send(JSON.stringify(statusMessage));

      setTimeout(() => {
        this.ws?.removeEventListener('message', handleMessage);
        reject(new Error("Status request timeout"));
      }, 5000);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect to MCP Server (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error("Reconnection failed:", error);
        });
      }, 2000 * this.reconnectAttempts); // Exponential backoff
    }
  }

  // Mock methods for development/demo purposes
  async mockConnect(): Promise<MCPServerStatus> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      connected: Math.random() > 0.3, // 70% success rate
      serverUrl: this.serverUrl,
      lastConnected: new Date().toISOString(),
      features: ["social_media_analysis", "content_filtering", "threat_detection", "real_time_monitoring"],
    };
  }

  async mockAnalyzeContent(request: MCPAnalysisRequest): Promise<MCPAnalysisResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Enhanced mock analysis with MCP server features
    const enhancedResults = request.platforms.map(platform => ({
      platform,
      content: request.content,
      result: this.determineMockResult(request.content),
      confidence_score: Math.random() * 20 + 80,
      risk_score: Math.random() * 40 + 20,
      category: "enhanced_analysis",
      flags: this.generateMockFlags(request.content),
      analysis_details: {
        language: "English",
        sentiment: this.determineSentiment(request.content),
        urgency_level: this.determineUrgency(request.content),
        suspicious_patterns: this.detectPatterns(request.content),
        user_behavior_score: Math.random() * 30 + 70,
        content_quality_score: Math.random() * 30 + 70,
      },
      timestamp: new Date().toISOString(),
      mcpEnhanced: true,
    }));

    return {
      success: true,
      results: enhancedResults,
      enhancedFeatures: ["ai_enhanced_detection", "behavioral_analysis", "cross_platform_correlation"],
      serverTimestamp: new Date().toISOString(),
    };
  }

  private determineMockResult(content: string): "spam" | "clean" | "suspicious" {
    const lowerContent = content.toLowerCase();
    const spamKeywords = ["urgent", "win", "prize", "gift card", "click here", "verify", "claim"];
    const suspiciousKeywords = ["account suspended", "verification required", "suspicious activity"];
    
    if (spamKeywords.some(keyword => lowerContent.includes(keyword))) {
      return "spam";
    } else if (suspiciousKeywords.some(keyword => lowerContent.includes(keyword))) {
      return "suspicious";
    }
    return "clean";
  }

  private determineSentiment(content: string): "positive" | "negative" | "neutral" {
    const lowerContent = content.toLowerCase();
    const positiveWords = ["amazing", "incredible", "great", "wonderful", "excellent"];
    const negativeWords = ["urgent", "suspended", "suspicious", "verify", "claim"];
    
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    
    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  }

  private determineUrgency(content: string): "low" | "medium" | "high" {
    const lowerContent = content.toLowerCase();
    const highUrgencyWords = ["urgent", "immediately", "now", "hurry"];
    const mediumUrgencyWords = ["soon", "limited time", "expires"];
    
    if (highUrgencyWords.some(word => lowerContent.includes(word))) return "high";
    if (mediumUrgencyWords.some(word => lowerContent.includes(word))) return "medium";
    return "low";
  }

  private detectPatterns(content: string): string[] {
    const patterns: string[] = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes("urgent")) patterns.push("Urgency language");
    if (lowerContent.includes("win") || lowerContent.includes("prize")) patterns.push("Monetary offers");
    if (lowerContent.includes("click here")) patterns.push("Suspicious actions");
    if (lowerContent.includes("verify")) patterns.push("Verification requests");
    if (lowerContent.includes("limited time")) patterns.push("Time pressure");
    
    return patterns;
  }

  private generateMockFlags(content: string): string[] {
    const flags: string[] = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes("urgent")) flags.push("Urgency language");
    if (lowerContent.includes("win") || lowerContent.includes("prize")) flags.push("Monetary offers");
    if (lowerContent.includes("click here")) flags.push("Suspicious actions");
    if (lowerContent.includes("verify")) flags.push("Verification requests");
    if (lowerContent.includes("limited time")) flags.push("Time pressure");
    if (lowerContent.includes("amazing") || lowerContent.includes("incredible")) flags.push("Emotional manipulation");
    
    return flags;
  }
}

export const mcpServerService = new MCPServerService();
