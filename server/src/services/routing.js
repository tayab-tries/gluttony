import { config } from '../config.js';

export async function getRouteSummary(points) {
  if (!Array.isArray(points) || points.length < 2) {
    return { distanceKm: 0, durationMinutes: 0 };
  }

  const coordinates = points.map(point => `${point.lng},${point.lat}`).join(';');
  const url = new URL(`/route/v1/driving/${coordinates}`, config.osrmBaseUrl);
  url.searchParams.set('overview', 'false');
  url.searchParams.set('steps', 'false');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Routing failed with status ${response.status}`);
  }

  const data = await response.json();
  const route = data.routes?.[0];

  if (!route) {
    throw new Error('No route returned from OSRM');
  }

  return {
    distanceKm: Number((route.distance / 1000).toFixed(2)),
    durationMinutes: Math.max(1, Math.round(route.duration / 60)),
  };
}
