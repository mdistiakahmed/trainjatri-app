import React, { useState, useMemo, useRef } from "react";
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
import { getRoutes, groupRoutesByStartStation } from "@/utils/stationsData";
import { cityEnBnMapping } from "@/utils/stationNameEnBnMapping";
import {
  createRouteUrlSlugFromStations,
  formatStationNameForUrl,
} from "@/utils/stringutils";
import { Fonts } from "@/constants/theme";
import AdPlaceholder from "@/components/ads/AdPlaceholder";

const TEXT = "#11181C";
const MUTED = "#6b7280";
const CARD = "#ffffff";
const PAGE_BG = "#f7f8fa";
const FIELD_BG = "#f5f5f5";
const PLACEHOLDER = "#9aa3af";
const BORDER = "#111111";
const FOCUS = "#1877F2";
const DROPDOWN_PRESSED = "#e8f4ff";
const DISABLED = "#999999";

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
        getBengaliStationName(station) === fromStation,
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
      <View
        style={[styles.container, { backgroundColor: "transparent" }]}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.mainScrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <BrandLogo />
            </View>
            <Text style={[styles.title, { fontFamily: Fonts.rounded }]}>
              Railway Stations
            </Text>
            <Text style={styles.subtitle}>
              Find trains between stations
            </Text>
          </View>

          {/* Quick Route Search */}
          <View style={styles.quickSearchSection}>
            <Text style={styles.quickSearchTitle}>
              Quick Route Search
            </Text>

            {/* From Station */}
            <View style={[styles.searchInputContainer, { zIndex: 2 }]}>
              <Text style={styles.inputLabel}>From Station</Text>
              <TextInput
                style={[
                  styles.searchInput,
                  { borderWidth: fromStation ? 3 : 2 },
                ]}
                placeholder="Enter from station / প্রারম্ভিক স্টেশন"
                placeholderTextColor={PLACEHOLDER}
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
                <View style={styles.dropdown}>
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
                              backgroundColor: pressed
                                ? DROPDOWN_PRESSED
                                : CARD,
                            },
                          ]}
                          onPress={() => handleFromStationSelect(stationName)}
                        >
                          <Text style={styles.dropdownItemText}>
                            {stationName}
                          </Text>
                          {bengaliName && (
                            <Text style={styles.dropdownItemTextBn}>
                              {bengaliName}
                            </Text>
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
              <Text style={styles.inputLabel}>
                To Station (Optional)
              </Text>
              <TextInput
                style={[
                  styles.searchInput,
                  { borderWidth: toStation ? 3 : 2 },
                ]}
                placeholder="Enter to station / গন্তব্য স্টেশন"
                placeholderTextColor={PLACEHOLDER}
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
              {showToDropdown &&
                fromStation &&
                filteredToStations.length > 0 && (
                  <View style={styles.dropdown}>
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
                                backgroundColor: pressed
                                  ? DROPDOWN_PRESSED
                                  : CARD,
                              },
                            ]}
                            onPress={() => handleToStationSelect(stationName)}
                          >
                            <Text style={styles.dropdownItemText}>
                              {stationName}
                            </Text>
                            {bengaliName && (
                              <Text style={styles.dropdownItemTextBn}>
                                {bengaliName}
                              </Text>
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
                  backgroundColor: fromStation ? FOCUS : DISABLED,
                },
              ]}
              onPress={handleSearchRoute}
              disabled={!fromStation}
            >
              <Text style={styles.searchButtonText}>
                🔍 {toStation ? "Search Trains" : "View Station"}
              </Text>
            </Pressable>
          </View>

          <AdPlaceholder />

          {/* All Stations List */}
          <View style={[styles.allStationsSection, { zIndex: 0 }]}>
            <Text style={styles.sectionTitle}>All Stations</Text>
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
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => handleStationPress(stationName)}
                >
                  <View style={styles.stationInfo}>
                    <Text style={styles.stationName}>
                      {stationName} Station
                    </Text>
                    {bengaliName && (
                      <Text style={styles.stationNameBn}>
                        {bengaliName} স্টেশন
                      </Text>
                    )}
                    <Text style={styles.routeCount}>
                      {routeCount} train route{routeCount !== 1 ? "s" : ""}{" "}
                      available
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
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
  quickSearchSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  quickSearchTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: TEXT,
  },
  searchInputContainer: {
    position: "relative",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: TEXT,
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
    borderColor: BORDER,
    backgroundColor: FIELD_BG,
    color: TEXT,
  },
  dropdown: {
    position: "absolute",
    top: 78,
    left: 0,
    right: 0,
    maxHeight: 250,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: CARD,
    borderColor: FOCUS,
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
    color: TEXT,
  },
  dropdownItemTextBn: {
    fontSize: 13,
    marginTop: 2,
    color: MUTED,
  },
  searchButton: {
    backgroundColor: FOCUS,
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
    color: TEXT,
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
    backgroundColor: CARD,
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
    color: TEXT,
  },
  stationNameBn: {
    fontSize: 14,
    marginBottom: 6,
    color: MUTED,
  },
  routeCount: {
    fontSize: 12,
    color: MUTED,
  },
});
