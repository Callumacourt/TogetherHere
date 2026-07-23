import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '../components/themed-view';
import { Link } from 'expo-router';
import MapComponent from '@/components/Map/Map';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.heroSection}>
          <Link style={styles.button} href={'/AccountScreen'}>
            Accounts page
          </Link>
          <MapComponent />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  button: {
    backgroundColor: 'white',
    color: 'black',
  },
});
