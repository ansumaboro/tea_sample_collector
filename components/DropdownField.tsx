import { Picker } from '@react-native-picker/picker';
import { StyleSheet, Text, View } from 'react-native';

import {
    COLORS,
    FONT_SIZES,
    INPUT_HEIGHT,
    SPACING,
} from '@/constants/theme';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownFieldProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  error?: string;
}

export function DropdownField({
  label,
  value,
  onValueChange,
  options,
  placeholder = 'Select an option',
  error,
}: DropdownFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.input,
          error ? styles.inputError : null,
        ]}
      >
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor={COLORS.text}
        >
          <Picker.Item
            label={placeholder}
            value=""
            color={COLORS.textSecondary}
          />

          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
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
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    overflow: 'hidden',
  },

  picker: {
    height: INPUT_HEIGHT,
    color: COLORS.text,
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