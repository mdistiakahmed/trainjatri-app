import allTripsData from '@/data/trains-by-stations/all-trips.json';

interface Route {
  route: string;
  filename: string;
}

interface GroupedRoutes {
  [key: string]: Route[];
}

export function getRoutes(): Route[] {
  return allTripsData.routes || [];
}

export function groupRoutesByStartStation(routes: Route[]): GroupedRoutes {
  const grouped = routes.reduce((groups, route) => {
    const [startStation] = route.route.split(' - ');
    if (!groups[startStation]) {
      groups[startStation] = [];
    }
    groups[startStation].push(route);
    return groups;
  }, {} as GroupedRoutes);

  return Object.keys(grouped)
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
    .reduce((sortedGroups, key) => {
      sortedGroups[key] = grouped[key];
      return sortedGroups;
    }, {} as GroupedRoutes);
}

export function getRoutesForStation(stationName: string): Route[] {
  const routes = getRoutes();
  return routes.filter((route) => route.route.startsWith(`${stationName} - `));
}

export function formatStationName(slug: string): string {
  const decoded = decodeURIComponent(slug);
  return decoded
    .split(/[-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
