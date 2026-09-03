import { Stack, router } from 'expo-router';
import { Pressable, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function StationNameLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            style={{ marginLeft: Platform.OS === 'ios' ? 0 : 10 }}
          >
            <IconSymbol
              name="chevron.left"
              size={24}
              color="#007AFF"
            />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="[slug]" 
        options={{ 
          title: 'Train Schedule',
        }} 
      />
    </Stack>
  );
}
