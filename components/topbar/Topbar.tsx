import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
  Modal,
  ScrollView,
  Linking,
  Animated,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  getSavedTrains,
  getSavedStations,
  getSavedRoutes,
  getSavedLiveTrackings,
  SavedTrain,
  SavedStation,
  SavedRoute,
  SavedLiveTracking,
} from "@/utils/quickAccessStorage";
import { BLUE_ACTIVE } from "@/constants/theme";

export default function Topbar() {
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const [savedTrains, setSavedTrains] = useState<SavedTrain[]>([]);
  const [savedStations, setSavedStations] = useState<SavedStation[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [savedLiveTrackings, setSavedLiveTrackings] = useState<
    SavedLiveTracking[]
  >([]);

  const loadSavedItems = async () => {
    const trains = await getSavedTrains();
    const stations = await getSavedStations();
    const routes = await getSavedRoutes();
    const liveTrackings = await getSavedLiveTrackings();
    setSavedTrains(trains);
    setSavedStations(stations);
    setSavedRoutes(routes);
    setSavedLiveTrackings(liveTrackings);
  };

  useFocusEffect(
    React.useCallback(() => {
      if (menuVisible) {
        loadSavedItems();
      }
    }, [menuVisible]),
  );

  useEffect(() => {
    loadSavedItems();
  }, []); // Start off-screen to the left

  useEffect(() => {
    if (menuVisible) {
      // Slide in from left
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out to left
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [menuVisible]);

  const handleLogoPress = () => {
    // Use navigate to go to home tab root and clear history
    router.navigate("/(tabs)");
  };

  const handleShareFeedback = () => {
    setMenuVisible(false);
    // Open email client for feedback
    const email = "randzyx62@gmail.com";
    const subject = "Feedback for Train Jatri App";
    const body = "Please share your feedback here...";
    Linking.openURL(
      `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  };

  return (
    <>
      <View style={styles.container}>
        <Pressable
          onPress={() => setMenuVisible(true)}
          style={({ pressed }) => [
            styles.hamburgerButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.hamburgerIcon}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </View>
        </Pressable>

        <Pressable
          onPress={handleLogoPress}
          style={({ pressed }) => [
            styles.logoContainer,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={styles.logoMain}>TrainJatri</Text>
          <Text style={styles.logoDomain}>.com</Text>
        </Pressable>

        <View style={styles.placeholder} />
      </View>

      {/* Side Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <Animated.View
            style={[
              styles.menuContainer,
              {
                backgroundColor: "#ffffff",
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <Pressable style={{ flex: 1 }} onPress={(e) => e.stopPropagation()}>
              <View style={styles.menuHeader}>
                <View style={styles.menuLogoContainer}>
                  <Text style={styles.menuLogoMain}>
                    TrainJatri
                  </Text>
                  <Text style={styles.menuLogoDomain}>.com</Text>
                </View>
                <Pressable
                  onPress={() => setMenuVisible(false)}
                  style={({ pressed }) => [
                    styles.closeButton,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </Pressable>
              </View>

              <ScrollView style={styles.menuContent}>
                <Pressable
                  style={({ pressed }) => [
                    styles.menuItem,
                    {
                      backgroundColor: pressed
                        ? "#f5f5f5"
                        : "transparent",
                    },
                  ]}
                  onPress={handleShareFeedback}
                >
                  <Text style={styles.menuItemText}>
                    📝 Share Feedback
                  </Text>
                </Pressable>

                <View style={styles.menuDivider} />

                {/* Quick Access Section */}
                <View style={styles.quickAccessSection}>
                  <Text style={styles.sectionTitle}>
                    Quick Access
                  </Text>
                  <View style={styles.sectionDivider} />

                  {/* Saved Trains */}
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>
                      🚂 Saved Trains
                    </Text>
                    <View style={styles.subSectionDivider} />
                    {savedTrains.length > 0 ? (
                      savedTrains.map((train) => (
                        <Pressable
                          key={train.slug}
                          style={({ pressed }) => [
                            styles.quickAccessItem,
                            {
                              backgroundColor: pressed
                                ? "#f5f5f5"
                                : "transparent",
                            },
                          ]}
                          onPress={() => {
                            setMenuVisible(false);
                            router.push(`/(tabs)/trains/${train.slug}` as any);
                          }}
                        >
                          <Text style={styles.quickAccessItemText}>
                            {train.name}
                          </Text>
                        </Pressable>
                      ))
                    ) : (
                      <Text style={styles.emptySubsectionText}>
                        No saved trains yet
                      </Text>
                    )}
                  </View>

                  {/* Saved Stations */}
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>
                      📍 Saved Stations
                    </Text>
                    <View style={styles.subSectionDivider} />
                    {savedStations.length > 0 ? (
                      savedStations.map((station) => (
                        <Pressable
                          key={station.slug}
                          style={({ pressed }) => [
                            styles.quickAccessItem,
                            {
                              backgroundColor: pressed
                                ? "#f5f5f5"
                                : "transparent",
                            },
                          ]}
                          onPress={() => {
                            setMenuVisible(false);
                            router.push(
                              `/(tabs)/stations/${station.slug}` as any,
                            );
                          }}
                        >
                          <Text style={styles.quickAccessItemText}>
                            {station.name}
                          </Text>
                        </Pressable>
                      ))
                    ) : (
                      <Text style={styles.emptySubsectionText}>
                        No saved stations yet
                      </Text>
                    )}
                  </View>

                  {/* Saved Routes */}
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>
                      🛤️ Saved Routes
                    </Text>
                    <View style={styles.subSectionDivider} />
                    {savedRoutes.length > 0 ? (
                      savedRoutes.map((route) => (
                        <Pressable
                          key={route.slug}
                          style={({ pressed }) => [
                            styles.quickAccessItem,
                            {
                              backgroundColor: pressed
                                ? "#f5f5f5"
                                : "transparent",
                            },
                          ]}
                          onPress={() => {
                            setMenuVisible(false);
                            const stationSlug = route.from
                              .toLowerCase()
                              .replace(/\s+/g, "-");
                            router.push(
                              `/(tabs)/stations/${stationSlug}/${route.slug}` as any,
                            );
                          }}
                        >
                          <Text style={styles.quickAccessItemText}>
                            {route.from} → {route.to}
                          </Text>
                        </Pressable>
                      ))
                    ) : (
                      <Text style={styles.emptySubsectionText}>
                        No saved routes yet
                      </Text>
                    )}
                  </View>

                  {/* Saved Live Tracking */}
                  <View style={styles.subSection}>
                    <Text style={styles.subSectionTitle}>
                      📍 Live Tracking
                    </Text>
                    <View style={styles.subSectionDivider} />
                    {savedLiveTrackings.length > 0 ? (
                      savedLiveTrackings.map((tracking) => (
                        <Pressable
                          key={tracking.trainName}
                          style={({ pressed }) => [
                            styles.quickAccessItem,
                            {
                              backgroundColor: pressed
                                ? "#f5f5f5"
                                : "transparent",
                            },
                          ]}
                          onPress={() => {
                            setMenuVisible(false);
                            router.push(
                              `/(tabs)/live-tracking?trainName=${encodeURIComponent(tracking.trainName)}` as any,
                            );
                          }}
                        >
                          <Text style={styles.quickAccessItemText}>
                            {tracking.trainName}
                          </Text>
                          {tracking.trainNameBn && (
                            <Text style={styles.quickAccessItemSubtext}>
                              {tracking.trainNameBn}
                            </Text>
                          )}
                        </Pressable>
                      ))
                    ) : (
                      <Text style={styles.emptySubsectionText}>
                        No saved live tracking yet
                      </Text>
                    )}
                  </View>
                </View>
              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderBottomColor: "#e5e5e5",
    height: Platform.OS === "ios" ? 100 : 80,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  hamburgerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  hamburgerIcon: {
    width: 24,
    height: 18,
    justifyContent: "space-between",
  },
  hamburgerLine: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#11181C",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  logoMain: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
  },
  logoDomain: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 2,
  },
  placeholder: {
    width: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },
  menuContainer: {
    backgroundColor: "#ffffff",
    width: "80%",
    maxWidth: 300,
    height: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  menuLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuLogoMain: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc2626",
  },
  menuLogoDomain: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6b7280",
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "300",
    color: "#11181C",
  },
  menuContent: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  disabledMenuItem: {
    opacity: 0.5,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#11181C",
  },
  disabledText: {
    opacity: 0.6,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginVertical: 16,
    marginHorizontal: 20,
  },
  quickAccessSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: BLUE_ACTIVE,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionDivider: {
    height: 2,
    backgroundColor: BLUE_ACTIVE,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  subSection: {
    marginBottom: 20,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: BLUE_ACTIVE,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  subSectionDivider: {
    height: 1,
    backgroundColor: BLUE_ACTIVE,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  quickAccessItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 4,
  },
  quickAccessItemText: {
    fontSize: 15,
    textTransform: "capitalize",
    color: "#11181C",
  },
  quickAccessItemSubtext: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  emptySubsectionText: {
    fontSize: 13,
    color: "#6b7280",
    fontStyle: "italic",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    lineHeight: 20,
  },
});
