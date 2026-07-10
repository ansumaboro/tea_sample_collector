/** Shared UI and layout constants for field-worker friendly design. */
export const COLORS = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  primary: '#1B5E20',
  primaryDark: '#0D3B12',
  text: '#111111',
  textSecondary: '#444444',
  border: '#CCCCCC',
  danger: '#B71C1C',
  disabled: '#9E9E9E',
} as const;

export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const FONT_SIZES = {
  label: 18,
  input: 20,
  body: 18,
  button: 22,
  title: 28,
  subtitle: 20,
} as const;

export const BUTTON_HEIGHT = 64;
export const INPUT_HEIGHT = 52;

export const DB_NAME = 'tea_samples.db';
export const INSTALLATION_ID_KEY = 'tea_installation_id';
export const IMAGES_DIR_NAME = 'sample_images';
