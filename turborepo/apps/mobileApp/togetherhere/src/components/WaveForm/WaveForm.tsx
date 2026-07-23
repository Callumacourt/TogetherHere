import { StyleSheet } from 'react-native';
import { View } from 'react-native-reanimated/lib/typescript/Animated';

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function WaveForm({ seed }: { seed: number }) {
  const rand = seededRandom(seed);
  const waves = Array.from({ length: 12 }, () => rand() * 50 + 10);

  return (
    <View
      onTouchStart={(e) => e.stopPropagation()}
      style={styles.waveContainer}
    >
      {waves.map((height, i) => (
        <View key={i} style={[styles.wave, { height }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wave: {},
  waveContainer: {},
});
