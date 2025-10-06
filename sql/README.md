# Database Schema

This directory contains the database schema and setup scripts for the id-to-parsed-json project.

## Files

- `001_create_licenses_table.sql` - Main database schema for the licenses table
- `README.md` - This documentation file

## Database Setup

### Prerequisites

1. **Vercel Postgres Database**: You need a Vercel Postgres database configured
2. **Environment Variables**: Set up your database connection string

### Environment Variables

Create a `.env.local` file with your database connection:

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

### Running the Setup

```bash
# Install dependencies (if not already done)
npm install

# Set up the database schema
npm run db:setup
```

This will:
- Create the `licenses` table
- Set up all necessary indexes
- Test the database connection
- Insert and clean up a test record

## Table Schema

### `licenses` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key, auto-incrementing |
| `file_key` | TEXT | Optional file storage key for uploaded image |
| `mime_type` | TEXT | MIME type of uploaded image (e.g., image/jpeg) |
| `source` | TEXT | Source of data (pdf417, ocr+llm, etc.) |
| `payload_raw` | TEXT | Raw barcode payload text |
| `parsed_json` | JSONB | Structured JSON data from AAMVA parsing |
| `confidence` | NUMERIC(3,2) | Confidence score (0.0 to 1.0) |
| `created_at` | TIMESTAMPTZ | Timestamp when record was created |

### Indexes

- `idx_licenses_created_at` - For time-based queries
- `idx_licenses_source` - For filtering by data source
- `idx_licenses_confidence` - For confidence-based queries
- `idx_licenses_parsed_json` - GIN index for JSONB queries

## Usage in Code

The table is used in `app/api/parse-license/route.ts`:

```typescript
const inserted = await sql<{id: number}>`
  INSERT INTO licenses (file_key, mime_type, source, payload_raw, parsed_json, confidence)
  VALUES (${null}, ${file.type}, ${record.rawSource}, ${record.rawText ?? ""}, ${JSON.stringify(record)}::jsonb, ${record.confidence})
  RETURNING id;
`;
```

## Troubleshooting

### Common Issues

1. **Connection Error**: Make sure your `POSTGRES_URL` is correct
2. **Permission Error**: Ensure your database user has CREATE TABLE permissions
3. **Table Already Exists**: The script uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times

### Testing the Setup

After running `npm run db:setup`, you should see:
- ✅ Database schema created successfully!
- 📋 Created table: licenses
- 📊 Created indexes for performance
- 🧪 Testing database operations...
- ✅ Test record inserted with ID: [number]
- 🧹 Test record cleaned up
- 🎉 Database setup complete!
