import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getDataForTrain } from "@/utils/getData";
import { trainNameEnBnMapping } from "@/utils/trainNameEnBnMapping";
import { cityEnBnMapping } from "@/utils/stationNameEnBnMapping";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { Fonts } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  isTrainSaved,
  saveTrainToQuickAccess,
  removeTrainFromQuickAccess,
} from "@/utils/quickAccessStorage";
import AdPlaceholder from "@/components/ads/AdPlaceholder";

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
  const { name, returnTo } = useLocalSearchParams<{ name: string; returnTo?: string }>();
  const navigation = useNavigation();
  const [trainData, setTrainData] = useState<TrainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'forward' | 'reverse'>('forward');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

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
        headerLeft: () => (
          <Pressable
            onPress={() => {
              if (returnTo) {
                router.push(returnTo as any);
              } else {
                router.back();
              }
            }}
            style={{ marginLeft: 8 }}
          >
            <IconSymbol name="chevron.left" size={24} color="#007AFF" />
          </Pressable>
        ),
      });
    }
  }, [trainData, navigation, returnTo]);

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
        <ThemedText style={styles.stationName}>
          {route.city.replace(/_/g, " ")}
        </ThemedText>
        {stationNameBangali ? (
          <ThemedText style={styles.stationNameBn}>
            {stationNameBangali}
          </ThemedText>
        ) : null}
      </View>
    );
  };

  const renderRouteTable = (direction: TrainDirection) => {
    const offDay = getOffDay(direction.days);

    return (
      <View
        style={[styles.routeSection, { backgroundColor: colors.background }]}
      >
        <ThemedText style={styles.routePath}>{direction.path}</ThemedText>
        <ThemedText style={styles.offDay}>বন্ধের দিন: {offDay}</ThemedText>

        <View
          style={[
            styles.table,
            { backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#fff" },
          ]}
        >
          <View
            style={[
              styles.tableHeader,
              {
                backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#f5f5f5",
              },
            ]}
          >
            <ThemedText style={[styles.tableHeaderText, styles.stationColumn]}>
              Station
            </ThemedText>
            <ThemedText style={[styles.tableHeaderText, styles.timeColumn]}>
              Arrival
            </ThemedText>
            <ThemedText style={[styles.tableHeaderText, styles.timeColumn]}>
              Departure
            </ThemedText>
          </View>

          {direction.routes.map((route, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 1 && {
                  backgroundColor: colorScheme === "dark" ? "#222" : "#fafafa",
                },
              ]}
            >
              <View style={styles.stationColumn}>
                {renderStationName(route)}
              </View>
              <ThemedText style={[styles.tableCell, styles.timeColumn]}>
                {route.arrival_time
                  ? route.arrival_time.replace(" BST", "")
                  : "-"}
              </ThemedText>
              <ThemedText style={[styles.tableCell, styles.timeColumn]}>
                {route.departure_time
                  ? route.departure_time.replace(" BST", "")
                  : "-"}
              </ThemedText>
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
        <ThemedView
          style={[styles.container, { backgroundColor: "transparent" }]}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        </ThemedView>
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
        <ThemedView
          style={[styles.container, { backgroundColor: "transparent" }]}
        >
          <View style={styles.loadingContainer}>
            <ThemedText>Train data not found.</ThemedText>
          </View>
        </ThemedView>
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
      <ThemedView
        style={[styles.container, { backgroundColor: "transparent" }]}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.buttonSection}>
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                {
                  backgroundColor: isSaved
                    ? "#1877F2"
                    : colorScheme === "dark"
                    ? "#2a2a2a"
                    : "#f5f5f5",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={handleBookmark}
            >
              <ThemedText
                style={[
                  styles.saveButtonText,
                  { color: isSaved ? "#fff" : colors.text },
                ]}
              >
                {isSaved ? "⭐ " : "☆ "}
                {isSaved ? "Saved to Quick Access" : "Save to Quick Access"}
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.header}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              contentFit="contain"
            />
            <View style={styles.titleContainer}>
              <ThemedText style={[styles.title, { fontFamily: Fonts.rounded }]}>
                {trainName} Train Schedule
              </ThemedText>
              {trainNameBn && (
                <ThemedText style={styles.titleBn}>
                  {trainNameBn} ট্রেনের সময়সূচী
                </ThemedText>
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
                    activeTab === 'forward' && styles.tabButtonActive,
                  ]}
                  onPress={() => setActiveTab('forward')}
                >
                  <ThemedText
                    style={[
                      styles.tabButtonText,
                      activeTab === 'forward' && styles.tabButtonTextActive,
                    ]}
                  >
                    {trainData.forward.path}
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={[
                    styles.tabButton,
                    activeTab === 'reverse' && styles.tabButtonActive,
                  ]}
                  onPress={() => setActiveTab('reverse')}
                >
                  <ThemedText
                    style={[
                      styles.tabButtonText,
                      activeTab === 'reverse' && styles.tabButtonTextActive,
                    ]}
                  >
                    {trainData.reverse.path}
                  </ThemedText>
                </Pressable>
              </View>
              
              {activeTab === 'forward' && renderRouteTable(trainData.forward)}
              {activeTab === 'reverse' && renderRouteTable(trainData.reverse)}
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
    alignItems: "flex-end",
  },
  logo: {
    width: 150,
    height: 75,
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
  },
  titleBn: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.8,
  },
  saveButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#1877F2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 9,
    fontWeight: "600",
  },
  tabContainer: {
    marginTop: 10,
  },
  tabButtons: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#1877F2',
    shadowColor: '#1877F2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  tabButtonTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  routeSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  routePath: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#046ce6",
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
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
  },
  stationCell: {
    flexDirection: "column",
  },
  stationName: {
    fontSize: 12,
    fontWeight: "500",
  },
  stationNameBn: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 2,
  },
});
