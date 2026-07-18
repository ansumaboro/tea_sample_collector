import { BackHandler, Platform, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { COLORS, FONT_SIZES, SPACING } from '@/constants/theme';
import { useDeviceStore } from '@/store/deviceStore';

export default function HomeScreen() {
  const deviceInfo = useDeviceStore((state) => state.deviceInfo);

  const handleExit = () => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.page}>
        <View style={styles.container}>
          <Text style={styles.title}>Tea Sample Collector</Text>
          <Text style={styles.subtitle}>Offline field data collection</Text>

          <View style={styles.buttons}>
            <ActionButton label="Add Sample" onPress={() => router.push('/add-sample')} />
            <ActionButton label="Update Sample" onPress={() => router.push('/update-sample')} />
            <ActionButton label="Export Records" onPress={() => router.push('/export-records')} />
            <ActionButton label="Exit" onPress={handleExit} variant="danger" />
          </View>

          {deviceInfo ? (
            <Text style={styles.deviceInfo}>
              Device: {deviceInfo.manufacturer} {deviceInfo.model}
            </Text>
          ) : null}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center'
  },
  container: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.subtitle,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  buttons: {
    gap: SPACING.md,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  deviceInfo: {
    marginTop: SPACING.xl,
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
