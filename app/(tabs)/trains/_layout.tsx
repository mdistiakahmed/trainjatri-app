import { Stack } from 'expo-router';
import { TrainBackButton } from '@/components/navigation/TrainBackButton';

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
          headerShown: true,
          headerLeft: () => <TrainBackButton />,
        }} 
      />
    </Stack>
  );
}
