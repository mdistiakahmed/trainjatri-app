import { Stack } from 'expo-router';

export default function StationNameLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
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
