import { config } from '../config.js';

export async function geocodeAddress(address) {
  const url = new URL('/search', config.nominatimBaseUrl);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('q', address);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'gluttony-dev/1.0',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed with status ${response.status}`);
  }

  const results = await response.json();
  const match = results[0];

  if (!match) {
    return null;
  }

  return {
    lat: Number(match.lat),
    lng: Number(match.lon),
    address: match.display_name,
  };
}
