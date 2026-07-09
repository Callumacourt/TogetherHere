import { Platform, View } from 'react-native';
import { ThemedText } from './themed-text';

export function WebBadge() {
  if (Platform.OS !== 'web') return null;
  
  return (
    <View style={{ backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
      <ThemedText type="small">Web</ThemedText>
    </View>
  );
}
