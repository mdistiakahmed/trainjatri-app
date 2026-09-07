import { Pressable, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function TrainBackButton() {
  const params = useLocalSearchParams<{ from?: string; returnTo?: string }>();
  
  const handleBack = () => {
    // If coming from station route, go back to that route
    if (params.from === 'station-route' && params.returnTo) {
      router.push(params.returnTo as any);
    } else {
      // Otherwise, go to trains tab root
      router.navigate('/(tabs)/trains');
    }
  };

  return (
    <Pressable
      onPress={handleBack}
      style={{ marginLeft: Platform.OS === 'ios' ? 0 : 10 }}
    >
      <IconSymbol
        name="chevron.left"
        size={24}
        color="#007AFF"
      />
    </Pressable>
  );
}
