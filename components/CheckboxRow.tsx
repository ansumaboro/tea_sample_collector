import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';

interface CheckboxRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function CheckboxRow({ label, value, onValueChange }: CheckboxRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={styles.row}
    >
      <View style={[styles.box, value ? styles.boxChecked : null]}>
        {value ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  box: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: COLORS.text,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  boxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    flex: 1,
    fontSize: FONT_SIZES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
});
