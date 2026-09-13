import React, { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  ImageBackground,
} from "react-native";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { BrandLogo } from "@/components/BrandLogo";
import {
  parseRouteUrlSlug,
  formatStationNameForUrl,
} from "@/utils/stringutils";
import { getTrainsForRoute } from "@/utils/routeData";
import { cityEnBnMapping } from "@/utils/stationNameEnBnMapping";
import { BLUE_ACTIVE, Fonts } from "@/constants/theme";
import {
  isRouteSaved,
  saveRouteToQuickAccess,
  removeRouteFromQuickAccess,
} from "@/utils/quickAccessStorage";
import AdPlaceholder from "@/components/ads/AdPlaceholder";
import { SmartBackButton } from "@/components/navigation/SmartBackButton";

const TEXT = "#11181C";
const MUTED = "#6b7280";
const CARD = "#ffffff";
const PAGE_BG = "#f7f8fa";
const FIELD_BG = "#f5f5f5";

const stationNameToMappingKey = (name: string) =>
  name.trim().replace(/\s+/g, "_");

const getBengaliStationName = (englishName: string) =>
  cityEnBnMapping[
    stationNameToMappingKey(englishName) as keyof typeof cityEnBnMapping
  ] || "";

const getDayName = (day: string): string => {
  const days: Record<string, string> = {
    Sun: "Sunday",
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
  };
  return days[day] || day;
};

const getDayNameBengali = (day: string): string => {
  const daysBn: Record<string, string> = {
    Sun: "রবিবার",
    Mon: "সোমবার",
    Tue: "মঙ্গলবার",
    Wed: "বুধবার",
    Thu: "বৃহস্পতিবার",
    Fri: "শুক্রবার",
    Sat: "শনিবার",
  };
  return daysBn[day] || day;
};

const getOffDays = (
  operatingDays: string[],
): { english: string; bengali: string } => {
  const allDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const offDays = allDays.filter((day) => !operatingDays.includes(day));

  if (offDays.length === 0) {
    return {
      english: "None (Daily)",
      bengali: "সপ্তাহের প্রতিদিন চলে",
    };
  }

  return {
    english: offDays.map(getDayName).join(", "),
    bengali: offDays.map(getDayNameBengali).join(", "),
  };
};

const parseTime = (timeString: string): number => {
  // Parse time like "10:30 AM BST" or "10:30 AM" to minutes since midnight
  const cleanTime = timeString.replace(" BST", "").trim();
  const match = cleanTime.match(/(\d+):(\d+)\s*(AM|PM)/i);

  if (!match) return 0;

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
};

