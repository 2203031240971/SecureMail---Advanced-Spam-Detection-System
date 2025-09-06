import { query, transaction } from '../db/connection';
import { v4 as uuidv4 } from 'uuid';

export interface ScanRecord {
  id?: string;
  user_id: string;
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
  ip_address?: string;
  user_agent?: string;
  created_at?: Date;
}

export interface ScanFilters {
  user_id: string;
  message_type?: 'email' | 'sms';
  result?: 'spam' | 'clean' | 'suspicious';
  start_date?: Date;
  end_date?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

export class ScanHistoryService {
  // Create a new scan record
  static async createScan(scanData: ScanRecord): Promise<ScanRecord> {
    const id = uuidv4();
    
    const result = await query(`
      INSERT INTO scan_history (
        id, user_id, content, message_type, sender, subject, phone_number,
        result, confidence_score, risk_score, category, flags, analysis_details,
        ip_address, user_agent
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING *
    `, [
      id,
      scanData.user_id,
      scanData.content,
      scanData.message_type,
      scanData.sender,
      scanData.subject,
      scanData.phone_number,
      scanData.result,
      scanData.confidence_score,
      scanData.risk_score,
      scanData.category,
      scanData.flags || [],
      JSON.stringify(scanData.analysis_details || {}),
      scanData.ip_address,
      scanData.user_agent
    ]);

    return result.rows[0];
  }

  // Get scan history with filters
  static async getScanHistory(filters: ScanFilters): Promise<{scans: ScanRecord[], total: number}> {
    let whereClause = 'WHERE user_id = $1';
    let params: any[] = [filters.user_id];
    let paramCount = 1;

    if (filters.message_type) {
      paramCount++;
      whereClause += ` AND message_type = $${paramCount}`;
      params.push(filters.message_type);
    }

    if (filters.result) {
      paramCount++;
      whereClause += ` AND result = $${paramCount}`;
      params.push(filters.result);
    }

    if (filters.start_date) {
      paramCount++;
      whereClause += ` AND created_at >= $${paramCount}`;
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      paramCount++;
      whereClause += ` AND created_at <= $${paramCount}`;
      params.push(filters.end_date);
    }

    if (filters.search) {
      paramCount++;
      whereClause += ` AND (content ILIKE $${paramCount} OR sender ILIKE $${paramCount} OR subject ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
    }

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total FROM scan_history ${whereClause}
    `, params);

    // Get paginated results
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    
    paramCount++;
    const limitClause = ` ORDER BY created_at DESC LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    const offsetClause = ` OFFSET $${paramCount}`;
    params.push(offset);

    const scansResult = await query(`
      SELECT * FROM scan_history ${whereClause} ${limitClause} ${offsetClause}
    `, params);

    return {
      scans: scansResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
  }

  // Get scan by ID
  static async getScanById(scanId: string, userId: string): Promise<ScanRecord | null> {
    const result = await query(`
      SELECT * FROM scan_history WHERE id = $1 AND user_id = $2
    `, [scanId, userId]);

    return result.rows[0] || null;
  }

  // Delete scan
  static async deleteScan(scanId: string, userId: string): Promise<boolean> {
    const result = await query(`
      DELETE FROM scan_history WHERE id = $1 AND user_id = $2
    `, [scanId, userId]);

    return result.rowCount > 0;
  }

  // Get analytics summary
  static async getAnalyticsSummary(userId: string, days: number = 7): Promise<any> {
    const result = await query(`
      SELECT 
        COUNT(*) as total_scans,
        COUNT(*) FILTER (WHERE result = 'spam') as spam_detected,
        COUNT(*) FILTER (WHERE result = 'clean') as clean_messages,
        COUNT(*) FILTER (WHERE result = 'suspicious') as suspicious_messages,
        COUNT(*) FILTER (WHERE message_type = 'email') as email_scans,
        COUNT(*) FILTER (WHERE message_type = 'sms') as sms_scans,
        AVG(confidence_score) as avg_confidence,
        AVG(risk_score) as avg_risk_score
      FROM scan_history 
      WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${days} days'
    `, [userId]);

    return result.rows[0];
  }

  // Get threat categories breakdown
  static async getThreatCategories(userId: string, days: number = 30): Promise<any[]> {
    const result = await query(`
      SELECT 
        category,
        COUNT(*) as count,
        AVG(confidence_score) as avg_confidence
      FROM scan_history 
      WHERE user_id = $1 
        AND result IN ('spam', 'suspicious')
        AND category IS NOT NULL
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `, [userId]);

    return result.rows;
  }

  // Get daily activity for charts
  static async getDailyActivity(userId: string, days: number = 7): Promise<any[]> {
    const result = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE result = 'spam') as spam,
        COUNT(*) FILTER (WHERE result = 'clean') as clean,
        COUNT(*) FILTER (WHERE result = 'suspicious') as suspicious
      FROM scan_history 
      WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [userId]);

    return result.rows;
  }
}
