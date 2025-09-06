-- PostgreSQL Schema for Spam Email Project
-- This schema supports cursor-based pagination and efficient querying

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Scan History Table
CREATE TABLE IF NOT EXISTS scan_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    result VARCHAR(20) NOT NULL CHECK (result IN ('spam', 'clean', 'suspicious')),
    confidence_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    risk_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    category VARCHAR(100),
    flags JSONB DEFAULT '[]',
    analysis_details JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Media Analysis Table
CREATE TABLE IF NOT EXISTS social_media_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    result VARCHAR(20) NOT NULL CHECK (result IN ('spam', 'clean', 'suspicious')),
    confidence_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    risk_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    category VARCHAR(100),
    flags JSONB DEFAULT '[]',
    analysis_details JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table (for future authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient cursor-based pagination
-- Composite index for timestamp + id ordering (most common pagination pattern)
CREATE INDEX IF NOT EXISTS idx_scan_history_timestamp_id 
ON scan_history (timestamp, id);

-- Index for result-based filtering
CREATE INDEX IF NOT EXISTS idx_scan_history_result 
ON scan_history (result);

-- Index for category-based filtering
CREATE INDEX IF NOT EXISTS idx_scan_history_category 
ON scan_history (category);

-- Index for user-based filtering
CREATE INDEX IF NOT EXISTS idx_scan_history_user_id 
ON scan_history (user_id);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_scan_history_created_at 
ON scan_history (created_at);

-- Indexes for social media analysis
CREATE INDEX IF NOT EXISTS idx_social_media_analysis_timestamp_id 
ON social_media_analysis (timestamp, id);

CREATE INDEX IF NOT EXISTS idx_social_media_analysis_platform 
ON social_media_analysis (platform);

CREATE INDEX IF NOT EXISTS idx_social_media_analysis_result 
ON social_media_analysis (result);

CREATE INDEX IF NOT EXISTS idx_social_media_analysis_user_id 
ON social_media_analysis (user_id);

-- Indexes for users and sessions
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users (email);

CREATE INDEX IF NOT EXISTS idx_sessions_token 
ON sessions (token);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id 
ON sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at 
ON sessions (expires_at);

-- Full-text search indexes for content analysis
CREATE INDEX IF NOT EXISTS idx_scan_history_content_gin 
ON scan_history USING GIN (to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_social_media_analysis_content_gin 
ON social_media_analysis USING GIN (to_tsvector('english', content));

-- JSONB indexes for efficient querying of flags and analysis_details
CREATE INDEX IF NOT EXISTS idx_scan_history_flags_gin 
ON scan_history USING GIN (flags);

CREATE INDEX IF NOT EXISTS idx_scan_history_analysis_details_gin 
ON scan_history USING GIN (analysis_details);

CREATE INDEX IF NOT EXISTS idx_social_media_analysis_flags_gin 
ON social_media_analysis USING GIN (flags);

CREATE INDEX IF NOT EXISTS idx_social_media_analysis_analysis_details_gin 
ON social_media_analysis USING GIN (analysis_details);

-- Partitioning for large datasets (optional - uncomment if needed)
-- CREATE TABLE scan_history_2024 PARTITION OF scan_history
-- FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Views for common analytics queries
CREATE OR REPLACE VIEW scan_analytics_summary AS
SELECT 
    COUNT(*) as total_scans,
    COUNT(CASE WHEN result = 'spam' THEN 1 END) as spam_count,
    COUNT(CASE WHEN result = 'clean' THEN 1 END) as clean_count,
    COUNT(CASE WHEN result = 'suspicious' THEN 1 END) as suspicious_count,
    AVG(confidence_score) as avg_confidence,
    AVG(risk_score) as avg_risk_score,
    DATE(created_at) as scan_date
FROM scan_history
GROUP BY DATE(created_at)
ORDER BY scan_date DESC;

CREATE OR REPLACE VIEW threat_categories_summary AS
SELECT 
    category,
    COUNT(*) as count,
    AVG(confidence_score) as avg_confidence,
    AVG(risk_score) as avg_risk_score,
    COUNT(CASE WHEN result = 'spam' THEN 1 END) as spam_count
FROM scan_history
WHERE category IS NOT NULL
GROUP BY category
ORDER BY count DESC;

-- Functions for cursor-based pagination
CREATE OR REPLACE FUNCTION encode_cursor(id UUID, timestamp TIMESTAMP WITH TIME ZONE)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(convert_to(id::text || ':' || extract(epoch from timestamp)::text, 'utf8'), 'base64');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION decode_cursor(cursor TEXT)
RETURNS TABLE(id UUID, timestamp TIMESTAMP WITH TIME ZONE) AS $$
DECLARE
    decoded_text TEXT;
    parts TEXT[];
BEGIN
    decoded_text := convert_from(decode(cursor, 'base64'), 'utf8');
    parts := string_to_array(decoded_text, ':');
    
    RETURN QUERY SELECT 
        parts[1]::UUID,
        to_timestamp(parts[2]::DOUBLE PRECISION);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get paginated scan history
CREATE OR REPLACE FUNCTION get_scan_history_paginated(
    p_cursor TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_direction TEXT DEFAULT 'forward'
)
RETURNS TABLE(
    id UUID,
    content TEXT,
    result VARCHAR(20),
    confidence_score DECIMAL(5,2),
    risk_score DECIMAL(5,2),
    category VARCHAR(100),
    flags JSONB,
    analysis_details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE,
    cursor TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sh.id,
        sh.content,
        sh.result,
        sh.confidence_score,
        sh.risk_score,
        sh.category,
        sh.flags,
        sh.analysis_details,
        sh.timestamp,
        encode_cursor(sh.id, sh.timestamp) as cursor
    FROM scan_history sh
    WHERE 
        CASE 
            WHEN p_cursor IS NOT NULL THEN
                CASE 
                    WHEN p_direction = 'forward' THEN
                        (sh.timestamp, sh.id) > (SELECT timestamp, id FROM decode_cursor(p_cursor))
                    ELSE
                        (sh.timestamp, sh.id) < (SELECT timestamp, id FROM decode_cursor(p_cursor))
                END
            ELSE TRUE
        END
    ORDER BY 
        CASE WHEN p_direction = 'forward' THEN sh.timestamp END ASC,
        CASE WHEN p_direction = 'forward' THEN sh.id END ASC,
        CASE WHEN p_direction = 'backward' THEN sh.timestamp END DESC,
        CASE WHEN p_direction = 'backward' THEN sh.id END DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
INSERT INTO scan_history (content, result, confidence_score, risk_score, category, flags, analysis_details) VALUES
('Your package has been shipped and will arrive today between 2-4 PM.', 'clean', 95.2, 8.1, 'delivery', '[]', '{"language": "English", "sentiment": "neutral", "urgency_level": "low"}'),
('Congratulations! You''ve won a $1000 gift card. Click here immediately!', 'spam', 98.7, 92.3, 'scam', '["Urgency language", "Monetary offers"]', '{"language": "English", "sentiment": "negative", "urgency_level": "high"}'),
('Your account has been suspended due to suspicious activity. Click here to verify your identity immediately.', 'suspicious', 87.5, 65.2, 'phishing', '["Account security concerns"]', '{"language": "English", "sentiment": "negative", "urgency_level": "medium"}')
ON CONFLICT DO NOTHING;
