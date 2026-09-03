import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Linking,
  Alert,
  ImageBackground,
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { trainDataSummary } from '@/data/trainDataSummary';
import { trainNameEnBnMapping } from '@/utils/trainNameEnBnMapping';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as quickAccessStorage from '@/utils/quickAccessStorage';
import AdPlaceholder from '@/components/ads/AdPlaceholder';

interface TrainInfo {
  name: string;
  forwardPath: string;
  forwardTrainNumber: string;
  reversePath: string;
  reverseTrainNumber: string;
}

const getTrainBengaliName = (englishName: string) => {
  const upperName = englishName.toUpperCase();
  return trainNameEnBnMapping[upperName as keyof typeof trainNameEnBnMapping] || '';
};

export default function LiveTrackingScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrain, setSelectedTrain] = useState<TrainInfo | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();

  const sortedTrains = useMemo(
    () => [...trainDataSummary].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || selectedTrain) return [];
    const query = searchQuery.toLowerCase();
    return sortedTrains.filter((train) => {
      const bengaliName = getTrainBengaliName(train.name);
      return (
        train.name.toLowerCase().includes(query) ||
        train.forwardPath.toLowerCase().includes(query) ||
        train.reversePath.toLowerCase().includes(query) ||
        train.forwardTrainNumber.includes(searchQuery) ||
        train.reverseTrainNumber.includes(searchQuery) ||
        (bengaliName && bengaliName.includes(searchQuery))
      );
    });
  }, [searchQuery, sortedTrains, selectedTrain]);

  const handleInputChange = (text: string) => {
    setSearchQuery(text);
    setSelectedTrain(null);
    setShowDropdown(text.trim().length > 0);
  };

  const handleTrainSelect = (train: TrainInfo) => {
    setSelectedTrain(train);
    setSearchQuery(train.name);
    setShowDropdown(false);
  };

  const handleSendSMS = (trainNumber: string) => {
    const smsUrl = `sms:16318?body=TR ${trainNumber}`;
    Linking.canOpenURL(smsUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(smsUrl);
        } else {
          Alert.alert(
            'SMS Not Available',
            `Please manually send "TR ${trainNumber}" to 16318`
          );
        }
      })
      .catch(() => {
        Alert.alert(
          'Error',
          `Please manually send "TR ${trainNumber}" to 16318`
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
      (item) => item.trainName === selectedTrain.name
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
      console.error('Error bookmarking live tracking:', error);
    }
  };

  useEffect(() => {
    checkIfSaved();
  }, [selectedTrain]);

  // Load saved train from params (when opened from Quick Access)
  useEffect(() => {
    if (params.trainName && typeof params.trainName === 'string') {
      const train = sortedTrains.find(
        (t) => t.name === params.trainName
      );
      if (train) {
        setSelectedTrain(train);
        setSearchQuery(train.name);
      }
    }
  }, [params.trainName, sortedTrains]);

  return (
    <ImageBackground
      source={require('@/assets/images/snowflakes.png')}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <View style={styles.headerContent}>
              <View style={styles.titleSection}>
                <ThemedText
                  type="title"
                  style={[styles.title, { fontFamily: Fonts.rounded }]}
                >
                  Live Train Tracking
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  Search for a train to track its live location
                </ThemedText>
              </View>
              {selectedTrain && (
                <View style={styles.buttonSection}>
                  <Pressable
                    style={[
                      styles.saveButton,
                      {
                        backgroundColor: isSaved ? '#1877F2' : 'transparent',
                      },
                    ]}
                    onPress={handleBookmark}
                  >
                    <ThemedText
                      style={[
                        styles.saveButtonText,
                        {
                          color: isSaved ? '#fff' : '#1877F2',
                        },
                      ]}
                    >
                      {isSaved ? '⭐' : '☆'} {isSaved ? 'Saved to Quick Access' : 'Save to Quick Access'}
                    </ThemedText>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: colors.text,
                  borderColor: colorScheme === 'dark' ? '#444' : '#000',
                },
              ]}
              placeholder="Search train name / ট্রেন সার্চ করুন"
              placeholderTextColor={colors.tabIconDefault}
              value={searchQuery}
              onChangeText={handleInputChange}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
            />
            {showDropdown && searchResults.length > 0 && (
              <View
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
                    borderColor: colorScheme === 'dark' ? '#333' : '#e5e5e5',
                  },
                ]}
              >
                <ScrollView style={styles.dropdownScroll}>
                  {searchResults.map((train, index) => {
                    const bengaliName = getTrainBengaliName(train.name);
                    return (
                      <Pressable
                        key={`${train.name}-${index}`}
                        style={({ pressed }) => [
                          styles.dropdownItem,
                          {
                            backgroundColor: pressed
                              ? colorScheme === 'dark'
                                ? '#2a2a2a'
                                : '#f5f5f5'
                              : 'transparent',
                          },
                        ]}
                        onPress={() => handleTrainSelect(train)}
                      >
                        <ThemedText style={styles.trainName}>
                          {train.name}
                        </ThemedText>
                        {bengaliName && (
                          <ThemedText style={styles.trainNameBn}>
                            {bengaliName}
                          </ThemedText>
                        )}
                        <ThemedText style={styles.trainPath}>
                          {train.forwardPath} / {train.reversePath}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>

          {selectedTrain && (
            <View
              style={[
                styles.selectedTrainCard,
                {
                  backgroundColor: colorScheme === 'dark' ? '#1e3a5f' : '#dbeafe',
                },
              ]}
            >
              <ThemedText style={[styles.selectedTrainName, { color: '#1e40af' }]}>
                {selectedTrain.name}
              </ThemedText>
              {getTrainBengaliName(selectedTrain.name) && (
                <ThemedText style={[styles.selectedTrainNameBn, { color: '#1e40af' }]}>
                  {getTrainBengaliName(selectedTrain.name)}
                </ThemedText>
              )}

              {selectedTrain.forwardTrainNumber && (
                <View
                  style={[
                    styles.trackingCard,
                    {
                      backgroundColor:
                        colorScheme === 'dark' ? '#2a2a2a' : '#fff',
                    },
                  ]}
                >
                  <ThemedText style={styles.trackingLabel}>
                    To track <ThemedText style={styles.bold}>{selectedTrain.forwardPath}</ThemedText>:
                  </ThemedText>
                  <View style={styles.smsRow}>
                    <ThemedText
                      style={[
                        styles.smsText,
                        {
                          backgroundColor:
                            colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                        },
                      ]}
                    >
                      TR {selectedTrain.forwardTrainNumber} to 16318
                    </ThemedText>
                    <Pressable
                      style={({ pressed }) => [
                        styles.sendButton,
                        { opacity: pressed ? 0.7 : 1 },
                      ]}
                      onPress={() =>
                        handleSendSMS(selectedTrain.forwardTrainNumber)
                      }
                    >
                      <ThemedText style={styles.sendButtonText}>
                        Send SMS
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
              )}

              {selectedTrain.reverseTrainNumber && (
                <View
                  style={[
                    styles.trackingCard,
                    {
                      backgroundColor:
                        colorScheme === 'dark' ? '#2a2a2a' : '#fff',
                    },
                  ]}
                >
                  <ThemedText style={styles.trackingLabel}>
                    To track <ThemedText style={styles.bold}>{selectedTrain.reversePath}</ThemedText>:
                  </ThemedText>
                  <View style={styles.smsRow}>
                    <ThemedText
                      style={[
                        styles.smsText,
                        {
                          backgroundColor:
                            colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                        },
                      ]}
                    >
                      TR {selectedTrain.reverseTrainNumber} to 16318
                    </ThemedText>
                    <Pressable
                      style={({ pressed }) => [
                        styles.sendButton,
                        { opacity: pressed ? 0.7 : 1 },
                      ]}
                      onPress={() =>
                        handleSendSMS(selectedTrain.reverseTrainNumber)
                      }
                    >
                      <ThemedText style={styles.sendButtonText}>
                        Send SMS
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        <AdPlaceholder />

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
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    width: '100%',
  },
  titleSection: {
    alignItems: 'center',
  },
  buttonSection: {
    alignItems: 'flex-end',
    marginTop: 12,
  },
  logo: {
    width: 150,
    height: 75,
    marginBottom: 12,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  bold: {
    fontWeight: '700',
  },
  searchSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  searchContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  searchInput: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 2,
  },
  dropdown: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    maxHeight: 240,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownScroll: {
    maxHeight: 240,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  trainName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  trainNameBn: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  trainPath: {
    fontSize: 14,
    opacity: 0.7,
  },
  selectedTrainCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  selectedTrainName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  selectedTrainNameBn: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    opacity: 0.9,
  },
  trackingCard: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  trackingLabel: {
    fontSize: 15,
    marginBottom: 8,
  },
  smsRow: {
    flexDirection: 'column',
    gap: 8,
  },
  smsText: {
    fontSize: 16,
    fontFamily: 'monospace',
    padding: 12,
    borderRadius: 8,
  },
  sendButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});
