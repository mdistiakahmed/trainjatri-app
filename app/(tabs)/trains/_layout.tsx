import { Stack } from "expo-router";

export default function TrainsLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        animationTypeForReplace: "pop",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Trains",
        }}
      />
      <Stack.Screen
        name="[name]"
        options={{
          title: "Train Details",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
