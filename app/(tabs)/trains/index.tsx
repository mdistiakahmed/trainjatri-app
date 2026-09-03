import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  ImageBackground,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { uniqueTrainNames } from "@/utils/trainNames";
import { trainNameEnBnMapping } from "@/utils/trainNameEnBnMapping";
import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

const stripBracketContent = (name: string) => {
  return name.replace(/\s*\(.*?\)\s*/g, "").trim();
};

export default function TrainsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const filteredTrains = uniqueTrainNames.filter((trainName) => {
    const cleanName = stripBracketContent(trainName);
    const bengaliName =
      trainNameEnBnMapping[cleanName as keyof typeof trainNameEnBnMapping];

    const query = searchQuery.toLowerCase();
    return (
      cleanName.toLowerCase().includes(query) ||
      (bengaliName && bengaliName.includes(searchQuery))
    );
  });

  const handleTrainPress = (trainName: string) => {
    const cleanName = stripBracketContent(trainName);
    const urlSlug = cleanName.toLowerCase().replace(/\s+/g, "-");
    router.push(`/(tabs)/trains/${urlSlug}`);
  };

  return (
    <ImageBackground
      source={require("@/assets/images/snowflakes.png")}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <ThemedView
        style={[styles.container, { backgroundColor: "transparent" }]}
      >
        <ScrollView 
          style={styles.mainScrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              contentFit="contain"
            />
            <ThemedText
              type="title"
              style={[styles.title, { fontFamily: Fonts.rounded }]}
            >
              Trains Schedule
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Discover trains across Bangladesh
            </ThemedText>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
                  color: colors.text,
                  borderWidth: isSearchFocused ? 3 : 2,
                  borderColor: isSearchFocused ? "#1877F2" : "#000",
                },
              ]}
              placeholder="Search train name / ট্রেন সার্চ করুন"
              placeholderTextColor={colors.tabIconDefault}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </View>

          <View style={styles.trainsGrid}>
            {filteredTrains.map((trainName) => {
              const cleanName = stripBracketContent(trainName);
              const bengaliName =
                trainNameEnBnMapping[
                  cleanName as keyof typeof trainNameEnBnMapping
                ];

              return (
                <Pressable
                  key={trainName}
                  style={({ pressed }) => [
                    styles.trainCard,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#2a2a2a" : "#fff",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => handleTrainPress(trainName)}
                >
                  <ThemedText style={styles.trainName}>{cleanName}</ThemedText>
                  {bengaliName && (
                    <ThemedText style={styles.trainNameBn}>
                      {bengaliName}
                    </ThemedText>
                  )}
                  <ThemedText style={styles.viewDetails}>
                    View Details →
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </ThemedView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.5,
  },
  container: {
    flex: 1,
  },
  mainScrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 75,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  trainsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  trainCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trainName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  trainNameBn: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.8,
  },
  viewDetails: {
    fontSize: 14,
    color: "#4f46e5",
    fontWeight: "500",
    marginTop: 4,
  },
});
