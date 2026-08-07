PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS feedback_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('modpack', 'map', 'other')),
  subtype TEXT NOT NULL,
  canonical_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'candidate',
  cover_url TEXT,
  cover_platform TEXT,
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS feedback_items_category_idx
  ON feedback_items (category, subtype, status, vote_count DESC, created_at ASC);

CREATE TABLE IF NOT EXISTS feedback_aliases (
  item_id TEXT NOT NULL REFERENCES feedback_items(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (item_id, normalized_alias)
);

CREATE INDEX IF NOT EXISTS feedback_aliases_normalized_idx
  ON feedback_aliases (normalized_alias);

CREATE TABLE IF NOT EXISTS feedback_sources (
  item_id TEXT NOT NULL REFERENCES feedback_items(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  normalized_url TEXT NOT NULL UNIQUE,
  external_id TEXT,
  is_primary INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  PRIMARY KEY (item_id, normalized_url)
);

CREATE INDEX IF NOT EXISTS feedback_sources_item_idx
  ON feedback_sources (item_id, is_primary DESC);

CREATE TABLE IF NOT EXISTS feedback_votes (
  item_id TEXT NOT NULL REFERENCES feedback_items(id) ON DELETE CASCADE,
  voter_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (item_id, voter_hash)
);

CREATE INDEX IF NOT EXISTS feedback_votes_voter_idx
  ON feedback_votes (voter_hash, item_id, active);

CREATE TABLE IF NOT EXISTS feedback_submissions (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES feedback_items(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subtype TEXT NOT NULL,
  original_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  voter_hash TEXT,
  result TEXT NOT NULL CHECK (result IN ('created', 'merged')),
  created_at TEXT NOT NULL
);
