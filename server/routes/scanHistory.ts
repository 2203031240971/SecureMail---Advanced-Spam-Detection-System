import { Request, Response } from "express";
import { query } from "../db/connection";

const isMockMode = process.env.USE_MOCK_DATA === "true" || !process.env.DATABASE_URL;

// Cursor-based pagination interface
interface CursorPagination {
  cursor?: string;
  limit?: number;
  direction?: "forward" | "backward";
}

// Enhanced scan record with cursor support
interface ScanRecord {
  id: string;
  content: string;
  result: "spam" | "clean" | "suspicious";
  confidence_score: number;
  risk_score: number;
  category?: string;
  flags: string[];
  analysis_details: any;
  timestamp: string;
  cursor?: string; // Base64 encoded cursor for pagination
}

// Mock dataset
const mockScans: ScanRecord[] = Array.from({ length: 50 }).map((_, i) => ({
  id: `mock-${i + 1}`,
  content:
    i % 3 === 0
      ? "Congratulations! You've won a $1000 gift card. Click here immediately!"
      : i % 3 === 1
      ? "Your package has been shipped and will arrive today between 2-4 PM."
      : "Your account has been suspended due to suspicious activity. Verify now.",
  result: (i % 3 === 0 ? "spam" : i % 3 === 1 ? "clean" : "suspicious") as any,
  confidence_score: i % 3 === 0 ? 98.7 : i % 3 === 1 ? 95.2 : 87.5,
  risk_score: i % 3 === 0 ? 92.3 : i % 3 === 1 ? 8.1 : 65.2,
  category: i % 3 === 0 ? "scam" : i % 3 === 1 ? "delivery" : "phishing",
  flags: i % 3 === 0 ? ["Urgency language", "Monetary offers"] : [],
  analysis_details: { language: "English" },
  timestamp: new Date(Date.now() - i * 3600_000).toISOString(),
  cursor: Buffer.from(`mock-${i + 1}:${(Date.now() - i * 3600_000) / 1000}`)
    .toString("base64"),
}));