export default function RouteDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [trains, setTrains] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  const stations = useMemo(
    () => (slug ? parseRouteUrlSlug(slug) : null),
    [slug],
  );

  useEffect(() => {
    if (stations) {
      navigation.setOptions({ title: `${stations.from} to ${stations.to}` });
      loadTrains();
      checkIfSaved();
    }
  }, [slug]);

  const checkIfSaved = async () => {
    if (!slug) return;
    const saved = await isRouteSaved(slug);
    setIsSaved(saved);
  };

  const handleBookmark = async () => {
    if (!stations || !slug) return;

    if (isSaved) {
      await removeRouteFromQuickAccess(slug);
      setIsSaved(false);
    } else {
      await saveRouteToQuickAccess({
        from: stations.from,
        to: stations.to,
        slug: slug,
      });
      setIsSaved(true);
    }
  }; // Use slug instead of stations to avoid infinite loop

  const handleViewTrainSchedule = (trainName: string) => {
    const trainSlug = trainName.toLowerCase().replace(/\s+/g, "-");
    const currentRoute = `/(tabs)/stations/${stations?.from ? formatStationNameForUrl(stations.from) : ""}/${slug}`;
    router.push({
      pathname: `/(tabs)/trains/${trainSlug}` as any,
      params: { from: "station-route", returnTo: currentRoute },
    });
  };

  const loadTrains = async () => {
    if (!stations) return;

    try {
      setLoading(true);
      const trainsData = await getTrainsForRoute(stations.from, stations.to);

      // Sort trains by departure time
      const sortedTrains = trainsData.sort((a, b) => {
        const timeA = parseTime(a.departure_from_source);
        const timeB = parseTime(b.departure_from_source);
        return timeA - timeB;
      });

      setTrains(sortedTrains);
    } catch (error) {
      console.error("Error loading trains:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!stations) {
    return (
      <View style={[styles.container, styles.fallbackScreen]}>
        <View style={styles.centerContainer}>
          <Text style={styles.fallbackText}>Invalid route</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.fallbackScreen]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={BLUE_ACTIVE} />
          <Text style={styles.loadingText}>Loading train schedules...</Text>
        </View>
      </View>
    );
  }

  const fromBengali = getBengaliStationName(stations.from);
  const toBengali = getBengaliStationName(stations.to);

  return (
    <ImageBackground
      source={require("@/assets/images/snowflakes.png")}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <View
        style={[styles.container, { backgroundColor: "transparent" }]}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.buttonSection}>
            <SmartBackButton
              fallbackRoute={
                stations?.from
                  ? (`/(tabs)/stations/${formatStationNameForUrl(stations.from)}` as any)
                  : "/(tabs)/stations"
              }
            />
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
              {stations.from} to {stations.to}
            </Text>
            <Text style={styles.subtitle}>Train Schedule</Text>
            {(fromBengali || toBengali) && (
              <Text style={styles.titleBn}>
                {fromBengali || stations.from} থেকে {toBengali || stations.to}{" "}
                ট্রেনের সময়সূচী
              </Text>
            )}
            <Text style={styles.trainCount}>
              {trains.length} train{trains.length !== 1 ? "s" : ""} available
            </Text>
          </View>

          <AdPlaceholder />

          {trains.length > 0 ? (
            <View style={styles.trainsList}>
              {trains.map((train, index) => (
                <View key={index} style={styles.trainCard}>
                  <View style={styles.trainHeader}>
                    <View style={styles.trainNameContainer}>
                      <Text style={styles.trainName}>
                        {train.train_name}
                      </Text>
                      <Pressable
                        style={styles.viewDetailsButton}
                        onPress={() =>
                          handleViewTrainSchedule(train.train_name)
                        }
                      >
                        <Text style={styles.viewDetailsText}>
                          View Details
                        </Text>
                        <Text style={styles.viewDetailsIcon}>
                          ↗
                        </Text>
                      </Pressable>
                    </View>
                    <Text style={styles.trainNumber}>
                      #{train.train_number}
                    </Text>
                  </View>

                  <View style={styles.timeRow}>
                    <View style={styles.timeBox}>
                      <Text style={styles.timeLabel}>
                        Departure
                      </Text>
                      <Text style={styles.timeValue}>
                        {train.departure_from_source.replace(" BST", "")}
                      </Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                    <View style={styles.timeBox}>
                      <Text style={styles.timeLabel}>Arrival</Text>
                      <Text style={styles.timeValue}>
                        {train.arrival_at_destination.replace(" BST", "")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>
                        Duration
                      </Text>
                      <Text style={styles.detailValue}>
                        {train.journey_duration}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>
                        Off Day
                      </Text>
                      <Text style={styles.detailValue}>
                        {getOffDays(train.days).english}
                      </Text>
                      <Text style={styles.detailValueBn}>
                        {getOffDays(train.days).bengali}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No direct trains found for this route.
              </Text>
              <Text style={styles.emptySubtext}>
                You may need to take connecting trains.
              </Text>
            </View>
          )}

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
  fallbackScreen: {
    backgroundColor: PAGE_BG,
  },
  fallbackText: {
    fontSize: 16,
    color: TEXT,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: MUTED,
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    alignItems: "center",
  },
  logoWrap: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
    color: TEXT,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: MUTED,
    marginBottom: 8,
  },
  titleBn: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: MUTED,
    marginBottom: 8,
  },
  trainCount: {
    fontSize: 14,
    textAlign: "center",
    color: MUTED,
    fontWeight: "600",
  },
  trainsList: {
    paddingHorizontal: 20,
  },
  trainCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: CARD,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  trainNameContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  trainName: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
    marginTop: -2,
  },
  viewDetailsText: {
    fontSize: 9,
    color: BLUE_ACTIVE,
    fontWeight: "600",
  },
  viewDetailsIcon: {
    fontSize: 12,
    color: BLUE_ACTIVE,
    marginLeft: 2,
  },
  trainNumber: {
    fontSize: 14,
    color: MUTED,
    fontWeight: "600",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(24, 119, 242, 0.05)",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  timeBox: {
    flex: 1,
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: "700",
    color: BLUE_ACTIVE,
  },
  arrow: {
    fontSize: 24,
    marginHorizontal: 12,
    color: MUTED,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT,
  },
  detailValueBn: {
    fontSize: 11,
    fontWeight: "500",
    color: MUTED,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: MUTED,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: MUTED,
    textAlign: "center",
  },
});
