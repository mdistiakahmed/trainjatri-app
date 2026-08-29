import { Stack } from 'expo-router';

export default function StationsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: 'Stations'
        }} 
      />
      <Stack.Screen 
        name="[name]" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
