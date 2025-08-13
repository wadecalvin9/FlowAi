-- Add support for OpenAI and Anthropic API keys in site_settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS openai_api_key TEXT,
ADD COLUMN IF NOT EXISTS anthropic_api_key TEXT;

-- Update ai_models table to support different providers with their specific model IDs
-- The existing structure already supports this with provider and model_id columns

-- Insert popular OpenAI models
INSERT INTO ai_models (id, provider, name, model_id, is_active, supports_images, supports_generation, api_key) VALUES
(gen_random_uuid(), 'openai', 'GPT-4o', 'gpt-4o', true, true, true, ''),
(gen_random_uuid(), 'openai', 'GPT-4o Mini', 'gpt-4o-mini', true, true, true, ''),
(gen_random_uuid(), 'openai', 'GPT-4 Turbo', 'gpt-4-turbo', true, true, true, ''),
(gen_random_uuid(), 'openai', 'GPT-3.5 Turbo', 'gpt-3.5-turbo', true, false, true, '');

-- Insert popular Anthropic models
INSERT INTO ai_models (id, provider, name, model_id, is_active, supports_images, supports_generation, api_key) VALUES
(gen_random_uuid(), 'anthropic', 'Claude 3.5 Sonnet', 'claude-3-5-sonnet-20241022', true, true, true, ''),
(gen_random_uuid(), 'anthropic', 'Claude 3.5 Haiku', 'claude-3-5-haiku-20241022', true, true, true, ''),
(gen_random_uuid(), 'anthropic', 'Claude 3 Opus', 'claude-3-opus-20240229', true, true, true, ''),
(gen_random_uuid(), 'anthropic', 'Claude 3 Sonnet', 'claude-3-sonnet-20240229', true, true, true, ''),
(gen_random_uuid(), 'anthropic', 'Claude 3 Haiku', 'claude-3-haiku-20240307', true, true, true, '');
