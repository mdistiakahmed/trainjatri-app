import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Pressable,
  ImageBackground,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { parseRouteUrlSlug } from '@/utils/stringutils';
import { getTrainsForRoute } from '@/utils/routeData';
import { cityEnBnMapping } from '@/utils/stationNameEnBnMapping';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Fonts } from '@/constants/theme';
import {
  isRouteSaved,
  saveRouteToQuickAccess,
  removeRouteFromQuickAccess,
} from '@/utils/quickAccessStorage';

const stationNameToMappingKey = (name: string) =>
  name.trim().replace(/\s+/g, '_');

const getBengaliStationName = (englishName: string) =>
  cityEnBnMapping[
    stationNameToMappingKey(englishName) as keyof typeof cityEnBnMapping
  ] || '';

const getDayName = (day: string): string => {
  const days: Record<string, string> = {
    'Sun': 'Sunday',
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday',
  };
  return days[day] || day;
};

export default function RouteDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [trains, setTrains] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const stations = useMemo(() => slug ? parseRouteUrlSlug(slug) : null, [slug]);

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

  const loadTrains = async () => {
    if (!stations) return;
    
    try {
      setLoading(true);
      const trainsData = await getTrainsForRoute(stations.from, stations.to);
      setTrains(trainsData);
    } catch (error) {
      console.error('Error loading trains:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!stations) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContainer}>
          <ThemedText>Invalid route</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={styles.loadingText}>Loading train schedules...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const fromBengali = getBengaliStationName(stations.from);
  const toBengali = getBengaliStationName(stations.to);

  return (
    <ImageBackground
      source={require('@/assets/images/snowflakes.png')}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.buttonSection}>
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                {
                  backgroundColor: isSaved
                    ? '#1877F2'
                    : colorScheme === 'dark'
                    ? '#2a2a2a'
                    : '#f5f5f5',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={handleBookmark}
            >
              <ThemedText
                style={[
                  styles.saveButtonText,
                  { color: isSaved ? '#fff' : colors.text },
                ]}
              >
                {isSaved ? '⭐ ' : '☆ '}
                {isSaved ? 'Saved to Quick Access' : 'Save to Quick Access'}
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.header}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          <ThemedText style={[styles.title, { fontFamily: Fonts.rounded }]}>
            {stations.from} to {stations.to}
          </ThemedText>
          <ThemedText style={styles.subtitle}>Train Schedule</ThemedText>
          {(fromBengali || toBengali) && (
            <ThemedText style={styles.titleBn}>
              {fromBengali || stations.from} থেকে {toBengali || stations.to} ট্রেনের সময়সূচী
            </ThemedText>
          )}
          <ThemedText style={styles.trainCount}>
            {trains.length} train{trains.length !== 1 ? 's' : ''} available
          </ThemedText>
        </View>

        {trains.length > 0 ? (
          <View style={styles.trainsList}>
            {trains.map((train, index) => (
              <View
                key={index}
                style={[
                  styles.trainCard,
                  { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#fff' },
                ]}
              >
                <View style={styles.trainHeader}>
                  <ThemedText style={styles.trainName}>{train.train_name}</ThemedText>
                  <ThemedText style={styles.trainNumber}>#{train.train_number}</ThemedText>
                </View>

                <View style={styles.timeRow}>
                  <View style={styles.timeBox}>
                    <ThemedText style={styles.timeLabel}>Departure</ThemedText>
                    <ThemedText style={styles.timeValue}>
                      {train.departure_from_source.replace(' BST', '')}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.arrow}>→</ThemedText>
                  <View style={styles.timeBox}>
                    <ThemedText style={styles.timeLabel}>Arrival</ThemedText>
                    <ThemedText style={styles.timeValue}>
                      {train.arrival_at_destination.replace(' BST', '')}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <ThemedText style={styles.detailLabel}>Duration</ThemedText>
                    <ThemedText style={styles.detailValue}>{train.journey_duration}</ThemedText>
                  </View>
                  <View style={styles.detailItem}>
                    <ThemedText style={styles.detailLabel}>Operating Days</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {train.days.map(getDayName).join(', ')}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No direct trains found for this route.
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              You may need to take connecting trains.
            </ThemedText>
          </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'flex-end',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#1877F2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 75,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 8,
  },
  titleBn: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 8,
  },
  trainCount: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
    fontWeight: '600',
  },
  trainsList: {
    paddingHorizontal: 20,
  },
  trainCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trainName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  trainNumber: {
    fontSize: 14,
    opacity: 0.6,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  timeBox: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4f46e5',
  },
  arrow: {
    fontSize: 24,
    marginHorizontal: 12,
    opacity: 0.4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: 'center',
  },
});
