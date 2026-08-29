import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  ImageBackground,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getRoutes, groupRoutesByStartStation } from "@/utils/stationsData";
import { cityEnBnMapping } from "@/utils/stationNameEnBnMapping";
import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import AdPlaceholder from "@/components/ads/AdPlaceholder";

const stationNameToMappingKey = (name: string) =>
  name.trim().replace(/\s+/g, "_");

const getBengaliStationName = (englishName: string) =>
  cityEnBnMapping[
    stationNameToMappingKey(englishName) as keyof typeof cityEnBnMapping
  ] || "";

export default function StationsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const routes = useMemo(() => getRoutes(), []);
  const groupedRoutes = useMemo(
    () => groupRoutesByStartStation(routes),
    [routes],
  );
  const stationGroups = useMemo(
    () => Object.keys(groupedRoutes),
    [groupedRoutes],
  );

  const filteredStations = stationGroups.filter((stationName) => {
    const bengaliName = getBengaliStationName(stationName);
    const query = searchQuery.toLowerCase();
    return (
      stationName.toLowerCase().includes(query) ||
      (bengaliName && bengaliName.includes(searchQuery))
    );
  });

  const handleStationPress = (stationName: string) => {
    const urlSlug = stationName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    router.push(`/(tabs)/stations/${urlSlug}`);
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
            Railway Stations
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Browse stations and their train routes
          </ThemedText>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
                color: colors.text,
              },
            ]}
            placeholder="Search station / স্টেশন সার্চ করুন"
            placeholderTextColor={colors.tabIconDefault}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.stationsGrid}>
            {filteredStations.map((stationName) => {
              const bengaliName = getBengaliStationName(stationName);
              const routeCount = groupedRoutes[stationName].length;

              return (
                <Pressable
                  key={stationName}
                  style={({ pressed }) => [
                    styles.stationCard,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#2a2a2a" : "#fff",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => handleStationPress(stationName)}
                >
                  <View style={styles.stationInfo}>
                    <ThemedText style={styles.stationName}>
                      {stationName} Station
                    </ThemedText>
                    {bengaliName && (
                      <ThemedText style={styles.stationNameBn}>
                        {bengaliName} স্টেশন
                      </ThemedText>
                    )}
                    <ThemedText style={styles.routeCount}>
                      {routeCount} train route{routeCount !== 1 ? "s" : ""}{" "}
                      available
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>
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
  scrollView: {
    flex: 1,
  },
  stationsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stationCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stationInfo: {
    flexDirection: "column",
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  stationNameBn: {
    fontSize: 14,
    marginBottom: 6,
    opacity: 0.8,
  },
  routeCount: {
    fontSize: 12,
    opacity: 0.6,
  },
});
