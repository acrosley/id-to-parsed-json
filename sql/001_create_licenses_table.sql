-- Create licenses table for storing parsed driver's license data
-- This table stores both raw barcode data and parsed JSON from AAMVA format

CREATE TABLE IF NOT EXISTS licenses (
    id BIGSERIAL PRIMARY KEY,
    file_key TEXT,
    mime_type TEXT NOT NULL,
    source TEXT NOT NULL,
    payload_raw TEXT,
    parsed_json JSONB NOT NULL,
    confidence NUMERIC(3,2) DEFAULT 0.98 CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_licenses_created_at ON licenses(created_at);
CREATE INDEX IF NOT EXISTS idx_licenses_source ON licenses(source);
CREATE INDEX IF NOT EXISTS idx_licenses_confidence ON licenses(confidence);

-- Create GIN index for JSONB queries on parsed_json
CREATE INDEX IF NOT EXISTS idx_licenses_parsed_json ON licenses USING GIN(parsed_json);

-- Add comments for documentation
COMMENT ON TABLE licenses IS 'Stores parsed driver license data from PDF417 barcodes';
COMMENT ON COLUMN licenses.id IS 'Primary key, auto-incrementing';
COMMENT ON COLUMN licenses.file_key IS 'Optional file storage key for uploaded image';
COMMENT ON COLUMN licenses.mime_type IS 'MIME type of uploaded image (e.g., image/jpeg)';
COMMENT ON COLUMN licenses.source IS 'Source of data (pdf417, ocr+llm, etc.)';
COMMENT ON COLUMN licenses.payload_raw IS 'Raw barcode payload text';
COMMENT ON COLUMN licenses.parsed_json IS 'Structured JSON data from AAMVA parsing';
COMMENT ON COLUMN licenses.confidence IS 'Confidence score (0.0 to 1.0)';
COMMENT ON COLUMN licenses.created_at IS 'Timestamp when record was created';
