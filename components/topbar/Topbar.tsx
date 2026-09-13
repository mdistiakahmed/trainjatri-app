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
import { router, useFocusEffect, usePathname } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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

const TEXT = "#202124";
const ICON = "#5f6368";
const MUTED = "#5f6368";
const DIVIDER = "#e8eaed";
const ROW_PRESSED = "#f1f3f4";
const ROW_ACTIVE_BG = "#e8f0fe";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

function MenuRow({
  icon,
  label,
  sublabel,
  active = false,
  onPress,
}: {
  icon: IconName;
  label: string;
  sublabel?: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        active && styles.menuRowActive,
        pressed && !active && styles.menuRowPressed,
      ]}
    >
      <MaterialIcons
        name={icon}
        size={22}
        color={active ? BLUE_ACTIVE : ICON}
        style={styles.menuRowIcon}
      />
      <View style={styles.menuRowTextWrap}>
        <Text
          style={[styles.menuRowLabel, active && styles.menuRowLabelActive]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text style={styles.menuRowSublabel} numberOfLines={1}>
            {sublabel}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function EmptyHint({ children }: { children: string }) {
  return <Text style={styles.emptyHint}>{children}</Text>;
}

export default function Topbar() {
  const pathname = usePathname();
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-304)).current;
  const [savedTrains, setSavedTrains] = useState<SavedTrain[]>([]);
  const [savedStations, setSavedStations] = useState<SavedStation[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [savedLiveTrackings, setSavedLiveTrackings] = useState<
    SavedLiveTracking[]
  >([]);

  const isHome =
    pathname === "/" || pathname === "/index" || pathname === "/(tabs)";
  const isTrains = pathname.startsWith("/trains");
  const isStations = pathname.startsWith("/stations");
  const isLiveTracking = pathname.startsWith("/live-tracking");

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
  }, []);

  useEffect(() => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -304,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [menuVisible]);

  const closeAnd = (action: () => void) => {
    setMenuVisible(false);
    action();
  };

  const handleLogoPress = () => {
    router.navigate("/(tabs)");
  };

  const handleShareFeedback = () => {
    closeAnd(() => {
      const email = "randzyx62@gmail.com";
      const subject = "Feedback for Train Jatri App";
      const body = "Please share your feedback here...";
      Linking.openURL(
        `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      );
    });
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
              { transform: [{ translateX: slideAnim }] },
            ]}
          >
            <Pressable style={styles.menuInner} onPress={(e) => e.stopPropagation()}>
              <View style={styles.menuHeader}>
                <MaterialIcons name="train" size={28} color={BLUE_ACTIVE} />
                <Text style={styles.menuBrand}>TrainJatri</Text>
              </View>

              <View style={styles.headerDivider} />

              <ScrollView
                style={styles.menuContent}
                contentContainerStyle={styles.menuContentInner}
                showsVerticalScrollIndicator={false}
              >
                <MenuRow
                  icon="home"
                  label="Home"
                  active={isHome}
                  onPress={() => closeAnd(() => router.navigate("/(tabs)"))}
                />
                <MenuRow
                  icon="train"
                  label="Trains"
                  active={isTrains}
                  onPress={() =>
                    closeAnd(() => router.navigate("/(tabs)/trains"))
                  }
                />
                <MenuRow
                  icon="map"
                  label="Stations"
                  active={isStations}
                  onPress={() =>
                    closeAnd(() => router.navigate("/(tabs)/stations"))
                  }
                />
                <MenuRow
                  icon="my-location"
                  label="Live Tracking"
                  active={isLiveTracking}
                  onPress={() =>
                    closeAnd(() => router.navigate("/(tabs)/live-tracking"))
                  }
                />

                <View style={styles.sectionDivider} />
                <SectionLabel>Quick access</SectionLabel>

                <SectionLabel>Trains</SectionLabel>
                {savedTrains.length > 0 ? (
                  savedTrains.map((train) => (
                    <MenuRow
                      key={train.slug}
                      icon="directions-railway"
                      label={train.name}
                      onPress={() =>
                        closeAnd(() =>
                          router.push(`/(tabs)/trains/${train.slug}` as any),
                        )
                      }
                    />
                  ))
                ) : (
                  <EmptyHint>No saved trains</EmptyHint>
                )}

                <SectionLabel>Stations</SectionLabel>
                {savedStations.length > 0 ? (
                  savedStations.map((station) => (
                    <MenuRow
                      key={station.slug}
                      icon="place"
                      label={station.name}
                      onPress={() =>
                        closeAnd(() =>
                          router.push(`/(tabs)/stations/${station.slug}` as any),
                        )
                      }
                    />
                  ))
                ) : (
                  <EmptyHint>No saved stations</EmptyHint>
                )}

                <SectionLabel>Routes</SectionLabel>
                {savedRoutes.length > 0 ? (
                  savedRoutes.map((route) => (
                    <MenuRow
                      key={route.slug}
                      icon="alt-route"
                      label={`${route.from} → ${route.to}`}
                      onPress={() => {
                        const stationSlug = route.from
                          .toLowerCase()
                          .replace(/\s+/g, "-");
                        closeAnd(() =>
                          router.push(
                            `/(tabs)/stations/${stationSlug}/${route.slug}` as any,
                          ),
                        );
                      }}
                    />
                  ))
                ) : (
                  <EmptyHint>No saved routes</EmptyHint>
                )}

                <SectionLabel>Live tracking</SectionLabel>
                {savedLiveTrackings.length > 0 ? (
                  savedLiveTrackings.map((tracking) => (
                    <MenuRow
                      key={tracking.trainName}
                      icon="near-me"
                      label={tracking.trainName}
                      sublabel={tracking.trainNameBn}
                      onPress={() =>
                        closeAnd(() =>
                          router.push(
                            `/(tabs)/live-tracking?trainName=${encodeURIComponent(tracking.trainName)}` as any,
                          ),
                        )
                      }
                    />
                  ))
                ) : (
                  <EmptyHint>No saved live tracking</EmptyHint>
                )}

                <View style={styles.sectionDivider} />
                <MenuRow
                  icon="feedback"
                  label="Send feedback"
                  onPress={handleShareFeedback}
                />
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
    backgroundColor: "rgba(0, 0, 0, 0.32)",
    justifyContent: "flex-start",
  },
  menuContainer: {
    backgroundColor: "#ffffff",
    width: "86%",
    maxWidth: 304,
    height: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 16,
  },
  menuInner: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 28,
    paddingBottom: 16,
    gap: 12,
  },
  menuBrand: {
    fontSize: 22,
    fontWeight: "400",
    color: TEXT,
    letterSpacing: 0.15,
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
    marginBottom: 8,
  },
  menuContent: {
    flex: 1,
  },
  menuContentInner: {
    paddingBottom: 28,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingVertical: 10,
    paddingLeft: 20,
    paddingRight: 16,
    marginRight: 12,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
  },
  menuRowActive: {
    backgroundColor: ROW_ACTIVE_BG,
  },
  menuRowPressed: {
    backgroundColor: ROW_PRESSED,
  },
  menuRowIcon: {
    marginRight: 18,
  },
  menuRowTextWrap: {
    flex: 1,
  },
  menuRowLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: TEXT,
    textTransform: "capitalize",
  },
  menuRowLabelActive: {
    color: BLUE_ACTIVE,
    fontWeight: "600",
  },
  menuRowSublabel: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: MUTED,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
    marginVertical: 8,
    marginLeft: 20,
  },
  emptyHint: {
    fontSize: 13,
    color: MUTED,
    paddingHorizontal: 60,
    paddingVertical: 6,
  },
});
