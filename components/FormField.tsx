import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { COLORS, FONT_SIZES, INPUT_HEIGHT, SPACING } from '@/constants/theme';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function FormField({ label, error, style, ...inputProps }: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={COLORS.textSecondary}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.label,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    minHeight: INPUT_HEIGHT,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.input,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  error: {
    marginTop: SPACING.xs,
    color: COLORS.danger,
    fontSize: FONT_SIZES.body,
  },
});
