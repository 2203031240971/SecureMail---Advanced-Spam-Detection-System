import { Pool, PoolClient } from 'pg';

// Detect mock mode
const isMockMode = process.env.USE_MOCK_DATA === 'true' || !process.env.DATABASE_URL;

// Database configuration - these should be set in environment variables
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool (only when not in mock mode)
export const pool = isMockMode ? (null as any) : new Pool(dbConfig);

// Test database connection
export async function testConnection() {
  if (isMockMode) {
    console.log('ℹ️ Mock mode enabled: skipping database connection test');
    return false;
  }
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected successfully at:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Helper function to execute queries
export async function query(text: string, params?: any[]): Promise<any> {
  if (isMockMode) {
    throw new Error('Database disabled: running in mock mode (USE_MOCK_DATA=true)');
  }
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Helper function for transactions
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  if (isMockMode) {
    throw new Error('Transactions unsupported in mock mode');
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Graceful shutdown
if (!isMockMode) {
  process.on('SIGINT', () => {
    console.log('Shutting down database pool...');
    pool.end(() => {
      console.log('Database pool has ended');
      process.exit(0);
    });
  });
}

export default pool;
