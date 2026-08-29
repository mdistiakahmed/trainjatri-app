import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TRAINS: '@saved_trains',
  STATIONS: '@saved_stations',
  ROUTES: '@saved_routes',
  LIVE_TRACKING: '@saved_live_tracking',
};

export interface SavedTrain {
  name: string;
  slug: string;
}

export interface SavedStation {
  name: string;
  slug: string;
}

export interface SavedRoute {
  from: string;
  to: string;
  slug: string;
}

export interface SavedLiveTracking {
  trainName: string;
  trainNameBn?: string;
  forwardPath: string;
  reversePath: string;
  forwardTrainNumber: string;
  reverseTrainNumber: string;
}

// Trains
export const getSavedTrains = async (): Promise<SavedTrain[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TRAINS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting saved trains:', error);
    return [];
  }
};

export const saveTrainToQuickAccess = async (train: SavedTrain): Promise<void> => {
  try {
    const trains = await getSavedTrains();
    const exists = trains.some(t => t.slug === train.slug);
    if (!exists) {
      trains.push(train);
      await AsyncStorage.setItem(STORAGE_KEYS.TRAINS, JSON.stringify(trains));
    }
  } catch (error) {
    console.error('Error saving train:', error);
  }
};

export const removeTrainFromQuickAccess = async (slug: string): Promise<void> => {
  try {
    const trains = await getSavedTrains();
    const filtered = trains.filter(t => t.slug !== slug);
    await AsyncStorage.setItem(STORAGE_KEYS.TRAINS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing train:', error);
  }
};

export const isTrainSaved = async (slug: string): Promise<boolean> => {
  try {
    const trains = await getSavedTrains();
    return trains.some(t => t.slug === slug);
  } catch (error) {
    console.error('Error checking if train is saved:', error);
    return false;
  }
};

// Stations
export const getSavedStations = async (): Promise<SavedStation[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STATIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting saved stations:', error);
    return [];
  }
};

export const saveStationToQuickAccess = async (station: SavedStation): Promise<void> => {
  try {
    const stations = await getSavedStations();
    const exists = stations.some(s => s.slug === station.slug);
    if (!exists) {
      stations.push(station);
      await AsyncStorage.setItem(STORAGE_KEYS.STATIONS, JSON.stringify(stations));
    }
  } catch (error) {
    console.error('Error saving station:', error);
  }
};

export const removeStationFromQuickAccess = async (slug: string): Promise<void> => {
  try {
    const stations = await getSavedStations();
    const filtered = stations.filter(s => s.slug !== slug);
    await AsyncStorage.setItem(STORAGE_KEYS.STATIONS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing station:', error);
  }
};

export const isStationSaved = async (slug: string): Promise<boolean> => {
  try {
    const stations = await getSavedStations();
    return stations.some(s => s.slug === slug);
  } catch (error) {
    console.error('Error checking if station is saved:', error);
    return false;
  }
};

// Routes
export const getSavedRoutes = async (): Promise<SavedRoute[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ROUTES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting saved routes:', error);
    return [];
  }
};

export const saveRouteToQuickAccess = async (route: SavedRoute): Promise<void> => {
  try {
    const routes = await getSavedRoutes();
    const exists = routes.some(r => r.slug === route.slug);
    if (!exists) {
      routes.push(route);
      await AsyncStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes));
    }
  } catch (error) {
    console.error('Error saving route:', error);
  }
};

export const removeRouteFromQuickAccess = async (slug: string): Promise<void> => {
  try {
    const routes = await getSavedRoutes();
    const filtered = routes.filter(r => r.slug !== slug);
    await AsyncStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing route:', error);
  }
};

export const isRouteSaved = async (slug: string): Promise<boolean> => {
  try {
    const routes = await getSavedRoutes();
    return routes.some(r => r.slug === slug);
  } catch (error) {
    console.error('Error checking if route is saved:', error);
    return false;
  }
};

// Live Tracking
export const getSavedLiveTrackings = async (): Promise<SavedLiveTracking[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LIVE_TRACKING);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting saved live trackings:', error);
    return [];
  }
};

export const saveLiveTracking = async (tracking: SavedLiveTracking): Promise<void> => {
  try {
    const trackings = await getSavedLiveTrackings();
    const exists = trackings.some(t => t.trainName === tracking.trainName);
    if (!exists) {
      trackings.push(tracking);
      await AsyncStorage.setItem(STORAGE_KEYS.LIVE_TRACKING, JSON.stringify(trackings));
    }
  } catch (error) {
    console.error('Error saving live tracking:', error);
  }
};

export const removeSavedLiveTracking = async (trainName: string): Promise<void> => {
  try {
    const trackings = await getSavedLiveTrackings();
    const filtered = trackings.filter(t => t.trainName !== trainName);
    await AsyncStorage.setItem(STORAGE_KEYS.LIVE_TRACKING, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing live tracking:', error);
  }
};

export const isLiveTrackingSaved = async (trainName: string): Promise<boolean> => {
  try {
    const trackings = await getSavedLiveTrackings();
    return trackings.some(t => t.trainName === trainName);
  } catch (error) {
    console.error('Error checking if live tracking is saved:', error);
    return false;
  }
};
