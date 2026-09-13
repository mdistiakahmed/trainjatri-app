import React, { useState, useMemo } from "react";
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
  SearchFieldDivider,
  SearchButton,
  useSearchScroll,
} from "@/components/search/SearchPanel";
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
  const [fromFocused, setFromFocused] = useState(false);
  const [toFocused, setToFocused] = useState(false);
  const searchScroll = useSearchScroll();

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
          {...searchScroll.scrollViewProps}
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

          <SearchPanel
            style={{ marginBottom: 10 }}
            scrollViewRef={searchScroll.scrollViewRef}
            scrollOffsetRef={searchScroll.scrollOffsetRef}
          >
            <SearchField
              label="From / যাত্রা শুরু"
              placeholder="Select station"
              value={fromStation}
              onChangeText={(text) => {
                setFromStation(text);
                setShowFromDropdown(text.trim().length > 0);
                setShowToDropdown(false);
              }}
              focused={fromFocused}
              onFocus={() => {
                setFromFocused(true);
                setShowToDropdown(false);
                if (fromStation.trim()) setShowFromDropdown(true);
              }}
              onBlur={() => setFromFocused(false)}
              suggestions={filteredFromStations.map((stationName) => ({
                key: stationName,
                title: stationName,
                subtitle: getBengaliStationName(stationName) || undefined,
              }))}
              showSuggestions={showFromDropdown}
              onSelectSuggestion={(item) => handleFromStationSelect(item.title)}
              zIndex={3}
            />
            <SearchFieldDivider />
            <SearchField
              label="To / গন্তব্য"
              placeholder="Select station"
              value={toStation}
              onChangeText={(text) => {
                setToStation(text);
                setShowToDropdown(text.trim().length > 0);
                setShowFromDropdown(false);
              }}
              focused={toFocused}
              onFocus={() => {
                setToFocused(true);
                setShowFromDropdown(false);
                if (fromStation.trim()) setShowToDropdown(true);
              }}
              onBlur={() => setToFocused(false)}
              editable={!!fromStation}
              suggestions={filteredToStations.map((stationName) => ({
                key: stationName,
                title: stationName,
                subtitle: getBengaliStationName(stationName) || undefined,
              }))}
              showSuggestions={showToDropdown && !!fromStation}
              onSelectSuggestion={(item) => handleToStationSelect(item.title)}
              zIndex={2}
            />
            <SearchButton
              label={toStation ? "Search Trains" : "View Station"}
              enabled={!!fromStation}
              onPress={handleSearchRoute}
            />
          </SearchPanel>

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
