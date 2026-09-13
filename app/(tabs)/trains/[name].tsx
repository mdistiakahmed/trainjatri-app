import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { BrandLogo } from "@/components/BrandLogo";
import { getDataForTrain } from "@/utils/getData";
import { trainNameEnBnMapping } from "@/utils/trainNameEnBnMapping";
import { cityEnBnMapping } from "@/utils/stationNameEnBnMapping";
import { BLUE_ACTIVE, Fonts } from "@/constants/theme";
import {
  isTrainSaved,
  saveTrainToQuickAccess,
  removeTrainFromQuickAccess,
} from "@/utils/quickAccessStorage";
import AdPlaceholder from "@/components/ads/AdPlaceholder";
import { TrainBackButton } from "@/components/navigation/TrainBackButton";

const TEXT = "#11181C";
const MUTED = "#6b7280";
const CARD = "#ffffff";
const PAGE_BG = "#f7f8fa";
const TABLE_HEADER = "#f5f5f5";
const TABLE_ZEBRA = "#fafafa";
const FIELD_BG = "#f5f5f5";

interface Route {
  city: string;
  arrival_time: string | null;
  departure_time: string | null;
  halt: string | null;
  duration: string | null;
  station_name_bangali?: string;
}

interface TrainDirection {
  path: string;
  days: string[];
  routes: Route[];
  total_duration: string;
  train_name: string;
  train_number: number;
  train_name_bn?: string;
}

