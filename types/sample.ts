/** Core sample record shape stored in SQLite and exported to CSV. */
export interface Sample {
  id: string;
  cloneNumber: string;
  treeNumber: string;
  leafNumber: string;
  leafPosition: string;
  meterTaken: boolean;
  wetLabRequired: boolean;
  wetLabCompleted: boolean;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  deviceManufacturer: string;
  deviceModel: string;
  installationId: string;
  appVersion: string;
  images: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** Form input before sample ID and auto fields are applied. */
export interface SampleFormInput {
  cloneNumber: string;
  treeNumber: string;
  leafNumber: string;
  leafPosition: string;
  meterTaken: boolean;
  wetLabRequired: boolean;
  wetLabCompleted: boolean;
  notes?: string;
}

/** Partial update payload for existing samples. */
export type SampleUpdateInput = Partial<
  Pick<
    Sample,
    | 'cloneNumber'
    | 'treeNumber'
    | 'leafNumber'
    | 'leafPosition'
    | 'meterTaken'
    | 'wetLabRequired'
    | 'wetLabCompleted'
    | 'notes'
    | 'images'
  >
>;

/** Device metadata captured once and attached to every sample. */
export interface DeviceInfo {
  manufacturer: string;
  model: string;
  osName: string;
  osVersion: string;
  installationId: string;
  appVersion: string;
}

/** Row shape returned from SQLite before image paths are joined. */
export interface SampleRow {
  id: string;
  clone_number: string;
  tree_number: string;
  leaf_number: string;
  leaf_position: string;
  meter_taken: number;
  wet_lab_required: number;
  wet_lab_completed: number;
  gps_latitude: number | null;
  gps_longitude: number | null;
  device_manufacturer: string;
  device_model: string;
  installation_id: string;
  app_version: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface SampleImageRow {
  id: number;
  sample_id: string;
  file_path: string;
  sort_order: number;
}

export type SampleSearchField =
  | 'all'
  | 'id'
  | 'clone_number'
  | 'tree_number'
  | 'leaf_number'
  | 'leaf_position'
  | 'notes';