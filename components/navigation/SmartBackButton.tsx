import { Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface SmartBackButtonProps {
  fallbackRoute?: string;
}

export function SmartBackButton({ fallbackRoute = '/(tabs)' }: SmartBackButtonProps) {
  const handleBack = () => {
    // Always navigate to the fallback route to ensure consistent behavior
    // after tab reset
    router.navigate(fallbackRoute as any);
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
