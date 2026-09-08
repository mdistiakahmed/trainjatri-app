import { Stack } from 'expo-router';

export default function TrainsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: 'Trains'
        }} 
      />
      <Stack.Screen 
        name="[name]" 
        options={{ 
          title: 'Train Details',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
