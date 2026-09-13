import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { BrandLogo } from "@/components/BrandLogo";
import {
  SearchPanel,
  SearchField,
  SearchButton,
} from "@/components/search/SearchPanel";
import { uniqueTrainNames } from "@/utils/trainNames";
import { trainNameEnBnMapping } from "@/utils/trainNameEnBnMapping";
import { BLUE_ACTIVE, Fonts } from "@/constants/theme";

const TEXT = "#11181C";
const MUTED = "#6b7280";
const CARD = "#ffffff";
const PAGE_BG = "#f7f8fa";

const stripBracketContent = (name: string) => {
  return name.replace(/\s*\(.*?\)\s*/g, "").trim();
};

export default function TrainsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const matchTrain = (trainName: string, queryText: string) => {
    const cleanName = stripBracketContent(trainName);
    const bengaliName =
      trainNameEnBnMapping[cleanName as keyof typeof trainNameEnBnMapping];
    const query = queryText.toLowerCase();
    return (
      cleanName.toLowerCase().includes(query) ||
      (!!bengaliName && bengaliName.includes(queryText))
    );
  };

  const trainSuggestions = uniqueTrainNames
    .filter((trainName) => matchTrain(trainName, searchQuery))
    .slice(0, 12)
    .map((trainName) => {
      const cleanName = stripBracketContent(trainName);
      const bengaliName =
        trainNameEnBnMapping[cleanName as keyof typeof trainNameEnBnMapping];
      return {
        key: trainName,
        title: cleanName,
        subtitle: bengaliName || undefined,
      };
    });

  const filteredTrains = uniqueTrainNames.filter((trainName) => {
    const cleanName = stripBracketContent(trainName);
    const bengaliName =
      trainNameEnBnMapping[cleanName as keyof typeof trainNameEnBnMapping];

    const query = appliedQuery.toLowerCase();
    return (
      cleanName.toLowerCase().includes(query) ||
      (bengaliName && bengaliName.includes(appliedQuery))
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

          <SearchPanel style={{ marginBottom: 20 }}>
            <SearchField
              icon="train"
              label="Search train"
              placeholder="Search train name / ট্রেন সার্চ করুন"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setSelectedTrain(null);
                setAppliedQuery("");
                setShowDropdown(text.trim().length > 0);
              }}
              focused={isSearchFocused}
              onFocus={() => {
                setIsSearchFocused(true);
                if (searchQuery.trim() && !selectedTrain) {
                  setShowDropdown(true);
                }
              }}
              onBlur={() => setIsSearchFocused(false)}
              suggestions={trainSuggestions}
              showSuggestions={showDropdown && searchQuery.trim().length > 0}
              onSelectSuggestion={(item) => {
                setSearchQuery(item.title);
                setSelectedTrain(item.key);
                setAppliedQuery(item.title);
                setShowDropdown(false);
              }}
              zIndex={3}
            />
            <SearchButton
              label="Search Trains"
              enabled={!!selectedTrain}
              onPress={() => {
                if (selectedTrain) handleTrainPress(selectedTrain);
              }}
            />
          </SearchPanel>

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
    color: BLUE_ACTIVE,
    fontWeight: "500",
    marginTop: 4,
  },
});
