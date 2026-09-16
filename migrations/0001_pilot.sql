CREATE TABLE IF NOT EXISTS pilot_applications (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  discipline TEXT NOT NULL,
  frequency TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  consent TEXT NOT NULL,
  created_at TEXT NOT NULL
);
