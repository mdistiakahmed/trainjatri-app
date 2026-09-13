import React, { useMemo, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ImageBackground,
  Keyboard,
} from "react-native";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { BrandLogo } from "@/components/BrandLogo";
import { formatStationName, getRoutesForStation } from "@/utils/stationsData";
import { cityEnBnMapping } from "@/utils/stationNameEnBnMapping";
import {
  createRouteUrlSlugFromStations,
  formatStationNameForUrl,
} from "@/utils/stringutils";
import { BLUE_ACTIVE, Fonts } from "@/constants/theme";
import {
  isStationSaved,
  saveStationToQuickAccess,
  removeStationFromQuickAccess,
} from "@/utils/quickAccessStorage";
import AdPlaceholder from "@/components/ads/AdPlaceholder";
import { SmartBackButton } from "@/components/navigation/SmartBackButton";

const TEXT = "#11181C";
const MUTED = "#6b7280";
const CARD = "#ffffff";
const PAGE_BG = "#f7f8fa";
const FIELD_BG = "#f5f5f5";
const PLACEHOLDER = "#9aa3af";
const BORDER = "#111111";

const stationNameToMappingKey = (name: string) =>
  name.trim().replace(/\s+/g, "_");

const getBengaliStationName = (englishName: string) => {
  const bn =
    cityEnBnMapping[englishName as keyof typeof cityEnBnMapping] ||
    cityEnBnMapping[
      stationNameToMappingKey(englishName) as keyof typeof cityEnBnMapping
    ];
  return bn || "";
};

export default function StationDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const stationName = useMemo(() => formatStationName(name || ""), [name]);
  const routes = useMemo(() => getRoutesForStation(stationName), [stationName]);
  const stationNameBn = useMemo(
    () => getBengaliStationName(stationName),
    [stationName],
  );

  useEffect(() => {
    navigation.setOptions({ title: `${stationName} Station` });
    checkIfSaved();

    // Keyboard listeners
    const keyboardWillShow = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardWillHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [stationName, navigation]);

  const checkIfSaved = async () => {
    const saved = await isStationSaved(name);
    setIsSaved(saved);
  };

  const handleBookmark = async () => {
    if (isSaved) {
      await removeStationFromQuickAccess(name);
      setIsSaved(false);
    } else {
      await saveStationToQuickAccess({
        name: stationName,
        slug: name,
      });
      setIsSaved(true);
    }
  };

  const availableDestinations = useMemo(
    () => routes.map((route) => route.route.split(" - ")[1]),
    [routes],
  );

  const filteredRoutes = routes.filter((route) => {
    const destination = route.route.split(" - ")[1];
    const destinationBn = getBengaliStationName(destination);
    const query = searchQuery.toLowerCase();
    return (
      destination.toLowerCase().includes(query) ||
      (destinationBn && destinationBn.includes(searchQuery))
    );
  });

  const handleDestinationPress = (destination: string) => {
    const slug = createRouteUrlSlugFromStations(stationName, destination);
    const stationSlug = formatStationNameForUrl(stationName);
    router.push(`/(tabs)/stations/${stationSlug}/${slug}` as any);
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
          style={styles.mainScrollView}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.buttonSection}>
            <SmartBackButton fallbackRoute="/(tabs)/stations" />
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                isSaved ? styles.saveButtonSaved : styles.saveButtonUnsaved,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={handleBookmark}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  isSaved
                    ? styles.saveButtonTextSaved
                    : styles.saveButtonTextUnsaved,
                ]}
              >
                {isSaved ? "⭐ " : "☆ "}
                {isSaved ? "Saved to Quick Access" : "Save to Quick Access"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <BrandLogo />
            </View>
            <Text style={[styles.title, { fontFamily: Fonts.rounded }]}>
              {stationName} Station
            </Text>
            {stationNameBn && (
              <Text style={styles.titleBn}>
                {stationNameBn} স্টেশন
              </Text>
            )}
            <Text style={styles.subtitle}>
              {routes.length} train route{routes.length !== 1 ? "s" : ""}{" "}
              available
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={[
                styles.searchInput,
                { borderColor: isSearchFocused ? BLUE_ACTIVE : BORDER },
              ]}
              placeholder="Search destination / গন্তব্য সার্চ করুন"
              placeholderTextColor={PLACEHOLDER}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </View>

          <AdPlaceholder />

          <View style={styles.routesList}>
            {filteredRoutes.length > 0 ? (
              filteredRoutes.map((route, index) => {
                const [from, to] = route.route.split(" - ");
                const toBengali = getBengaliStationName(to);

                return (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [
                      styles.routeCard,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() => handleDestinationPress(to)}
                  >
                    <View style={styles.routeInfo}>
                      <View style={styles.routeHeader}>
                        <Text style={styles.fromStation}>
                          {from}
                        </Text>
                        <Text style={styles.arrow}>→</Text>
                        <Text style={styles.toStation}>{to}</Text>
                      </View>
                      {toBengali && (
                        <Text style={styles.routeBengali}>
                          {getBengaliStationName(from)} থেকে {toBengali}
                        </Text>
                      )}
                      <Text style={styles.routeDescription}>
                        Tap to view train schedule
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No routes found matching your search.
                </Text>
              </View>
            )}
          </View>
          <View
            style={{ height: keyboardHeight > 0 ? keyboardHeight + 40 : 40 }}
          />
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
  scrollViewContent: {
    flexGrow: 1,
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  saveButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BLUE_ACTIVE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButtonSaved: {
    backgroundColor: BLUE_ACTIVE,
  },
  saveButtonUnsaved: {
    backgroundColor: FIELD_BG,
  },
  saveButtonText: {
    fontSize: 9,
    fontWeight: "600",
  },
  saveButtonTextSaved: {
    color: "#fff",
  },
  saveButtonTextUnsaved: {
    color: TEXT,
  },
  header: {
    paddingTop: 10,
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
  titleBn: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: MUTED,
    marginBottom: 8,
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
    borderWidth: 3,
    backgroundColor: FIELD_BG,
    color: TEXT,
  },
  scrollView: {
    flex: 1,
  },
  routesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  routeCard: {
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
  routeInfo: {
    flexDirection: "column",
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  fromStation: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT,
  },
  arrow: {
    fontSize: 16,
    marginHorizontal: 8,
    color: MUTED,
  },
  toStation: {
    fontSize: 16,
    fontWeight: "600",
    color: BLUE_ACTIVE,
  },
  routeBengali: {
    fontSize: 14,
    marginBottom: 6,
    color: MUTED,
  },
  routeDescription: {
    fontSize: 12,
    color: MUTED,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: MUTED,
    textAlign: "center",
  },
});
