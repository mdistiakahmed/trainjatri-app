import { Pressable, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface SmartBackButtonProps {
  fallbackRoute?: string;
}

export function SmartBackButton({
  fallbackRoute = "/(tabs)",
}: SmartBackButtonProps) {
  const handleBack = () => {
    router.navigate(fallbackRoute as any);
  };

  return (
    <Pressable
      onPress={handleBack}
      hitSlop={8}
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]}
    >
      <MaterialIcons name="arrow-back" size={22} color="#1877F2" />
      <Text style={styles.label}>Back</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#1877F2",
    backgroundColor: "#fff",
  },
  label: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "700",
    color: "#1877F2",
  },
});
