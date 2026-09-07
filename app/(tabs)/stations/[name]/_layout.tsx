import { Stack } from 'expo-router';
import { SmartBackButton } from '@/components/navigation/SmartBackButton';

export default function StationNameLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <SmartBackButton fallbackRoute="/(tabs)/stations" />,
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
