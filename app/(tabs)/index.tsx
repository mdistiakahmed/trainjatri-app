import React, { useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ImageBackground,
} from "react-native";
import { Image } from "expo-image";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { uniqueTrainNames } from "@/utils/trainNames";
import { getRoutes, groupRoutesByStartStation } from "@/utils/stationsData";
import { cityEnBnMapping } from "@/utils/stationNameEnBnMapping";
import { trainNameEnBnMapping } from "@/utils/trainNameEnBnMapping";
import {
  createRouteUrlSlugFromStations,
  formatStationNameForUrl,
} from "@/utils/stringutils";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import AdPlaceholder from "@/components/ads/AdPlaceholder";

const PRIMARY_BLUE = "#1D61C4";
const ACCENT_GREEN = "#2E9B4A";

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

const stripBracketContent = (name: string) =>
  name.replace(/\s*\(.*?\)\s*/g, "").trim();

const stationNameToMappingKey = (name: string) =>
  name.trim().replace(/\s+/g, "_");

const getBengaliStationName = (englishName: string) =>
  cityEnBnMapping[
    stationNameToMappingKey(englishName) as keyof typeof cityEnBnMapping
  ] || "";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromFocused, setFromFocused] = useState(false);
  const [toFocused, setToFocused] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const popularTrains = uniqueTrainNames.slice(0, 6);
  const routes = useMemo(() => getRoutes(), []);
  const groupedRoutes = useMemo(
    () => groupRoutesByStartStation(routes),
    [routes],
  );
  const stationGroups = useMemo(
    () => Object.keys(groupedRoutes).sort(),
    [groupedRoutes],
  );

  const filteredFromStations = stationGroups.filter((stationName) => {
    if (!fromStation.trim()) return false;
    const bengaliName = getBengaliStationName(stationName);
    const query = fromStation.toLowerCase();
    return (
      stationName.toLowerCase().includes(query) ||
      (bengaliName && bengaliName.includes(fromStation))
    );
  });

  const availableToStations = useMemo(() => {
    if (!fromStation.trim()) return [];
    const selectedFromStation = stationGroups.find(
      (station) =>
        station.toLowerCase() === fromStation.toLowerCase() ||
        getBengaliStationName(station) === fromStation,
    );
    if (!selectedFromStation) return [];
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
    setToStation("");
  };

  const handleToStationSelect = (stationName: string) => {
    setToStation(stationName);
    setShowToDropdown(false);
  };

  const handleSearchRoute = () => {
    if (!fromStation) return;
    const stationSlug = formatStationNameForUrl(fromStation);
    if (toStation) {
      const routeSlug = createRouteUrlSlugFromStations(fromStation, toStation);
      router.push(`/(tabs)/stations/${stationSlug}/${routeSlug}` as any);
    } else {
      router.push(`/(tabs)/stations/${stationSlug}` as any);
    }
  };

  const handleTrainPress = (trainName: string) => {
    const cleanName = stripBracketContent(trainName);
    const urlSlug = cleanName.toLowerCase().replace(/\s+/g, "-");
    router.push(`/(tabs)/trains/${urlSlug}`);
  };

  const handleStationPress = (station: string) => {
    const urlSlug = station.toLowerCase().replace(/\s+/g, "-");
    router.push(`/(tabs)/stations/${urlSlug}`);
  };

  const handlePopularRoutes = () => {
    const stationSlug = formatStationNameForUrl("Dhaka");
    const routeSlug = createRouteUrlSlugFromStations("Dhaka", "Chattogram");
    router.push(`/(tabs)/stations/${stationSlug}/${routeSlug}` as any);
  };

  const cardBg = isDark ? "#1c1c1e" : "#ffffff";
  const fieldBg = isDark ? "#2a2a2a" : "#f7f8fa";

  const renderStationField = (
    label: string,
    placeholder: string,
    value: string,
    onChange: (text: string) => void,
    focused: boolean,
    setFocused: (v: boolean) => void,
    showDropdown: boolean,
    suggestions: string[],
    onSelect: (name: string) => void,
    zIndex: number,
    editable = true,
    onFocusExtra?: () => void,
  ) => (
    <View style={[styles.fieldWrap, { zIndex }]}>
      <Pressable
        style={[
          styles.stationField,
          {
            backgroundColor: fieldBg,
            borderColor: focused ? PRIMARY_BLUE : "transparent",
            borderWidth: focused ? 2 : 0,
            opacity: editable ? 1 : 0.55,
          },
        ]}
        onPress={() => {
          if (!editable) return;
          setFocused(true);
          onFocusExtra?.();
          if (value.trim() || suggestions.length) {
            /* dropdown handled by input focus */
          }
        }}
      >
        <View style={styles.pinCircle}>
          <MaterialIcons name="location-on" size={18} color={PRIMARY_BLUE} />
        </View>
        <View style={styles.fieldTextWrap}>
          <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
          <TextInput
            style={[styles.fieldInput, { color: colors.text }]}
            placeholder={placeholder}
            placeholderTextColor={isDark ? "#888" : "#9aa3af"}
            value={value}
            editable={editable}
            onChangeText={(text) => {
              onChange(text);
            }}
            onFocus={() => {
              setFocused(true);
              onFocusExtra?.();
            }}
            onBlur={() => setFocused(false)}
          />
        </View>
        <MaterialIcons name="chevron-right" size={22} color="#b0b7c3" />
      </Pressable>
      {showDropdown && suggestions.length > 0 && (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: "#fff", borderColor: PRIMARY_BLUE },
          ]}
        >
          <ScrollView
            style={styles.dropdownScroll}
            nestedScrollEnabled
            keyboardShouldPersistTaps="always"
          >
            {suggestions.map((stationName) => {
              const bengaliName = getBengaliStationName(stationName);
              return (
                <Pressable
                  key={stationName}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    { backgroundColor: pressed ? "#e8f4ff" : "#fff" },
                  ]}
                  onPress={() => onSelect(stationName)}
                >
                  <ThemedText
                    style={[styles.dropdownItemText, { color: "#111" }]}
                  >
                    {stationName}
                  </ThemedText>
                  {bengaliName ? (
                    <ThemedText
                      style={[styles.dropdownItemTextBn, { color: "#666" }]}
                    >
                      {bengaliName}
                    </ThemedText>
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <ImageBackground
      source={require("@/assets/images/snowflakes.png")}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
    <ThemedView style={[styles.container, { backgroundColor: "transparent" }]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrap}>
          <View style={styles.hero}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.heroLogo}
              contentFit="contain"
            />
          </View>
        </View>

        <View style={[styles.searchCard, { backgroundColor: cardBg }]}>
          {renderStationField(
            "From / যাত্রা শুরু",
            "Select station",
            fromStation,
            (text) => {
              setFromStation(text);
              setShowFromDropdown(text.trim().length > 0);
              setShowToDropdown(false);
            },
            fromFocused,
            setFromFocused,
            showFromDropdown,
            filteredFromStations,
            handleFromStationSelect,
            3,
            true,
            () => {
              setShowToDropdown(false);
              if (fromStation.trim()) setShowFromDropdown(true);
            },
          )}

          <View style={styles.fieldDivider} />

          {renderStationField(
            "To / গন্তব্য",
            "Select station",
            toStation,
            (text) => {
              setToStation(text);
              setShowToDropdown(fromStation.trim().length > 0);
              setShowFromDropdown(false);
            },
            toFocused,
            setToFocused,
            showToDropdown && !!fromStation,
            filteredToStations,
            handleToStationSelect,
            2,
            !!fromStation,
            () => {
              setShowFromDropdown(false);
              if (fromStation.trim()) setShowToDropdown(true);
            },
          )}

          <Pressable
            style={({ pressed }) => [
              styles.searchButton,
              {
                backgroundColor: fromStation ? PRIMARY_BLUE : "#9bb7df",
                opacity: pressed && fromStation ? 0.85 : 1,
              },
            ]}
            onPress={handleSearchRoute}
            disabled={!fromStation}
          >
            <MaterialIcons name="search" size={20} color="#fff" />
            <ThemedText style={styles.searchButtonText}>
              View Trains
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.quickRow}>
          <QuickAction
            label="Train Schedule"
            labelBn="ট্রেন সময়সূচি"
            icon="train"
            bg="#E7F1FF"
            iconColor={PRIMARY_BLUE}
            onPress={() => router.push("/(tabs)/trains")}
          />
          <QuickAction
            label="Stations"
            labelBn="স্টেশন"
            icon="place"
            bg="#E6F7EA"
            iconColor={ACCENT_GREEN}
            onPress={() => router.push("/(tabs)/stations")}
          />
          <QuickAction
            label="Live Updates"
            labelBn="লাইভ আপডেট"
            icon="schedule"
            bg="#EFE8FF"
            iconColor="#7B5EA7"
            onPress={() => router.push("/(tabs)/live-tracking")}
          />
          <QuickAction
            label="Popular Routes"
            labelBn="জনপ্রিয় রুট"
            icon="star"
            bg="#FFE8D6"
            iconColor="#E07A2F"
            onPress={handlePopularRoutes}
          />
        </View>

        <AdPlaceholder />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Popular Trains
            </ThemedText>
            <Pressable onPress={() => router.push("/(tabs)/trains")}>
              <ThemedText style={styles.viewAllLink}>
                View All →
              </ThemedText>
            </Pressable>
          </View>
          {popularTrains.map((trainName) => {
            const cleanName = stripBracketContent(trainName);
            const trainNameBn =
              trainNameEnBnMapping[
                cleanName as keyof typeof trainNameEnBnMapping
              ];
            return (
              <Pressable
                key={trainName}
                style={({ pressed }) => [
                  styles.listCard,
                  { backgroundColor: cardBg, opacity: pressed ? 0.75 : 1 },
                ]}
                onPress={() => handleTrainPress(trainName)}
              >
                <View style={styles.listIconWrap}>
                  <MaterialIcons name="train" size={20} color={PRIMARY_BLUE} />
                </View>
                <View style={styles.listCardText}>
                  <ThemedText style={styles.listCardTitle}>
                    {cleanName}
                  </ThemedText>
                  {trainNameBn ? (
                    <ThemedText style={styles.listCardBn}>
                      {trainNameBn}
                    </ThemedText>
                  ) : null}
                </View>
                <ThemedText style={styles.listCardLink}>
                  View →
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <AdPlaceholder />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Major Stations
            </ThemedText>
            <Pressable onPress={() => router.push("/(tabs)/stations")}>
              <ThemedText style={styles.viewAllLink}>
                View All →
              </ThemedText>
            </Pressable>
          </View>
          <View style={styles.stationsGrid}>
            {majorStations.map((station) => {
              const stationBn = getBengaliStationName(station);
              return (
                <Pressable
                  key={station}
                  style={({ pressed }) => [
                    styles.stationCard,
                    { backgroundColor: cardBg, opacity: pressed ? 0.75 : 1 },
                  ]}
                  onPress={() => handleStationPress(station)}
                >
                  <MaterialIcons
                    name="location-on"
                    size={18}
                    color={ACCENT_GREEN}
                  />
                  <ThemedText style={styles.stationName}>{station}</ThemedText>
                  {stationBn ? (
                    <ThemedText style={styles.stationNameBn}>
                      {stationBn}
                    </ThemedText>
                  ) : null}
                <ThemedText style={styles.stationSubtext}>
                  View trains
                </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.disclaimerSection}>
          <ThemedText style={styles.disclaimerTitle}>
            About Our Data
          </ThemedText>
          <ThemedText style={styles.disclaimerText}>
            At Train Jatri, we are committed to providing accurate and
            up-to-date train schedule information. Our data is collected from
            official Bangladesh Railway sources.
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

function QuickAction({
  label,
  labelBn,
  icon,
  bg,
  iconColor,
  onPress,
}: {
  label: string;
  labelBn: string;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  bg: string;
  iconColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickItem,
        { opacity: pressed ? 0.75 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.quickCircle, { backgroundColor: bg }]}>
        <MaterialIcons name={icon} size={26} color={iconColor} />
      </View>
      <ThemedText style={styles.quickLabel}>{label}</ThemedText>
      <ThemedText style={styles.quickLabelBn}>{labelBn}</ThemedText>
    </Pressable>
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
  heroWrap: {
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  hero: {
    height: 280,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 28,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroLogo: {
    width: "120%",
    height: 300,
    transform: [{ scale: 0.75 }],
  },
  searchCard: {
    marginHorizontal: 16,
    marginTop: -42,
    borderRadius: 22,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 4,
  },
  fieldWrap: {
    position: "relative",
  },
  stationField: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E7F1FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  fieldTextWrap: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    color: "#8a94a6",
    fontWeight: "600",
  },
  fieldInput: {
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  fieldDivider: {
    height: 1,
    backgroundColor: "#eceff3",
    marginVertical: 8,
    marginLeft: 56,
  },
  dropdown: {
    position: "absolute",
    top: 64,
    left: 0,
    right: 0,
    borderWidth: 2,
    borderRadius: 12,
    maxHeight: 200,
    zIndex: 20,
    elevation: 12,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: "600",
  },
  dropdownItemTextBn: {
    fontSize: 13,
    marginTop: 2,
  },
  searchButton: {
    marginTop: 14,
    borderRadius: 14,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginTop: 22,
    marginBottom: 12,
  },
  quickItem: {
    width: "23%",
    alignItems: "center",
  },
  quickCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 14,
  },
  quickLabelBn: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.7,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  viewAllLink: {
    fontSize: 14,
    color: PRIMARY_BLUE,
    fontWeight: "700",
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  listIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E7F1FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  listCardText: {
    flex: 1,
  },
  listCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  listCardBn: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  listCardLink: {
    fontSize: 12,
    color: PRIMARY_BLUE,
    fontWeight: "700",
  },
  stationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  stationCard: {
    width: "48%",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  stationName: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
  },
  stationNameBn: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  stationSubtext: {
    fontSize: 12,
    opacity: 0.55,
    marginTop: 2,
  },
  disclaimerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 13,
    opacity: 0.75,
    lineHeight: 20,
  },
  lastUpdated: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 8,
  },
});
