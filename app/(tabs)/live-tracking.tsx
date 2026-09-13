import React, { useState, useMemo, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  Alert,
  ImageBackground,
} from "react-native";
import { trainDataSummary } from "@/data/trainDataSummary";
import { BrandLogo } from "@/components/BrandLogo";
import {
  SearchPanel,
  SearchField,
  SearchButton,
  useSearchScroll,
} from "@/components/search/SearchPanel";
import { trainNameEnBnMapping } from "@/utils/trainNameEnBnMapping";
import { BLUE_ACTIVE, Fonts } from "@/constants/theme";
import { useLocalSearchParams } from "expo-router";
import * as quickAccessStorage from "@/utils/quickAccessStorage";
import AdPlaceholder from "@/components/ads/AdPlaceholder";

const TEXT = "#11181C";
const MUTED = "#6b7280";
const CARD = "#ffffff";
const PAGE_BG = "#f7f8fa";
const FIELD_BG = "#f5f5f5";
const SELECTED_BG = "#dbeafe";

interface TrainInfo {
  name: string;
  forwardPath: string;
  forwardTrainNumber: string;
  reversePath: string;
  reverseTrainNumber: string;
}

const getTrainBengaliName = (englishName: string) => {
  const upperName = englishName.toUpperCase();
  return (
    trainNameEnBnMapping[upperName as keyof typeof trainNameEnBnMapping] || ""
  );
};

