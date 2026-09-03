import React, { useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ImageBackground,
  Keyboard,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatStationName, getRoutesForStation } from '@/utils/stationsData';
import { cityEnBnMapping } from '@/utils/stationNameEnBnMapping';
import { createRouteUrlSlugFromStations, formatStationNameForUrl } from '@/utils/stringutils';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Fonts } from '@/constants/theme';
import {
  isStationSaved,
  saveStationToQuickAccess,
  removeStationFromQuickAccess,
} from '@/utils/quickAccessStorage';
import AdPlaceholder from '@/components/ads/AdPlaceholder';

const stationNameToMappingKey = (name: string) =>
  name.trim().replace(/\s+/g, '_');

const getBengaliStationName = (englishName: string) => {
  const bn =
    cityEnBnMapping[englishName as keyof typeof cityEnBnMapping] ||
    cityEnBnMapping[
      stationNameToMappingKey(englishName) as keyof typeof cityEnBnMapping
    ];
  return bn || '';
};

export default function StationDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const stationName = useMemo(() => formatStationName(name || ''), [name]);
  const routes = useMemo(() => getRoutesForStation(stationName), [stationName]);
  const stationNameBn = useMemo(() => getBengaliStationName(stationName), [stationName]);

  useEffect(() => {
    navigation.setOptions({ title: `${stationName} Station` });
    checkIfSaved();

    // Keyboard listeners
    const keyboardWillShow = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const keyboardWillHide = Keyboard.addListener('keyboardDidHide', () => {
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

  const availableDestinations = useMemo(() => 
    routes.map((route) => route.route.split(' - ')[1]),
    [routes]
  );

  const filteredRoutes = routes.filter((route) => {
    const destination = route.route.split(' - ')[1];
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
      source={require('@/assets/images/snowflakes.png')}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <ThemedView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <ScrollView 
          style={styles.mainScrollView}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollViewContent}
        >
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
            <ThemedText
              type="title"
              style={[styles.title, { fontFamily: Fonts.rounded }]}
            >
              {stationName} Station
            </ThemedText>
            {stationNameBn && (
              <ThemedText style={styles.titleBn}>
                {stationNameBn} স্টেশন
              </ThemedText>
            )}
            <ThemedText style={styles.subtitle}>
              {routes.length} train route{routes.length !== 1 ? 's' : ''} available
            </ThemedText>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                  color: colors.text,
                  borderWidth: isSearchFocused ? 3 : 3,
                  borderColor: isSearchFocused ? '#1877F2' : '#000',
                },
              ]}
              placeholder="Search destination / গন্তব্য সার্চ করুন"
              placeholderTextColor={colors.tabIconDefault}
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
                const [from, to] = route.route.split(' - ');
                const toBengali = getBengaliStationName(to);

                return (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [
                      styles.routeCard,
                      {
                        backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#fff',
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                    onPress={() => handleDestinationPress(to)}
                  >
                    <View style={styles.routeInfo}>
                      <View style={styles.routeHeader}>
                        <ThemedText style={styles.fromStation}>{from}</ThemedText>
                        <ThemedText style={styles.arrow}>→</ThemedText>
                        <ThemedText style={styles.toStation}>{to}</ThemedText>
                      </View>
                      {toBengali && (
                        <ThemedText style={styles.routeBengali}>
                          {getBengaliStationName(from)} থেকে {toBengali}
                        </ThemedText>
                      )}
                      <ThemedText style={styles.routeDescription}>
                        Tap to view train schedule
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  No routes found matching your search.
                </ThemedText>
              </View>
            )}
          </View>
          <View style={{ height: keyboardHeight > 0 ? keyboardHeight + 40 : 40 }} />
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
    alignItems: 'flex-end',
  },
  saveButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1877F2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 9,
    fontWeight: '600',
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 75,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleBn: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeInfo: {
    flexDirection: 'column',
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  fromStation: {
    fontSize: 16,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 16,
    marginHorizontal: 8,
    opacity: 0.6,
  },
  toStation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4f46e5',
  },
  routeBengali: {
    fontSize: 14,
    marginBottom: 6,
    opacity: 0.7,
  },
  routeDescription: {
    fontSize: 12,
    opacity: 0.5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
    textAlign: 'center',
  },
});
