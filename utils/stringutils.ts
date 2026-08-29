export const ROUTE_URL_SUFFIX = '-train-schedule';

export function formatStationNameForUrl(stationName: string): string {
  return stationName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/-+/g, '-');
}

export function createDataSlugFromRoute(routeName: string): string {
  const [from, to] = routeName.split(' - ');
  return `${formatStationNameForUrl(from)}-to-${formatStationNameForUrl(to)}`;
}

export function createRouteUrlSlugFromRoute(routeName: string): string {
  return `${createDataSlugFromRoute(routeName)}${ROUTE_URL_SUFFIX}`;
}

export function createRouteUrlSlugFromStations(from: string, to: string): string {
  return `${formatStationNameForUrl(from)}-to-${formatStationNameForUrl(to)}${ROUTE_URL_SUFFIX}`;
}

export function dataSlugToRouteUrlSlug(dataSlug: string): string {
  if (dataSlug.endsWith(ROUTE_URL_SUFFIX)) {
    return dataSlug;
  }
  return `${dataSlug}${ROUTE_URL_SUFFIX}`;
}

export function routeUrlSlugToDataSlug(urlSlug: string): string {
  if (!urlSlug) return '';
  if (urlSlug.endsWith(ROUTE_URL_SUFFIX)) {
    return urlSlug.slice(0, -ROUTE_URL_SUFFIX.length);
  }
  return urlSlug;
}

export function parseRouteUrlSlug(urlSlug: string): { from: string; to: string } | null {
  if (!urlSlug) return null;
  const dataSlug = routeUrlSlugToDataSlug(urlSlug);
  const parts = dataSlug.split('-to-');
  if (parts.length !== 2) return null;

  const formatStationName = (str: string) =>
    str
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  return {
    from: formatStationName(parts[0]),
    to: formatStationName(parts[1]),
  };
}
