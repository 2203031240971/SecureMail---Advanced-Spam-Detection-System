# 🚀 Vercel Deployment Guide for Spam Email Project

This guide provides step-by-step instructions to deploy your Spam Email Project on Vercel with PostgreSQL integration, cursor-based pagination, and efficient data streaming.

## 📋 Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [PostgreSQL Database](https://supabase.com/ or [Neon](https://neon.tech/) or [Railway](https://railway.app/))
- [Git Repository](https://github.com/) with your project
- [Node.js](https://nodejs.org/) (v18 or higher)

## 🗄️ Step 1: Set Up PostgreSQL Database

### Option A: Supabase (Recommended)
1. Go to [Supabase](https://supabase.com/) and create a new project
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database/schema.sql`
4. Execute the SQL to create tables, indexes, and functions
5. Go to **Settings > Database** to get your connection string

### Option B: Neon
1. Go to [Neon](https://neon.tech/) and create a new project
2. Use the SQL Editor to run the schema from `database/schema.sql`
3. Copy your connection string from the dashboard

### Option C: Railway
1. Go to [Railway](https://railway.app/) and create a new project
2. Add a PostgreSQL service
3. Use the SQL Editor to run the schema from `database/schema.sql`
4. Copy your connection string

## 🔧 Step 2: Prepare Your Project for Deployment

### 2.1 Update Package.json Scripts
Your `package.json` already has the correct scripts:
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "vite build --config vite.config.server.ts",
    "start": "node dist/server/node-build.mjs"
  }
}
```

### 2.2 Verify Vercel Configuration
The `vercel.json` file is already configured for your project:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server/node-build.mjs",
      "use": "@vercel/node"
    },
    {
      "src": "dist/spa/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "dist/server/node-build.mjs"
    },
    {
      "src": "/(.*)",
      "dest": "dist/spa/$1"
    }
  ]
}
```

## 🌐 Step 3: Deploy to Vercel

### 3.1 Connect Your Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your Git repository
4. Select the repository containing your Spam Email Project

### 3.2 Configure Environment Variables
In the Vercel project settings, add these environment variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Application Configuration
NODE_ENV=production
PORT=3000

# Optional: JWT Secret for authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Optional: CORS Origins
CORS_ORIGIN=https://your-domain.vercel.app
```

**Important Notes:**
- Replace `DATABASE_URL` with your actual PostgreSQL connection string
- The connection string should include SSL parameters for production
- Use a strong, unique JWT_SECRET for production

### 3.3 Configure Build Settings
Set the following build settings in Vercel:

- **Framework Preset**: `Other`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.4 Deploy
1. Click **"Deploy"**
2. Vercel will automatically build and deploy your application
3. Monitor the build logs for any errors

## 🔍 Step 4: Verify Deployment

### 4.1 Check API Endpoints
Test your API endpoints using the live URL:

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Test spam analysis
curl -X POST https://your-app.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"content": "URGENT: You have won a prize! Click here now!"}'

# Test scan history with cursor pagination
curl https://your-app.vercel.app/api/scans?limit=10
```

### 4.2 Test Cursor-Based Pagination
The application now supports efficient cursor-based pagination:

```bash
# Get first page
curl "https://your-app.vercel.app/api/scans?limit=20"

# Get next page using cursor
curl "https://your-app.vercel.app/api/scans?limit=20&cursor=YOUR_CURSOR_HERE"

# Get previous page
curl "https://your-app.vercel.app/api/scans?limit=20&cursor=YOUR_CURSOR_HERE&direction=backward"
```

### 4.3 Test Social Media Analyzer
```bash
# Test social media analysis
curl -X POST https://your-app.vercel.app/api/social-media/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Check out this amazing deal! Limited time only! 🎉",
    "platforms": ["instagram", "facebook"]
  }'
```

## 📊 Step 5: Monitor and Optimize

### 5.1 Database Performance
Monitor your PostgreSQL database performance:

```sql
-- Check query performance
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 5.2 Vercel Analytics
- Monitor function execution times in Vercel dashboard
- Check for any cold start issues
- Monitor API response times

### 5.3 Cursor Pagination Benefits
Your application now efficiently handles large datasets:

- **Memory Efficient**: Only loads requested records
- **Fast Navigation**: Direct cursor-based navigation
- **Consistent Performance**: No offset-based slowdown
- **Real-time Data**: Handles concurrent updates gracefully

## 🔒 Step 6: Security Considerations

### 6.1 Environment Variables
- Never commit sensitive data to your repository
- Use Vercel's environment variable encryption
- Rotate database credentials regularly

### 6.2 Database Security
```sql
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE your_database TO analytics_user;
GRANT USAGE ON SCHEMA public TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;
```

### 6.3 API Security
- Implement rate limiting for API endpoints
- Add authentication for sensitive operations
- Use HTTPS for all communications

## 🚀 Step 7: Access Your Live Application

Once deployment is complete:

1. **Frontend URL**: `https://your-app.vercel.app`
2. **API Base URL**: `https://your-app.vercel.app/api`
3. **Health Check**: `https://your-app.vercel.app/api/health`

## 📈 Step 8: Scaling Considerations

### 8.1 Database Scaling
For high-traffic applications:

```sql
-- Partition tables by date for better performance
CREATE TABLE scan_history_2024 PARTITION OF scan_history
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Add more partitions as needed
CREATE TABLE scan_history_2025 PARTITION OF scan_history
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### 8.2 Connection Pooling
Your application uses connection pooling for efficient database connections:

```typescript
// Already configured in server/db/connection.ts
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
```

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in `package.json`
   - Check for TypeScript compilation errors

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Check SSL configuration
   - Ensure database is accessible from Vercel's IP ranges

3. **API Errors**
   - Check Vercel function logs
   - Verify environment variables are set
   - Test database connectivity

4. **Performance Issues**
   - Monitor database query performance
   - Check for missing indexes
   - Optimize cursor-based pagination queries

### Debug Commands

```bash
# Check build locally
npm run build

# Test database connection
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(res => console.log(res.rows[0])).catch(console.error);
"

# Test API endpoints locally
npm run dev
curl http://localhost:8080/api/health
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Cursor-Based Pagination Guide](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 🎉 Congratulations!

Your Spam Email Project is now successfully deployed on Vercel with:
- ✅ PostgreSQL database integration
- ✅ Cursor-based pagination for efficient data handling
- ✅ Social Media Analyzer functionality
- ✅ Production-ready security configurations
- ✅ Scalable architecture for large datasets

Your application is now live and ready to handle spam email and message analysis at scale!