// Create a new scan record
export async function createScan(req: Request, res: Response) {
  try {
    const {
      content,
      result: scanResult,
      confidence_score,
      risk_score,
      category,
      flags,
      analysis_details,
    } = req.body;

    if (!content || !scanResult) {
      return res.status(400).json({
        success: false,
        error: "Content and result are required",
      });
    }

    if (isMockMode) {
      const mock: ScanRecord = {
        id: `mock-${Date.now()}`,
        content,
        result: scanResult,
        confidence_score: confidence_score || 90,
        risk_score: risk_score || 20,
        category,
        flags: flags || [],
        analysis_details: analysis_details || {},
        timestamp: new Date().toISOString(),
      } as any;
      return res.json({ success: true, data: mock });
    }

    const dbResult = await query(
      `INSERT INTO scan_history (content, result, confidence_score, risk_score, category, flags, analysis_details, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        content,
        scanResult,
        confidence_score || 0,
        risk_score || 0,
        category,
        JSON.stringify(flags || []),
        JSON.stringify(analysis_details || {}),
      ],
    );

    res.json({
      success: true,
      data: dbResult.rows[0],
    });
  } catch (error) {
    console.error("Create scan error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

// Get scan history with cursor-based pagination
export async function getScanHistory(req: Request, res: Response) {
  try {
    const { cursor, limit = 20, direction = "forward" } =
      (req.query as CursorPagination) || {};
    const pageSize = Math.min(parseInt(limit as any) || 20, 100);

    if (isMockMode) {
      // Simple cursor handling for mock data using index
      const all = mockScans.sort((a, b) =>
        direction === "forward"
          ? a.timestamp.localeCompare(b.timestamp)
          : b.timestamp.localeCompare(a.timestamp),
      );
      let start = 0;
      if (cursor) {
        const decoded = Buffer.from(cursor, "base64").toString("utf8");
        const id = decoded.split(":")[0];
        start = Math.max(0, all.findIndex((r) => r.id === id));
        if (direction === "forward") start += 1; // move past the cursor
      }
      const slice = all.slice(start, start + pageSize);
      const nextCursor =
        slice.length === pageSize
          ? slice[slice.length - 1].cursor ||
            Buffer.from(
              `${slice[slice.length - 1].id}:$${Date.parse(slice[slice.length - 1].timestamp) / 1000}`,
            ).toString("base64")
          : null;
      const previousCursor = start > 0 ? all[Math.max(0, start - 1)].cursor : null;
      return res.json({
        success: true,
        data: {
          records: slice,
          pagination: {
            hasNext: start + slice.length < all.length,
            hasPrevious: start > 0,
            nextCursor,
            previousCursor,
            total: slice.length,
          },
        },
      });
    }

    let sql = `
      SELECT 
        id,
        content,
        result,
        confidence_score,
        risk_score,
        category,
        flags,
        analysis_details,
        timestamp,
        encode(convert_to(id || ':' || extract(epoch from timestamp)::text, 'utf8'), 'base64') as cursor
      FROM scan_history
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (cursor) {
      try {
        const decodedCursor = Buffer.from(cursor, "base64").toString("utf8");
        const [id, timestamp] = decodedCursor.split(":");

        if (direction === "forward") {
          sql += ` WHERE (timestamp, id) > (to_timestamp($${paramIndex}), $${paramIndex + 1})`;
        } else {
          sql += ` WHERE (timestamp, id) < (to_timestamp($${paramIndex}), $${paramIndex + 1})`;
        }
        params.push(parseFloat(timestamp), id);
        paramIndex += 2;
      } catch (error) {
        console.error("Invalid cursor format:", error);
        return res.status(400).json({
          success: false,
          error: "Invalid cursor format",
        });
      }
    }

    sql += ` ORDER BY timestamp ${direction === "forward" ? "ASC" : "DESC"}, id ${direction === "forward" ? "ASC" : "DESC"}`;
    sql += ` LIMIT $${paramIndex}`;
    params.push(pageSize + 1);

    const result = await query(sql, params);
    const records = result.rows;

    const hasNext = records.length > pageSize;
    const hasPrevious = cursor !== undefined;

    const data = records.slice(0, pageSize).map((record) => ({
      ...record,
      flags:
        typeof record.flags === "string"
          ? JSON.parse(record.flags)
          : record.flags,
      analysis_details:
        typeof record.analysis_details === "string"
          ? JSON.parse(record.analysis_details)
          : record.analysis_details,
    }));

    const nextCursor = hasNext ? data[data.length - 1]?.cursor : null;
    const previousCursor = hasPrevious ? data[0]?.cursor : null;

    res.json({
      success: true,
      data: {
        records: data,
        pagination: {
          hasNext,
          hasPrevious,
          nextCursor,
          previousCursor,
          total: data.length,
        },
      },
    });
  } catch (error) {
    console.error("Get scan history error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

// Get scan by ID
export async function getScanById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (isMockMode) {
      const found = mockScans.find((r) => r.id === id);
      if (!found) {
        return res.status(404).json({ success: false, error: "Scan not found" });
      }
      return res.json({ success: true, data: found });
    }

    const result = await query("SELECT * FROM scan_history WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Scan not found",
      });
    }

    const record = result.rows[0];
    record.flags =
      typeof record.flags === "string"
        ? JSON.parse(record.flags)
        : record.flags;
    record.analysis_details =
      typeof record.analysis_details === "string"
        ? JSON.parse(record.analysis_details)
        : record.analysis_details;

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("Get scan by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

// Delete scan
export async function deleteScan(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (isMockMode) {
      return res.json({ success: true, message: "Scan deleted successfully (mock)" });
    }

    const result = await query(
      "DELETE FROM scan_history WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Scan not found",
      });
    }

    res.json({
      success: true,
      message: "Scan deleted successfully",
    });
  } catch (error) {
    console.error("Delete scan error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

// Get analytics with streaming support for large datasets
export async function getAnalytics(req: Request, res: Response) {
  try {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Transfer-Encoding", "chunked");

    if (isMockMode) {
      const total = mockScans.length;
      const spam = mockScans.filter((s) => s.result === "spam").length;
      const clean = mockScans.filter((s) => s.result === "clean").length;
      const suspicious = mockScans.filter((s) => s.result === "suspicious").length;
      const byDay = {} as Record<string, any>;
      mockScans.forEach((s) => {
        const d = s.timestamp.slice(0, 10);
        byDay[d] ||= { date: d, total: 0, spam: 0, clean: 0, suspicious: 0 };
        byDay[d].total++;
        byDay[d][s.result]++;
      });
      return res.json({
        success: true,
        data: {
          total_analyzed: total,
          spam_detected: spam,
          clean_content: clean,
          suspicious_content: suspicious,
          recent_activity: Object.values(byDay).slice(0, 7),
          threat_categories: [
            { category: "scam", count: spam, avg_risk_score: 75 },
            { category: "phishing", count: suspicious, avg_risk_score: 55 },
          ],
        },
      });
    }

    const totalResult = await query(
      "SELECT COUNT(*) as total FROM scan_history",
    );
    const spamResult = await query(
      "SELECT COUNT(*) as spam FROM scan_history WHERE result = 'spam'",
    );
    const cleanResult = await query(
      "SELECT COUNT(*) as clean FROM scan_history WHERE result = 'clean'",
    );
    const suspiciousResult = await query(
      "SELECT COUNT(*) as suspicious FROM scan_history WHERE result = 'suspicious'",
    );

    const recentActivityResult = await query(`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as total,
        COUNT(CASE WHEN result = 'spam' THEN 1 END) as spam,
        COUNT(CASE WHEN result = 'clean' THEN 1 END) as clean,
        COUNT(CASE WHEN result = 'suspicious' THEN 1 END) as suspicious
      FROM scan_history 
      WHERE timestamp >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `);

    const threatCategoriesResult = await query(`
      SELECT 
        category,
        COUNT(*) as count,
        AVG(risk_score) as avg_risk_score
      FROM scan_history 
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `);

    const analytics = {
      total_analyzed: parseInt(totalResult.rows[0].total),
      spam_detected: parseInt(spamResult.rows[0].spam),
      clean_content: parseInt(cleanResult.rows[0].clean),
      suspicious_content: parseInt(suspiciousResult.rows[0].suspicious),
      recent_activity: recentActivityResult.rows,
      threat_categories: threatCategoriesResult.rows.map((row: any) => ({
        category: row.category,
        count: parseInt(row.count),
        avg_risk_score: parseFloat(row.avg_risk_score),
      })),
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

// Analyze message with enhanced spam detection
export async function analyzeMessage(req: Request, res: Response) {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "Content is required",
      });
    }

    // Enhanced spam detection logic
    const lowerContent = content.toLowerCase();
    let spamScore = 0;
    let riskScore = 0;
    const flags: string[] = [];
    const suspiciousPatterns: string[] = [];

    const urgencyPatterns = [
      "urgent",
      "immediately",
      "now",
      "hurry",
      "limited time",
      "expires soon",
    ];
    urgencyPatterns.forEach((pattern) => {
      if (lowerContent.includes(pattern)) {
        spamScore += 15;
        riskScore += 20;
        flags.push("Urgency language");
        suspiciousPatterns.push("Urgency");
      }
    });

    const monetaryPatterns = [
      "win",
      "won",
      "prize",
      "gift card",
      "cash",
      "money",
      "free",
      "million",
      "thousand",
    ];
    monetaryPatterns.forEach((pattern) => {
      if (lowerContent.includes(pattern)) {
        spamScore += 20;
        riskScore += 25;
        flags.push("Monetary offers");
        suspiciousPatterns.push("Monetary offers");
      }
    });

    const suspiciousActions = [
      "click here",
      "verify",
      "confirm",
      "update",
      "claim",
      "download",
    ];
    suspiciousActions.forEach((pattern) => {
      if (lowerContent.includes(pattern)) {
        spamScore += 18;
        riskScore += 22;
        flags.push("Suspicious actions");
        suspiciousPatterns.push("Suspicious actions");
      }
    });

    let result: "spam" | "clean" | "suspicious" = "clean";
    if (spamScore >= 50) result = "spam";
    else if (spamScore >= 20) result = "suspicious";

    const confidence_score = Math.max(20, Math.min(100, 100 - Math.abs(spamScore - 50)));
    const finalRiskScore = Math.min(100, Math.max(10, riskScore));

    if (isMockMode) {
      return res.json({
        success: true,
        data: {
          id: `mock-${Date.now()}`,
          content,
          result,
          confidence_score,
          risk_score: finalRiskScore,
          flags: [...new Set(flags)],
          analysis_details: {
            language: "English",
            sentiment: result === "spam" ? "negative" : "neutral",
            urgency_level: spamScore >= 40 ? "high" : spamScore >= 20 ? "medium" : "low",
            suspicious_patterns: [...new Set(suspiciousPatterns)],
            user_behavior_score: result === "spam" ? Math.random() * 30 + 20 : Math.random() * 20 + 80,
            content_quality_score: result === "spam" ? Math.random() * 30 + 25 : Math.random() * 20 + 80,
          },
          timestamp: new Date().toISOString(),
        },
      });
    }

    const dbResult = await query(
      `INSERT INTO scan_history (content, result, confidence_score, risk_score, flags, analysis_details, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [
        content,
        result,
        confidence_score,
        finalRiskScore,
        JSON.stringify([...new Set(flags)]),
        JSON.stringify({
          language: "English",
          sentiment: result === "spam" ? "negative" : "neutral",
          urgency_level: spamScore >= 40 ? "high" : spamScore >= 20 ? "medium" : "low",
          suspicious_patterns: [...new Set(suspiciousPatterns)],
          user_behavior_score: result === "spam" ? Math.random() * 30 + 20 : Math.random() * 20 + 80,
          content_quality_score: result === "spam" ? Math.random() * 30 + 25 : Math.random() * 20 + 80,
        }),
      ],
    );

    res.json({
      success: true,
      data: {
        id: dbResult.rows[0].id,
        content,
        result,
        confidence_score,
        risk_score: finalRiskScore,
        flags: [...new Set(flags)],
        analysis_details: {
          language: "English",
          sentiment: result === "spam" ? "negative" : "neutral",
          urgency_level: spamScore >= 40 ? "high" : spamScore >= 20 ? "medium" : "low",
          suspicious_patterns: [...new Set(suspiciousPatterns)],
          user_behavior_score: result === "spam" ? Math.random() * 30 + 20 : Math.random() * 20 + 80,
          content_quality_score: result === "spam" ? Math.random() * 30 + 25 : Math.random() * 20 + 80,
        },
        timestamp: dbResult.rows[0].timestamp,
      },
    });
  } catch (error) {
    console.error("Analyze message error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
