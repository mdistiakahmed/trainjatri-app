import { Stack } from "expo-router";

export default function StationsLayout() {
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
          title: "Stations",
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