interface TrainData {
  forward?: TrainDirection;
  reverse?: TrainDirection;
  forward_2?: TrainDirection;
  reverse_2?: TrainDirection;
}

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const banglaDaysOfWeek = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];
const shortDaysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TrainDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const navigation = useNavigation();
  const [trainData, setTrainData] = useState<TrainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"forward" | "reverse">("forward");

  useEffect(() => {
    loadTrainData();
    checkIfSaved();
  }, [name]);

  const checkIfSaved = async () => {
    const saved = await isTrainSaved(name);
    setIsSaved(saved);
  };

  const handleBookmark = async () => {
    if (!trainData) return;

    const activeRoute = trainData.forward ?? trainData.reverse;
    const trainName = activeRoute?.train_name ?? "";

    if (isSaved) {
      await removeTrainFromQuickAccess(name);
      setIsSaved(false);
    } else {
      await saveTrainToQuickAccess({
        name: trainName,
        slug: name,
      });
      setIsSaved(true);
    }
  };

  useEffect(() => {
    if (trainData) {
      const activeRoute = trainData.forward ?? trainData.reverse;
      const trainName = activeRoute?.train_name ?? "";

      navigation.setOptions({
        title: trainName || "Train Details",
      });
    }
  }, [trainData, navigation]);

  const loadTrainData = async () => {
    try {
      setLoading(true);
      const data = await getDataForTrain(name);
      setTrainData(data);
    } catch (error) {
      console.error("Error loading train data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOffDay = (days: string[]) => {
    if (!days) return null;
    const offDayIndex = shortDaysOfWeek.findIndex((day) => !days.includes(day));
    if (offDayIndex !== -1) {
      return `${daysOfWeek[offDayIndex]} (${banglaDaysOfWeek[offDayIndex]})`;
    }
    return "কোন বন্ধের দিন নেই";
  };

  const renderStationName = (route: Route) => {
    const stationNameBangali =
      route.station_name_bangali ||
      cityEnBnMapping[route.city as keyof typeof cityEnBnMapping] ||
      "";

    return (
      <View style={styles.stationCell}>
        <Text style={styles.stationName}>
          {route.city.replace(/_/g, " ")}
        </Text>
        {stationNameBangali ? (
          <Text style={styles.stationNameBn}>
            {stationNameBangali}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderRouteTable = (direction: TrainDirection) => {
    const offDay = getOffDay(direction.days);

    return (
      <View style={styles.routeSection}>
        <Text style={styles.routePath}>{direction.path}</Text>
        <Text style={styles.offDay}>বন্ধের দিন: {offDay}</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.stationColumn]}>
              Station
            </Text>
            <Text style={[styles.tableHeaderText, styles.timeColumn]}>
              Arrival
            </Text>
            <Text style={[styles.tableHeaderText, styles.timeColumn]}>
              Departure
            </Text>
          </View>

          {direction.routes.map((route, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 1 && styles.tableRowAlt,
              ]}
            >
              <View style={styles.stationColumn}>
                {renderStationName(route)}
              </View>
              <Text style={[styles.tableCell, styles.timeColumn]}>
                {route.arrival_time
                  ? route.arrival_time.replace(" BST", "")
                  : "-"}
              </Text>
              <Text style={[styles.tableCell, styles.timeColumn]}>
                {route.departure_time
                  ? route.departure_time.replace(" BST", "")
                  : "-"}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("@/assets/images/snowflakes.png")}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View
          style={[styles.container, { backgroundColor: "transparent" }]}
        >
          <View style={styles.loadingContainer}>
            <View style={styles.buttonSection}>
              <TrainBackButton />
            </View>
            <ActivityIndicator size="large" color={BLUE_ACTIVE} />
          </View>
        </View>
      </ImageBackground>
    );
  }

  if (!trainData) {
    return (
      <ImageBackground
        source={require("@/assets/images/snowflakes.png")}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View
          style={[styles.container, { backgroundColor: "transparent" }]}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.notFoundText}>Train data not found.</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  const activeRoute = trainData.forward ?? trainData.reverse;
  const trainName = activeRoute?.train_name ?? "";
  const trainNameBn =
    activeRoute?.train_name_bn ||
    trainNameEnBnMapping[trainName as keyof typeof trainNameEnBnMapping] ||
    "";

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
            <TrainBackButton />
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
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { fontFamily: Fonts.rounded }]}>
                {trainName} Train Schedule
              </Text>
              {trainNameBn && (
                <Text style={styles.titleBn}>
                  {trainNameBn} ট্রেনের সময়সূচী
                </Text>
              )}
            </View>
          </View>

          <AdPlaceholder />

          {/* Tabs for trains with both forward and reverse routes */}
          {trainData.forward && trainData.reverse ? (
            <View style={styles.tabContainer}>
              <View style={styles.tabButtons}>
                <Pressable
                  style={[
                    styles.tabButton,
                    activeTab === "forward" && styles.tabButtonActive,
                  ]}
                  onPress={() => setActiveTab("forward")}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      activeTab === "forward" && styles.tabButtonTextActive,
                    ]}
                  >
                    {trainData.forward.path}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.tabButton,
                    activeTab === "reverse" && styles.tabButtonActive,
                  ]}
                  onPress={() => setActiveTab("reverse")}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      activeTab === "reverse" && styles.tabButtonTextActive,
                    ]}
                  >
                    {trainData.reverse.path}
                  </Text>
                </Pressable>
              </View>

              {activeTab === "forward" && renderRouteTable(trainData.forward)}
              {activeTab === "reverse" && renderRouteTable(trainData.reverse)}
            </View>
          ) : (
            <>
              {trainData.forward && renderRouteTable(trainData.forward)}
              {trainData.reverse && renderRouteTable(trainData.reverse)}
              {trainData.forward_2 && renderRouteTable(trainData.forward_2)}
              {trainData.reverse_2 && renderRouteTable(trainData.reverse_2)}
            </>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    alignItems: "center",
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoWrap: {
    marginBottom: 12,
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    textTransform: "capitalize",
    color: TEXT,
  },
  titleBn: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: MUTED,
  },
  notFoundText: {
    fontSize: 16,
    color: TEXT,
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
  tabContainer: {
    marginTop: 10,
  },
  tabButtons: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    padding: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: BLUE_ACTIVE,
    shadowColor: BLUE_ACTIVE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  tabButtonTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  routeSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  routePath: {
    fontSize: 20,
    fontWeight: "bold",
    color: BLUE_ACTIVE,
    textAlign: "center",
    marginBottom: 4,
  },
  offDay: {
    fontSize: 16,
    color: "#fe1226",
    textAlign: "center",
    marginBottom: 16,
  },
  table: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: CARD,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: TABLE_HEADER,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    color: TEXT,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: CARD,
  },
  tableRowAlt: {
    backgroundColor: TABLE_ZEBRA,
  },
  stationColumn: {
    flex: 2,
    paddingHorizontal: 8,
  },
  timeColumn: {
    flex: 1,
    textAlign: "center",
  },
  tableCell: {
    fontSize: 12,
    color: TEXT,
  },
  stationCell: {
    flexDirection: "column",
  },
  stationName: {
    fontSize: 12,
    fontWeight: "500",
    color: TEXT,
  },
  stationNameBn: {
    fontSize: 10,
    color: MUTED,
    marginTop: 2,
  },
});
