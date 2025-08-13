-- Add missing gemini_api_key column to site_settings table
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS gemini_api_key TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN site_settings.gemini_api_key IS 'API key for Google Gemini AI models';
