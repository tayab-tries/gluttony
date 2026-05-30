const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed: ${response.status}`);
  }

  return payload;
}

export const apiClient = {
  health: () => request('/health'),
  getRestaurants: () => request('/restaurants'),
  getRestaurantMenu: restaurantId => request(`/restaurants/${restaurantId}/menu`),
  geocodeAddress: address => request('/delivery/geocode', { method: 'POST', body: JSON.stringify({ address }) }),
  quoteDelivery: payload => request('/delivery/quote', { method: 'POST', body: JSON.stringify(payload) }),
  getOrders: query => request(`/orders${buildQueryString(query)}`),
  getOrder: orderId => request(`/orders/${orderId}`),
  createOrder: payload => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  updateOrderStatus: (orderId, payload) => request(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
};

function buildQueryString(query = {}) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });

  const encoded = params.toString();
  return encoded ? `?${encoded}` : '';
}
