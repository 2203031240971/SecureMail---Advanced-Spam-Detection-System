# 🗄️ Database Setup for SecureMail

This guide will help you connect SecureMail to a PostgreSQL database for storing real scan data, user settings, and analytics.

## 🚀 Quick Start Options

### Option 1: Supabase (Recommended)
1. **[Open MCP popover](#open-mcp-popover)** and connect to Supabase
2. Create a new project in Supabase
3. Copy your database URL from Settings > Database
4. Add to your environment variables

### Option 2: Neon (Serverless PostgreSQL)
1. **[Open MCP popover](#open-mcp-popover)** and connect to Neon
2. Create a new project in Neon
3. Copy your connection string
4. Add to your environment variables

### Option 3: Prisma Postgres
1. **[Open MCP popover](#open-mcp-popover)** and connect to Prisma
2. Set up your Prisma schema
3. Configure your database connection
4. Add to your environment variables

## 📁 Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Copy `.env.example` to `.env` and update with your database URL:
```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://username:password@hostname:port/database
```

### 3. Create Database Schema
Run the SQL commands from `database/schema.sql` in your database:

**For Supabase:**
1. Go to SQL Editor in Supabase dashboard
2. Copy and run the content of `database/schema.sql`

**For other providers:**
1. Connect to your database using psql or a GUI tool
2. Run the SQL commands from `database/schema.sql`

### 4. Start the Application
```bash
npm run dev
```

The app will automatically connect to your database and you can start storing real data!

## 🔧 Database Schema

The database includes these main tables:

- **`users`** - User accounts and profiles
- **`scan_history`** - All email/SMS scan results
- **`user_settings`** - User preferences and configurations
- **`api_keys`** - API access keys
- **`analytics_daily`** - Aggregated daily analytics
- **`threat_patterns`** - ML patterns for threat detection

## 📊 Features Enabled

With database connection, you get:

✅ **Real Scan Storage** - All analyses saved to database
✅ **Persistent History** - View all past scans with filtering
✅ **Live Analytics** - Real metrics from your actual data
✅ **User Settings** - Configurations saved to database
✅ **API Access** - RESTful API for integrations
✅ **Data Export** - Export your scan history
✅ **Performance Tracking** - Monitor detection accuracy

## 🔑 API Endpoints

Once connected, these endpoints are available:

- `POST /api/analyze` - Analyze and store message
- `GET /api/scans` - Get scan history with filters
- `GET /api/scans/:id` - Get specific scan details
- `DELETE /api/scans/:id` - Delete scan record
- `GET /api/analytics` - Get analytics summary
- `GET /api/health` - Check database connection

## 🛠️ Troubleshooting

### Connection Issues
1. Check your `DATABASE_URL` format
2. Ensure database allows connections from your IP
3. Verify credentials are correct
4. Check database is running

### Permission Issues
1. Ensure user has CREATE, INSERT, SELECT, UPDATE, DELETE permissions
2. For Supabase, check RLS policies are set correctly

### Schema Issues
1. Make sure all tables are created successfully
2. Check for any SQL errors during schema creation
3. Verify indexes are created for performance

## 🔒 Security Notes

- Never commit `.env` file to version control
- Use strong passwords for database access
- Enable SSL in production
- Set up proper Row Level Security (RLS) policies
- Regularly backup your data

## 📞 Need Help?

If you need assistance:
1. Check the database connection with `GET /api/health`
2. Review server logs for connection errors
3. **[Open MCP popover](#open-mcp-popover)** for database-specific help
4. Check your database provider's documentation

---

**Ready to connect?** **[Open MCP popover](#open-mcp-popover)** to get started with Supabase, Neon, or Prisma!
