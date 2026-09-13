import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { BrandLogo } from "@/components/BrandLogo";
import { uniqueTrainNames } from "@/utils/trainNames";
import { trainNameEnBnMapping } from "@/utils/trainNameEnBnMapping";
import { Fonts } from "@/constants/theme";

const TEXT = "#11181C";
const MUTED = "#6b7280";
const CARD = "#ffffff";
const PAGE_BG = "#f7f8fa";
const FIELD_BG = "#f5f5f5";
const PLACEHOLDER = "#9aa3af";
const LINK = "#4f46e5";
const BORDER = "#111111";
const FOCUS = "#1877F2";

const stripBracketContent = (name: string) => {
  return name.replace(/\s*\(.*?\)\s*/g, "").trim();
};

export default function TrainsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
      <View style={styles.container}>
        <ScrollView
          style={styles.mainScrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <BrandLogo />
            </View>
            <Text style={[styles.title, { fontFamily: Fonts.rounded }]}>
              Trains Schedule
            </Text>
            <Text style={styles.subtitle}>
              Discover trains across Bangladesh
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  borderWidth: isSearchFocused ? 3 : 2,
                  borderColor: isSearchFocused ? FOCUS : BORDER,
                },
              ]}
              placeholder="Search train name / ট্রেন সার্চ করুন"
              placeholderTextColor={PLACEHOLDER}
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
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => handleTrainPress(trainName)}
                >
                  <Text style={styles.trainName}>{cleanName}</Text>
                  {bengaliName && (
                    <Text style={styles.trainNameBn}>{bengaliName}</Text>
                  )}
                  <Text style={styles.viewDetails}>View Details →</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: PAGE_BG,
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
  logoWrap: {
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: TEXT,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: MUTED,
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
    backgroundColor: FIELD_BG,
    color: TEXT,
  },
  trainsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  trainCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: CARD,
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
    color: TEXT,
  },
  trainNameBn: {
    fontSize: 16,
    marginBottom: 8,
    color: MUTED,
  },
  viewDetails: {
    fontSize: 14,
    color: LINK,
    fontWeight: "500",
    marginTop: 4,
  },
});
