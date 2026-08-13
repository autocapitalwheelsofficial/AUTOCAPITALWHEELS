-- CREATE TABLE for tracking live active users on the site
CREATE TABLE IF NOT EXISTS live_site_activity (
  session_id TEXT PRIMARY KEY,
  user_name TEXT,
  user_email TEXT,
  user_phone TEXT,
  current_path TEXT NOT NULL,
  page_title TEXT NOT NULL,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS live_site_activity_last_active_idx ON live_site_activity(last_active_at DESC);
