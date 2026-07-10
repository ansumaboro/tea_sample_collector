export const SAMPLES_TABLE = `
CREATE TABLE IF NOT EXISTS samples (
  id TEXT PRIMARY KEY NOT NULL,
  clone_number TEXT NOT NULL,
  tree_number TEXT NOT NULL,
  leaf_number TEXT NOT NULL,
  meter_taken INTEGER NOT NULL DEFAULT 0,
  wet_lab_required INTEGER NOT NULL DEFAULT 0,
  wet_lab_completed INTEGER NOT NULL DEFAULT 0,
  gps_latitude REAL,
  gps_longitude REAL,
  device_manufacturer TEXT NOT NULL,
  device_model TEXT NOT NULL,
  installation_id TEXT NOT NULL,
  app_version TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

export const SAMPLE_IMAGES_TABLE = `
CREATE TABLE IF NOT EXISTS sample_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sample_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  FOREIGN KEY (sample_id) REFERENCES samples(id) ON DELETE CASCADE
);
`;

export const SAMPLE_IMAGES_INDEX = `
CREATE INDEX IF NOT EXISTS idx_sample_images_sample_id ON sample_images(sample_id);
`;

export const SAMPLES_SEARCH_INDEX = `
CREATE INDEX IF NOT EXISTS idx_samples_search ON samples(clone_number, tree_number, leaf_number);
`;