export default function LiveTrackingScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pickedTrain, setPickedTrain] = useState<TrainInfo | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<TrainInfo | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const params = useLocalSearchParams();
  const searchScroll = useSearchScroll();

  const sortedTrains = useMemo(
    () => [...trainDataSummary].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const findMatchingTrains = (queryText: string) => {
    const query = queryText.trim().toLowerCase();
    if (!query) return [];
    return sortedTrains.filter((train) => {
      const bengaliName = getTrainBengaliName(train.name);
      return (
        train.name.toLowerCase().includes(query) ||
        train.forwardPath.toLowerCase().includes(query) ||
        train.reversePath.toLowerCase().includes(query) ||
        train.forwardTrainNumber.includes(queryText.trim()) ||
        train.reverseTrainNumber.includes(queryText.trim()) ||
        (bengaliName && bengaliName.includes(queryText.trim()))
      );
    });
  };

  const searchResults = useMemo(() => {
    if (pickedTrain) return [];
    return findMatchingTrains(searchQuery);
  }, [searchQuery, sortedTrains, pickedTrain]);

  const handleInputChange = (text: string) => {
    setSearchQuery(text);
    setPickedTrain(null);
    setSelectedTrain(null);
    setShowDropdown(text.trim().length > 0);
  };

  const handleSearch = () => {
    if (!pickedTrain) return;
    setSelectedTrain(pickedTrain);
    setShowDropdown(false);
  };

  const handleTrainSelect = (train: TrainInfo) => {
    setPickedTrain(train);
    setSearchQuery(train.name);
    setShowDropdown(false);
  };

  const showTrainTracking = (train: TrainInfo) => {
    handleTrainSelect(train);
    setSelectedTrain(train);
  };

  const handleSendSMS = (trainNumber: string) => {
    const smsUrl = `sms:16318?body=TR ${trainNumber}`;
    Linking.canOpenURL(smsUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(smsUrl);
        } else {
          Alert.alert(
            "SMS Not Available",
            `Please manually send "TR ${trainNumber}" to 16318`,
          );
        }
      })
      .catch(() => {
        Alert.alert(
          "Error",
          `Please manually send "TR ${trainNumber}" to 16318`,
        );
      });
  };

  const checkIfSaved = async () => {
    if (!selectedTrain) {
      setIsSaved(false);
      return;
    }
    const savedTrackings = await quickAccessStorage.getSavedLiveTrackings();
    const isAlreadySaved = savedTrackings.some(
      (item) => item.trainName === selectedTrain.name,
    );
    setIsSaved(isAlreadySaved);
  };

  const handleBookmark = async () => {
    if (!selectedTrain) return;

    try {
      if (isSaved) {
        await quickAccessStorage.removeSavedLiveTracking(selectedTrain.name);
        setIsSaved(false);
      } else {
        const bengaliName = getTrainBengaliName(selectedTrain.name);
        await quickAccessStorage.saveLiveTracking({
          trainName: selectedTrain.name,
          trainNameBn: bengaliName,
          forwardPath: selectedTrain.forwardPath,
          reversePath: selectedTrain.reversePath,
          forwardTrainNumber: selectedTrain.forwardTrainNumber,
          reverseTrainNumber: selectedTrain.reverseTrainNumber,
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error bookmarking live tracking:", error);
    }
  };

  useEffect(() => {
    checkIfSaved();
  }, [selectedTrain]);

  // Load saved train from params (when opened from Quick Access)
  useEffect(() => {
    if (params.trainName && typeof params.trainName === "string") {
      const train = sortedTrains.find((t) => t.name === params.trainName);
      if (train) {
        setPickedTrain(train);
        setSelectedTrain(train);
        setSearchQuery(train.name);
      }
    }
  }, [params.trainName, sortedTrains]);

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
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <BrandLogo />
            </View>
            <View style={styles.headerContent}>
              <View style={styles.titleSection}>
                <Text style={[styles.title, { fontFamily: Fonts.rounded }]}>
                  Live Train Tracking
                </Text>
                <Text style={styles.subtitle}>
                  Browse trains and send SMS to 16318
                </Text>
              </View>
              {selectedTrain && (
                <View style={styles.buttonSection}>
                  <Pressable
                    style={[
                      styles.saveButton,
                      isSaved
                        ? styles.saveButtonSaved
                        : styles.saveButtonUnsaved,
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
                      {isSaved ? "⭐" : "☆"}{" "}
                      {isSaved
                        ? "Saved to Quick Access"
                        : "Save to Quick Access"}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          <View style={styles.searchSection}>
            <SearchPanel
              scrollViewRef={searchScroll.scrollViewRef}
              scrollOffsetRef={searchScroll.scrollOffsetRef}
            >
              <SearchField
                icon="train"
                label="Search train"
                placeholder="Search train name / ট্রেন সার্চ করুন"
                value={searchQuery}
                onChangeText={handleInputChange}
                focused={isSearchFocused}
                onFocus={() => {
                  setIsSearchFocused(true);
                  if (searchQuery.trim() && !pickedTrain) {
                    setShowDropdown(true);
                  }
                }}
                onBlur={() => setIsSearchFocused(false)}
                suggestions={searchResults.map((train) => ({
                  key: train.name,
                  title: train.name,
                  subtitle: getTrainBengaliName(train.name) || undefined,
                  caption: `${train.forwardPath} / ${train.reversePath}`,
                }))}
                showSuggestions={showDropdown}
                onSelectSuggestion={(item) => {
                  const train = sortedTrains.find((t) => t.name === item.key);
                  if (train) handleTrainSelect(train);
                }}
                zIndex={5}
              />
              <SearchButton
                label="Search Train"
                enabled={!!pickedTrain}
                onPress={handleSearch}
              />
            </SearchPanel>

            {selectedTrain && (
              <View style={styles.selectedTrainCard}>
                <Text style={styles.selectedTrainName}>
                  {selectedTrain.name}
                </Text>
                {getTrainBengaliName(selectedTrain.name) && (
                  <Text style={styles.selectedTrainNameBn}>
                    {getTrainBengaliName(selectedTrain.name)}
                  </Text>
                )}

                {selectedTrain.forwardTrainNumber && (
                  <View style={styles.trackingCard}>
                    <Text style={styles.trackingLabel}>
                      To track{" "}
                      <Text style={styles.bold}>
                        {selectedTrain.forwardPath}
                      </Text>
                      :
                    </Text>
                    <View style={styles.smsRow}>
                      <Text style={styles.smsText}>
                        TR {selectedTrain.forwardTrainNumber} to 16318
                      </Text>
                      <Pressable
                        style={({ pressed }) => [
                          styles.sendButton,
                          { opacity: pressed ? 0.7 : 1 },
                        ]}
                        onPress={() =>
                          handleSendSMS(selectedTrain.forwardTrainNumber)
                        }
                      >
                        <Text style={styles.sendButtonText}>
                          Send SMS
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {selectedTrain.reverseTrainNumber && (
                  <View style={styles.trackingCard}>
                    <Text style={styles.trackingLabel}>
                      To track{" "}
                      <Text style={styles.bold}>
                        {selectedTrain.reversePath}
                      </Text>
                      :
                    </Text>
                    <View style={styles.smsRow}>
                      <Text style={styles.smsText}>
                        TR {selectedTrain.reverseTrainNumber} to 16318
                      </Text>
                      <Pressable
                        style={({ pressed }) => [
                          styles.sendButton,
                          { opacity: pressed ? 0.7 : 1 },
                        ]}
                        onPress={() =>
                          handleSendSMS(selectedTrain.reverseTrainNumber)
                        }
                      >
                        <Text style={styles.sendButtonText}>
                          Send SMS
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          <AdPlaceholder />

          {!selectedTrain ? (
          <View style={styles.trainsGrid}>
            {sortedTrains.map((train) => {
              const bengaliName = getTrainBengaliName(train.name);
              return (
                <Pressable
                  key={train.name}
                  style={({ pressed }) => [
                    styles.trainCard,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => showTrainTracking(train)}
                >
                  <Text style={styles.trainName}>{train.name}</Text>
                  {bengaliName ? (
                    <Text style={styles.trainNameBn}>{bengaliName}</Text>
                  ) : null}
                  {train.forwardTrainNumber ? (
                    <Text style={styles.trainRoute}>
                      {train.forwardPath} · TR {train.forwardTrainNumber}
                    </Text>
                  ) : null}
                  {train.reverseTrainNumber ? (
                    <Text style={styles.trainRoute}>
                      {train.reversePath} · TR {train.reverseTrainNumber}
                    </Text>
                  ) : null}
                  <Text style={styles.viewDetails}>Track live →</Text>
                </Pressable>
              );
            })}
          </View>
          ) : null}

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
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    width: "100%",
  },
  titleSection: {
    alignItems: "center",
  },
  buttonSection: {
    alignItems: "flex-end",
    marginTop: 12,
  },
  logoWrap: {
    marginBottom: 12,
    alignSelf: "center",
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
  bold: {
    fontWeight: "700",
    color: TEXT,
  },
  searchSection: {
    marginBottom: 20,
    zIndex: 5,
  },
  trainsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  trainCard: {
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
  trainName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "capitalize",
    color: TEXT,
  },
  trainNameBn: {
    fontSize: 16,
    marginBottom: 8,
    color: MUTED,
  },
  trainRoute: {
    fontSize: 13,
    marginTop: 2,
    color: MUTED,
  },
  viewDetails: {
    fontSize: 14,
    color: BLUE_ACTIVE,
    fontWeight: "500",
    marginTop: 8,
  },
  selectedTrainCard: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: SELECTED_BG,
  },
  selectedTrainName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "capitalize",
    color: BLUE_ACTIVE,
  },
  selectedTrainNameBn: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: BLUE_ACTIVE,
  },
  trackingCard: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: CARD,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  trackingLabel: {
    fontSize: 15,
    marginBottom: 8,
    color: TEXT,
  },
  smsRow: {
    flexDirection: "column",
    gap: 8,
  },
  smsText: {
    fontSize: 16,
    fontFamily: "monospace",
    padding: 12,
    borderRadius: 8,
    backgroundColor: FIELD_BG,
    color: TEXT,
  },
  sendButton: {
    backgroundColor: BLUE_ACTIVE,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
});
