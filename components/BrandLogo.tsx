import { Image } from "expo-image";
import { StyleSheet } from "react-native";

export function BrandLogo() {
  return (
    <Image
      source={require("@/assets/images/logo.png")}
      style={styles.logo}
      contentFit="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 200,
    height: 100,
  },
});
