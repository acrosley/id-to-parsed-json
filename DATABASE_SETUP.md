# Database Setup Guide

This guide will help you set up the PostgreSQL database for the id-to-parsed-json project.

## 🚀 Quick Start

1. **Set up Vercel Postgres database**
2. **Configure environment variables**
3. **Run database setup script**

## 📋 Prerequisites

### 1. Vercel Postgres Database

You need a Vercel Postgres database. You can create one by:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project
3. Go to the "Storage" tab
4. Click "Create Database" → "Postgres"
5. Choose a plan and create the database

### 2. Environment Variables

Create a `.env.local` file in your project root:

```bash
# Copy from env.template
cp env.template .env.local
```

Then edit `.env.local` with your actual database credentials:

```bash
# Vercel Postgres connection string
POSTGRES_URL="postgres://username:password@host:port/database"
POSTGRES_PRISMA_URL="postgres://username:password@host:port/database?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://username:password@host:port/database"
POSTGRES_USER="username"
POSTGRES_HOST="host"
POSTGRES_PASSWORD="password"
POSTGRES_DATABASE="database"
```

## 🛠️ Database Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Database Schema

```bash
npm run db:setup
```

This will:
- ✅ Create the `licenses` table
- 📊 Set up performance indexes
- 🧪 Test database operations
- 🎉 Confirm successful setup

### Step 3: Test Database Connection

```bash
npm run db:test
```

This will verify:
- 🔌 Database connection works
- 📋 Table structure is correct
- ➕ Insert/delete operations work
- 🧹 Clean up test data

## 📊 Database Schema

### `licenses` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key, auto-incrementing |
| `file_key` | TEXT | Optional file storage key |
| `mime_type` | TEXT | MIME type (e.g., image/jpeg) |
| `source` | TEXT | Data source (pdf417, ocr+llm) |
| `payload_raw` | TEXT | Raw barcode payload |
| `parsed_json` | JSONB | Structured AAMVA data |
| `confidence` | NUMERIC(3,2) | Confidence score (0.0-1.0) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### Indexes

- `idx_licenses_created_at` - Time-based queries
- `idx_licenses_source` - Source filtering
- `idx_licenses_confidence` - Confidence filtering
- `idx_licenses_parsed_json` - JSONB queries (GIN index)

## 🔧 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Setup | `npm run db:setup` | Create database schema |
| Test | `npm run db:test` | Test database connection |
| Reset | `npm run db:reset` | Recreate schema (safe to run multiple times) |

## 🐛 Troubleshooting

### Common Issues

#### 1. Connection Error
```
❌ Database setup failed: connect ECONNREFUSED
```

**Solution**: Check your `POSTGRES_URL` in `.env.local`

#### 2. Permission Error
```
❌ Database setup failed: permission denied for table licenses
```

**Solution**: Ensure your database user has CREATE TABLE permissions

#### 3. Table Already Exists
```
✅ Database schema created successfully!
```

**This is normal** - the script uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times.

### Environment Variables

Make sure these are set in `.env.local`:

```bash
# Required
POSTGRES_URL="postgres://..."

# Optional (for Prisma compatibility)
POSTGRES_PRISMA_URL="postgres://...?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="username"
POSTGRES_HOST="host"
POSTGRES_PASSWORD="password"
POSTGRES_DATABASE="database"
```

## 📝 Usage in Code

The database is used in the API route:

```typescript
// app/api/parse-license/route.ts
const inserted = await sql<{id: number}>`
  INSERT INTO licenses (file_key, mime_type, source, payload_raw, parsed_json, confidence)
  VALUES (${null}, ${file.type}, ${record.rawSource}, ${record.rawText ?? ""}, ${JSON.stringify(record)}::jsonb, ${record.confidence})
  RETURNING id;
`;
```

## 🎯 Next Steps

After successful database setup:

1. **Test the API endpoint** with a license image
2. **Build the frontend interface** for uploading
3. **Deploy to Vercel** when ready

## 📚 Additional Resources

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
