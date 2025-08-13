-- Add more customization fields to site_settings table
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS favicon_url TEXT,
ADD COLUMN IF NOT EXISTS welcome_message TEXT DEFAULT 'Welcome to our AI Assistant',
ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT 'Powered by AI Technology',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#10b981',
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS enable_dark_mode BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS max_message_length INTEGER DEFAULT 4000,
ADD COLUMN IF NOT EXISTS enable_guest_access BOOLEAN DEFAULT true;

-- Update existing records with default values
UPDATE site_settings 
SET 
  welcome_message = COALESCE(welcome_message, 'Welcome to our AI Assistant'),
  footer_text = COALESCE(footer_text, 'Powered by AI Technology'),
  accent_color = COALESCE(accent_color, '#10b981'),
  font_family = COALESCE(font_family, 'Inter'),
  enable_dark_mode = COALESCE(enable_dark_mode, true),
  max_message_length = COALESCE(max_message_length, 4000),
  enable_guest_access = COALESCE(enable_guest_access, true)
WHERE id IS NOT NULL;
