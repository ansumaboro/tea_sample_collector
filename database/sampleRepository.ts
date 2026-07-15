import { getDatabase } from '@/database/connection';
import type {
  Sample,
  SampleFormInput,
  SampleImageRow,
  SampleRow,
  SampleSearchField,
  SampleUpdateInput,
} from '@/types/sample';
import { toIsoTimestamp } from '@/utils/dateFormat';

function rowToSample(row: SampleRow, images: string[]): Sample {
  return {
    id: row.id,
    cloneNumber: row.clone_number,
    treeNumber: row.tree_number,
    leafNumber: row.leaf_number,
    leafPosition: row.leaf_position,
    meterTaken: row.meter_taken === 1,
    wetLabRequired: row.wet_lab_required === 1,
    wetLabCompleted: row.wet_lab_completed === 1,
    gpsLatitude: row.gps_latitude,
    gpsLongitude: row.gps_longitude,
    deviceManufacturer: row.device_manufacturer,
    deviceModel: row.device_model,
    installationId: row.installation_id,
    appVersion: row.app_version,
    images,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getImagesForSample(sampleId: string): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SampleImageRow>(
    'SELECT * FROM sample_images WHERE sample_id = ? ORDER BY sort_order ASC',
    sampleId,
  );
  return rows.map((row) => row.file_path);
}

async function hydrateSample(row: SampleRow): Promise<Sample> {
  const images = await getImagesForSample(row.id);
  return rowToSample(row, images);
}

export interface CreateSampleParams extends SampleFormInput {
  id: string;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  deviceManufacturer: string;
  deviceModel: string;
  installationId: string;
  appVersion: string;
  images: string[];
}

/** Repository for sample CRUD operations. */
export const sampleRepository = {
  async create(params: CreateSampleParams): Promise<Sample> {
    const db = await getDatabase();
    const now = toIsoTimestamp();

    await db.runAsync(
      `INSERT INTO samples (
        id, clone_number, tree_number, leaf_number, leaf_position,
        meter_taken, wet_lab_required, wet_lab_completed,
        gps_latitude, gps_longitude,
        device_manufacturer, device_model, installation_id, app_version,
        notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params.id,
      params.cloneNumber.trim(),
      params.treeNumber.trim(),
      params.leafNumber.trim(),
      params.leafPosition.trim(),
      params.meterTaken ? 1 : 0,
      params.wetLabRequired ? 1 : 0,
      params.wetLabCompleted ? 1 : 0,
      params.gpsLatitude,
      params.gpsLongitude,
      params.deviceManufacturer,
      params.deviceModel,
      params.installationId,
      params.appVersion,
      params.notes?.trim() ?? '',
      now,
      now,
    );

    for (let index = 0; index < params.images.length; index += 1) {
      await db.runAsync(
        'INSERT INTO sample_images (sample_id, file_path, sort_order) VALUES (?, ?, ?)',
        params.id,
        params.images[index],
        index + 1,
      );
    }

    const row = await db.getFirstAsync<SampleRow>('SELECT * FROM samples WHERE id = ?', params.id);
    if (!row) {
      throw new Error('Failed to read sample after insert.');
    }
    return rowToSample(row, params.images);
  },

  async getAll(): Promise<Sample[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<SampleRow>(
      'SELECT * FROM samples ORDER BY datetime(created_at) DESC',
    );
    return Promise.all(rows.map((row) => hydrateSample(row)));
  },

  async getById(id: string): Promise<Sample | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<SampleRow>('SELECT * FROM samples WHERE id = ?', id);
    if (!row) return null;
    return hydrateSample(row);
  },

  async search(
    query: string,
    field: SampleSearchField = 'all',
  ): Promise<Sample[]> {
    const trimmed = query.trim();

    if (!trimmed) {
      return this.getAll();
    }

    const db = await getDatabase();
    const like = `%${trimmed}%`;

    let rows: SampleRow[];

    if (field === 'all') {
      rows = await db.getAllAsync<SampleRow>(
        `SELECT * FROM samples
       WHERE id LIKE ?
          OR clone_number LIKE ?
          OR tree_number LIKE ?
          OR leaf_number LIKE ?
          OR leaf_position LIKE ?
          OR notes LIKE ?
       ORDER BY datetime(created_at) DESC`,
        like,
        like,
        like,
        like,
        like,
        like,
      );
    } else {
      rows = await db.getAllAsync<SampleRow>(
        `SELECT * FROM samples
       WHERE ${field} LIKE ?
       ORDER BY datetime(created_at) DESC`,
        like,
      );
    }

    return Promise.all(rows.map((row) => hydrateSample(row)));
  },

  async update(id: string, updates: SampleUpdateInput): Promise<Sample> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Sample not found: ${id}`);
    }

    const db = await getDatabase();
    const now = toIsoTimestamp();
    const merged: Sample = {
      ...existing,
      ...updates,
      notes: updates.notes ?? existing.notes,
      updatedAt: now,
    };

    await db.runAsync(
      `UPDATE samples SET
        clone_number = ?,
        tree_number = ?,
        leaf_number = ?,
        leaf_position = ?,
        meter_taken = ?,
        wet_lab_required = ?,
        wet_lab_completed = ?,
        notes = ?,
        updated_at = ?
      WHERE id = ?`,
      merged.cloneNumber.trim(),
      merged.treeNumber.trim(),
      merged.leafNumber.trim(),
      merged.leafPosition.trim(),
      merged.meterTaken ? 1 : 0,
      merged.wetLabRequired ? 1 : 0,
      merged.wetLabCompleted ? 1 : 0,
      merged.notes.trim(),
      now,
      id,
    );

    if (updates.images) {
      await db.runAsync('DELETE FROM sample_images WHERE sample_id = ?', id);
      for (let index = 0; index < merged.images.length; index += 1) {
        await db.runAsync(
          'INSERT INTO sample_images (sample_id, file_path, sort_order) VALUES (?, ?, ?)',
          id,
          merged.images[index],
          index + 1,
        );
      }
    }

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error('Failed to read sample after update.');
    }
    return updated;
  },

  async count(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM samples',
    );
    return result?.count ?? 0;
  },

  async clear() {
    const db = await getDatabase();

    await db.execAsync(`
      DELETE FROM samples;
      DELETE FROM sample_images;
      DELETE FROM sqlite_sequence
      WHERE name='samples';
      DELETE FROM sqlite_sequence
      WHERE name='sample_images';
    `);
  }
};
