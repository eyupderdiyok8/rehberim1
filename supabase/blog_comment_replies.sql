-- Add admin reply support to blog_comments
-- Run in Supabase SQL Editor

ALTER TABLE blog_comments ADD COLUMN IF NOT EXISTS reply_body text;
ALTER TABLE blog_comments ADD COLUMN IF NOT EXISTS replied_at timestamptz;
