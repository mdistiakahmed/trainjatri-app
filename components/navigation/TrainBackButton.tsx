import { Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';

export function TrainBackButton() {
  const params = useLocalSearchParams<{ from?: string; returnTo?: string }>();

  const handleBack = () => {
    if (params.from === 'station-route' && params.returnTo) {
      router.push(params.returnTo as any);
    } else {
      router.navigate('/(tabs)/trains');
    }
  };

  return (
    <Pressable
      onPress={handleBack}
      hitSlop={8}
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]}
    >
      <MaterialIcons name="arrow-back" size={22} color="#1877F2" />
      <ThemedText style={styles.label}>Back</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1877F2',
    backgroundColor: '#fff',
  },
  label: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#1877F2',
  },
});
