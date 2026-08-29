import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ImageBackground,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { uniqueTrainNames } from "@/utils/trainNames";
import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import AdPlaceholder from "@/components/ads/AdPlaceholder";

const majorStations = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Rangpur",
  "Mymensingh",
  "Cumilla",
  "Brahmanbaria",
  "Panchagarh",
];

const stripBracketContent = (name: string) => {
  return name.replace(/\s*\(.*?\)\s*/g, "").trim();
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const popularTrains = uniqueTrainNames.slice(0, 6);

  const handleTrainPress = (trainName: string) => {
    const cleanName = stripBracketContent(trainName);
    const urlSlug = cleanName.toLowerCase().replace(/\s+/g, "-");
    router.push(`/(tabs)/trains/${urlSlug}`);
  };

  const handleStationPress = (station: string) => {
    const urlSlug = station.toLowerCase().replace(/\s+/g, "-");
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
        <ScrollView style={styles.scrollView}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <ThemedText
              type="title"
              style={[styles.heroTitle, { fontFamily: Fonts.rounded }]}
            >
              Your Complete Bangladesh Railway Guide
            </ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Find train schedules, book tickets, and get real-time updates for
              all major train routes across Bangladesh.
            </ThemedText>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              contentFit="contain"
            />
          </View>

          {/* Quick Access Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Quick Access</ThemedText>
            <View style={styles.quickAccessGrid}>
              <Pressable
                style={({ pressed }) => [
                  styles.quickAccessCard,
                  styles.blueCard,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#1e3a5f" : "#eff6ff",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => router.push("/(tabs)/trains")}
              >
                <ThemedText
                  style={[
                    styles.quickAccessTitle,
                    { color: colorScheme === "dark" ? "#93c5fd" : "#1e40af" },
                  ]}
                >
                  Train Schedules
                </ThemedText>
                <ThemedText style={styles.quickAccessDescription}>
                  Find schedules by train name or number across all routes.
                </ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.quickAccessCard,
                  styles.greenCard,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#1e4d3f" : "#f0fdf4",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => router.push("/(tabs)/stations")}
              >
                <ThemedText
                  style={[
                    styles.quickAccessTitle,
                    { color: colorScheme === "dark" ? "#86efac" : "#166534" },
                  ]}
                >
                  Station Schedules
                </ThemedText>
                <ThemedText style={styles.quickAccessDescription}>
                  View all train schedules for major railway stations.
                </ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.quickAccessCard,
                  styles.redCard,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#4d1e1e" : "#fef2f2",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => router.push("/(tabs)/live-tracking")}
              >
                <ThemedText
                  style={[
                    styles.quickAccessTitle,
                    { color: colorScheme === "dark" ? "#fca5a5" : "#991b1b" },
                  ]}
                >
                  Live Train Tracking
                </ThemedText>
                <ThemedText style={styles.quickAccessDescription}>
                  Track trains in real-time and get live updates on status.
                </ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Ad Placeholder */}
          <AdPlaceholder />

          {/* Popular Trains Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>
                Popular Trains
              </ThemedText>
              <Pressable onPress={() => router.push("/(tabs)/trains")}>
                <ThemedText style={styles.viewAllLink}>View All →</ThemedText>
              </Pressable>
            </View>
            <View style={styles.trainsGrid}>
              {popularTrains.map((trainName) => {
                const cleanName = stripBracketContent(trainName);
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
                    <ThemedText style={styles.trainName}>
                      {cleanName}
                    </ThemedText>
                    <ThemedText style={styles.trainDescription}>
                      View schedule, stops, and booking information.
                    </ThemedText>
                    <View style={styles.trainFooter}>
                      <ThemedText style={styles.viewScheduleText}>
                        View Schedule →
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Ad Placeholder */}
          <AdPlaceholder />

          {/* Major Stations Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>
                Major Railway Stations
              </ThemedText>
              <Pressable onPress={() => router.push("/(tabs)/stations")}>
                <ThemedText style={styles.viewAllLink}>View All →</ThemedText>
              </Pressable>
            </View>
            <View style={styles.stationsGrid}>
              {majorStations.map((station) => (
                <Pressable
                  key={station}
                  style={({ pressed }) => [
                    styles.stationCard,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#2a2a2a" : "#fff",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => handleStationPress(station)}
                >
                  <ThemedText style={styles.stationName}>
                    {station} Station
                  </ThemedText>
                  <ThemedText style={styles.stationSubtext}>
                    View all trains
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Disclaimer Section */}
          <View style={styles.disclaimerSection}>
            <ThemedText style={styles.disclaimerTitle}>
              About Our Data
            </ThemedText>
            <ThemedText style={styles.disclaimerText}>
              At Train Jatri, we are committed to providing accurate and
              up-to-date train schedule information. Our data is collected from
              official Bangladesh Railway sources.
            </ThemedText>
            <ThemedText style={styles.disclaimerText}>
              We update our database regularly, typically every month. However,
              train schedules may change due to maintenance, weather, or
              operational requirements.
            </ThemedText>
            <ThemedText style={styles.disclaimerText}>
              While we strive for accuracy, we recommend cross-verifying
              important travel information with official Bangladesh Railway
              sources before making travel arrangements.
            </ThemedText>
            <ThemedText style={styles.lastUpdated}>
              Last updated: 24th August, 2026
            </ThemedText>
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
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  viewAllLink: {
    fontSize: 16,
    color: "#4f46e5",
    fontWeight: "600",
  },
  quickAccessGrid: {
    gap: 12,
  },
  quickAccessCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  blueCard: {
    borderColor: "#dbeafe",
  },
  greenCard: {
    borderColor: "#dcfce7",
  },
  redCard: {
    borderColor: "#fee2e2",
  },
  quickAccessTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  quickAccessDescription: {
    fontSize: 15,
    opacity: 0.8,
    lineHeight: 22,
  },
  trainsGrid: {
    gap: 12,
  },
  trainCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  trainName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  trainDescription: {
    fontSize: 15,
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 22,
  },
  trainFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  viewScheduleText: {
    fontSize: 15,
    color: "#4f46e5",
    fontWeight: "600",
  },
  stationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  stationCard: {
    width: "48%",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  stationName: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  stationSubtext: {
    fontSize: 13,
    opacity: 0.6,
  },
  disclaimerSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  disclaimerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 22,
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 8,
  },
});
