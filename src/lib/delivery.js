const EARTH_RADIUS_KM = 6371;

export const DEFAULT_CUSTOMER_LOCATION = {
  lat: 40.7412,
  lng: -73.9896,
  address: 'Union Square, New York, NY',
  label: 'Union Square',
  source: 'default',
};

export function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceKm(from, to) {
  if (![from?.lat, from?.lng, to?.lat, to?.lng].every(value => typeof value === 'number')) return null;

  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(distanceKm) {
  if (typeof distanceKm !== 'number') return 'Location needed';
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
}

export function estimateDeliveryFee(distanceKm, stopCount = 1) {
  const baseFee = 1.99;
  const distanceFee = (distanceKm || 0) * 0.85;
  const stopFee = Math.max(0, stopCount - 1) * 0.75;
  return roundCurrency(baseFee + distanceFee + stopFee);
}

export function estimateDeliveryMinutes(distanceKm, stopCount = 1) {
  const minutes = 18 + Math.round((distanceKm || 0) * 4.2) + Math.max(0, stopCount - 1) * 7;
  return `${minutes}-${minutes + 8} min`;
}

export function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

export function getRestaurantDistance(restaurant, customerLocation) {
  return calculateDistanceKm(restaurant?.location, customerLocation);
}

export function buildRestaurantViewModel(restaurant, customerLocation) {
  if (!restaurant) return null;
  const distanceKm = getRestaurantDistance(restaurant, customerLocation);
  const deliveryFee = estimateDeliveryFee(distanceKm, 1);
  return {
    ...restaurant,
    distanceKm,
    distanceLabel: formatDistance(distanceKm),
    dynamicDeliveryFee: deliveryFee,
    deliveryEta: estimateDeliveryMinutes(distanceKm, 1),
  };
}

export function buildCartDeliveryQuote(cartItems, restaurantsById, customerLocation) {
  const restaurantIds = [...new Set(cartItems.map(item => item.restaurant_id))];
  const restaurantStops = restaurantIds
    .map(id => restaurantsById[id])
    .filter(Boolean);

  const distances = restaurantStops
    .map(restaurant => getRestaurantDistance(restaurant, customerLocation))
    .filter(distance => typeof distance === 'number');

  const routeDistanceKm =
    distances.length > 0
      ? Math.max(...distances) + Math.max(0, restaurantStops.length - 1) * 1.4
      : null;

  return {
    stopCount: restaurantStops.length,
    routeDistanceKm,
    routeDistanceLabel: formatDistance(routeDistanceKm),
    deliveryFee: estimateDeliveryFee(routeDistanceKm, restaurantStops.length || 1),
    estimatedDelivery: estimateDeliveryMinutes(routeDistanceKm, restaurantStops.length || 1),
    restaurantStops,
  };
}

export function getOrderRoutePoints(order) {
  const points = [];

  if (Array.isArray(order?.restaurant_locations)) {
    order.restaurant_locations.forEach((restaurant, index) => {
      if ([restaurant?.lat, restaurant?.lng].every(value => typeof value === 'number')) {
        points.push({
          id: restaurant.id || `restaurant-${index}`,
          label: restaurant.name || `Restaurant ${index + 1}`,
          type: 'restaurant',
          lat: restaurant.lat,
          lng: restaurant.lng,
        });
      }
    });
  }

  if ([order?.driver_location?.lat, order?.driver_location?.lng].every(value => typeof value === 'number')) {
    points.push({
      id: 'driver',
      label: order.driver_name || 'Driver',
      type: 'driver',
      lat: order.driver_location.lat,
      lng: order.driver_location.lng,
    });
  }

  if ([order?.customer_location?.lat, order?.customer_location?.lng].every(value => typeof value === 'number')) {
    points.push({
      id: 'customer',
      label: order.delivery_address || 'Delivery destination',
      type: 'customer',
      lat: order.customer_location.lat,
      lng: order.customer_location.lng,
    });
  }

  return points;
}

export function buildMapEmbedUrl(points) {
  const validPoints = points.filter(point => [point?.lat, point?.lng].every(value => typeof value === 'number'));
  if (validPoints.length === 0) return null;

  const lats = validPoints.map(point => point.lat);
  const lngs = validPoints.map(point => point.lng);
  const padding = 0.02;
  const minLat = Math.min(...lats) - padding;
  const maxLat = Math.max(...lats) + padding;
  const minLng = Math.min(...lngs) - padding;
  const maxLng = Math.max(...lngs) + padding;
  const marker = validPoints[validPoints.length - 1];

  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${marker.lat}%2C${marker.lng}`;
}

export function getDriverLocation(order) {
  const restaurants = order?.restaurant_locations || [];
  const customer = order?.customer_location;
  if (![customer?.lat, customer?.lng].every(value => typeof value === 'number') || restaurants.length === 0) return null;

  const pickup = restaurants[0];
  if (![pickup?.lat, pickup?.lng].every(value => typeof value === 'number')) return null;

  const progressByStatus = {
    pending: 0,
    accepted: 0,
    preparing: 0,
    ready: 0.12,
    picked_up: 0.58,
    delivered: 1,
  };

  const progress = progressByStatus[order?.status] ?? 0.3;

  return {
    lat: pickup.lat + (customer.lat - pickup.lat) * progress,
    lng: pickup.lng + (customer.lng - pickup.lng) * progress,
  };
}
