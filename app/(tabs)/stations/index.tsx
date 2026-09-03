import React, { useState, useMemo, useRef } from "react";
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
import { createRouteUrlSlugFromStations, formatStationNameForUrl } from "@/utils/stringutils";
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
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const routes = useMemo(() => getRoutes(), []);
  const groupedRoutes = useMemo(
    () => groupRoutesByStartStation(routes),
    [routes],
  );
  const stationGroups = useMemo(
    () => Object.keys(groupedRoutes).sort(),
    [groupedRoutes],
  );

  // Filter from station suggestions
  const filteredFromStations = stationGroups.filter((stationName) => {
    if (!fromStation.trim()) return false;
    const bengaliName = getBengaliStationName(stationName);
    const query = fromStation.toLowerCase();
    return (
      stationName.toLowerCase().includes(query) ||
      (bengaliName && bengaliName.includes(fromStation))
    );
  });

  // Filter to station suggestions (only show stations with routes from selected from station)
  const availableToStations = useMemo(() => {
    if (!fromStation.trim()) return [];
    
    // Find the selected from station
    const selectedFromStation = stationGroups.find(
      (station) =>
        station.toLowerCase() === fromStation.toLowerCase() ||
        getBengaliStationName(station) === fromStation
    );
    
    if (!selectedFromStation) return [];
    
    // Get all routes from this station
    const fromRoutes = groupedRoutes[selectedFromStation] || [];
    return fromRoutes.map((route) => route.route.split(" - ")[1]);
  }, [fromStation, stationGroups, groupedRoutes]);

  const filteredToStations = availableToStations.filter((stationName) => {
    if (!toStation.trim()) return true;
    const bengaliName = getBengaliStationName(stationName);
    const query = toStation.toLowerCase();
    return (
      stationName.toLowerCase().includes(query) ||
      (bengaliName && bengaliName.includes(toStation))
    );
  });

  const handleFromStationSelect = (stationName: string) => {
    setFromStation(stationName);
    setShowFromDropdown(false);
    setToStation(""); // Reset to station when from changes
  };

  const handleToStationSelect = (stationName: string) => {
    setToStation(stationName);
    setShowToDropdown(false);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleSearchRoute = () => {
    if (!fromStation) return;
    
    const stationSlug = formatStationNameForUrl(fromStation);
    
    if (toStation) {
      // Both stations selected - go to route detail page
      const routeSlug = createRouteUrlSlugFromStations(fromStation, toStation);
      router.push(`/(tabs)/stations/${stationSlug}/${routeSlug}` as any);
    } else {
      // Only from station selected - go to station detail page
      router.push(`/(tabs)/stations/${stationSlug}` as any);
    }
  };

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
        <ScrollView 
          ref={scrollViewRef}
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
            Railway Stations
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Find trains between stations
          </ThemedText>
        </View>

        {/* Quick Route Search */}
        <View style={styles.quickSearchSection}>
          <ThemedText style={styles.quickSearchTitle}>Quick Route Search</ThemedText>
          
          {/* From Station */}
          <View style={[styles.searchInputContainer, { zIndex: 2 }]}>
            <ThemedText style={styles.inputLabel}>From Station</ThemedText>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
                  color: colors.text,
                  borderWidth: fromStation ? 3 : 2,
                  borderColor: fromStation ? "#000" : "#000",
                },
              ]}
              placeholder="Enter from station / প্রারম্ভিক স্টেশন"
              placeholderTextColor={colors.tabIconDefault}
              value={fromStation}
              onChangeText={(text) => {
                setFromStation(text);
                setShowFromDropdown(text.trim().length > 0);
                setShowToDropdown(false); // Close to dropdown when typing in from
              }}
              onFocus={() => {
                setShowToDropdown(false); // Close to dropdown
                scrollToTop();
                if (fromStation.trim()) setShowFromDropdown(true);
              }}
            />
            {showFromDropdown && filteredFromStations.length > 0 && (
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: "#ffffff",
                    borderColor: "#1877F2",
                  },
                ]}
              >
                <ScrollView 
                  style={styles.dropdownScroll} 
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="always"
                >
                  {filteredFromStations.map((stationName) => {
                    const bengaliName = getBengaliStationName(stationName);
                    return (
                      <Pressable
                        key={stationName}
                        style={({ pressed }) => [
                          styles.dropdownItem,
                          {
                            backgroundColor: pressed ? "#e8f4ff" : "#ffffff",
                          },
                        ]}
                        onPress={() => handleFromStationSelect(stationName)}
                      >
                        <ThemedText style={[styles.dropdownItemText, { color: "#000" }]}>
                          {stationName}
                        </ThemedText>
                        {bengaliName && (
                          <ThemedText style={[styles.dropdownItemTextBn, { color: "#666" }]}>
                            {bengaliName}
                          </ThemedText>
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>

          {/* To Station */}
          <View style={[styles.searchInputContainer, { zIndex: 1 }]}>
            <ThemedText style={styles.inputLabel}>To Station (Optional)</ThemedText>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
                  color: colors.text,
                  borderWidth: toStation ? 3 : 2,
                  borderColor: toStation ? "#000" : "#000",
                },
              ]}
              placeholder="Enter to station / গন্তব্য স্টেশন"
              placeholderTextColor={colors.tabIconDefault}
              value={toStation}
              onChangeText={(text) => {
                setToStation(text);
                setShowToDropdown(text.trim().length > 0);
                setShowFromDropdown(false); // Close from dropdown when typing in to
              }}
              onFocus={() => {
                setShowFromDropdown(false); // Close from dropdown when focusing to station
                scrollToTop();
                if (toStation.trim()) setShowToDropdown(true);
              }}
              editable={!!fromStation}
            />
            {showToDropdown && fromStation && filteredToStations.length > 0 && (
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: "#ffffff",
                    borderColor: "#1877F2",
                  },
                ]}
              >
                <ScrollView 
                  style={styles.dropdownScroll} 
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="always"
                >
                  {filteredToStations.map((stationName) => {
                    const bengaliName = getBengaliStationName(stationName);
                    return (
                      <Pressable
                        key={stationName}
                        style={({ pressed }) => [
                          styles.dropdownItem,
                          {
                            backgroundColor: pressed ? "#e8f4ff" : "#ffffff",
                          },
                        ]}
                        onPress={() => handleToStationSelect(stationName)}
                      >
                        <ThemedText style={[styles.dropdownItemText, { color: "#000" }]}>
                          {stationName}
                        </ThemedText>
                        {bengaliName && (
                          <ThemedText style={[styles.dropdownItemTextBn, { color: "#666" }]}>
                            {bengaliName}
                          </ThemedText>
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Search Button */}
          <Pressable
            style={({ pressed }) => [
              styles.searchButton,
              {
                opacity: fromStation ? (pressed ? 0.7 : 1) : 0.5,
                backgroundColor: fromStation ? "#1877F2" : "#999",
              },
            ]}
            onPress={handleSearchRoute}
            disabled={!fromStation}
          >
            <ThemedText style={styles.searchButtonText}>
              🔍 {toStation ? 'Search Trains' : 'View Station'}
            </ThemedText>
          </Pressable>
        </View>

        <AdPlaceholder />

        {/* All Stations List */}
        <View style={[styles.allStationsSection, { zIndex: 0 }]}>
          <ThemedText style={styles.sectionTitle}>All Stations</ThemedText>
        </View>

        <View style={[styles.stationsGrid, { zIndex: 0 }]}>
          {stationGroups.map((stationName) => {
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
  quickSearchSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  quickSearchTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  searchInputContainer: {
    position: "relative",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.8,
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
    borderWidth: 2,
    borderColor: "#000",
  },
  dropdown: {
    position: "absolute",
    top: 78,
    left: 0,
    right: 0,
    maxHeight: 250,
    borderRadius: 10,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    overflow: "hidden",
  },
  dropdownScroll: {
    maxHeight: 250,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: "500",
  },
  dropdownItemTextBn: {
    fontSize: 13,
    marginTop: 2,
  },
  searchButton: {
    backgroundColor: "#1877F2",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  allStationsSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
