import { apiClient } from './apiClient';
import { MOCK_MENU_ITEMS, MOCK_ORDERS, MOCK_RESTAURANTS } from './mockData';

const MOCK_ORDERS_KEY = 'gluttony_mock_orders_db';

function getLocalMockOrders() {
  try {
    const stored = localStorage.getItem(MOCK_ORDERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  try {
    localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(MOCK_ORDERS));
  } catch {}
  return MOCK_ORDERS;
}

function saveLocalMockOrders(orders) {
  try {
    localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(orders));
  } catch {}
}

export async function fetchRestaurants() {
  try {
    const response = await apiClient.getRestaurants();
    if (response.restaurants?.length) return response.restaurants;
  } catch {}
  return MOCK_RESTAURANTS;
}

export async function fetchRestaurantMenu(restaurantId) {
  try {
    const response = await apiClient.getRestaurantMenu(restaurantId);
    if (response.menuItems?.length || response.menuItems?.length === 0) return response.menuItems;
  } catch {}
  return MOCK_MENU_ITEMS[restaurantId] || [];
}

export async function fetchOrders(query = {}) {
  try {
    const response = await apiClient.getOrders(query);
    if (response.orders) return response.orders;
  } catch {}
  
  const localOrders = getLocalMockOrders();
  return localOrders.filter(order => {
    if (query.customerEmail && order.customer_email !== query.customerEmail) return false;
    if (query.driverEmail && order.driver_email !== query.driverEmail) return false;
    if (query.restaurantId && !order.items?.some(item => item.restaurant_id === query.restaurantId)) return false;
    if (query.status && order.status !== query.status) return false;
    return true;
  });
}

export async function fetchOrder(orderId) {
  try {
    const response = await apiClient.getOrder(orderId);
    if (response.order) return response.order;
  } catch {}
  
  const localOrders = getLocalMockOrders();
  return localOrders.find(order => order.id === orderId) || localOrders[0];
}

export async function createOrder(payload) {
  try {
    const response = await apiClient.createOrder(payload);
    if (response.order) return response.order;
  } catch {}

  const localOrders = getLocalMockOrders();
  const newOrder = {
    id: payload.id || `demo-${Date.now()}`,
    customer_email: payload.customerEmail,
    customer_id: payload.customerId,
    driver_email: payload.driverEmail || null,
    driver_name: payload.driverName || 'Dispatch pending',
    driver_location: payload.driverLocation || null,
    items: payload.items || [],
    total_price: payload.totalPrice || 0,
    subtotal_price: payload.subtotalPrice || 0,
    delivery_fee: payload.deliveryFee || 0,
    service_fee: payload.serviceFee || 0,
    delivery_address: payload.deliveryAddress || '',
    customer_location: payload.customerLocation || null,
    restaurant_locations: payload.restaurantLocations || [],
    status: payload.status || 'pending',
    restaurants: payload.restaurants || [],
    estimated_delivery: payload.estimatedDelivery || '',
    distance_km: payload.distanceKm || 0,
    route_stops: payload.routeStops || 1,
    created_at: new Date().toISOString(),
  };

  localOrders.unshift(newOrder);
  saveLocalMockOrders(localOrders);
  return newOrder;
}

export async function updateOrderStatus(orderId, payload) {
  try {
    const response = await apiClient.updateOrderStatus(orderId, payload);
    if (response.order) return response.order;
  } catch {}

  const localOrders = getLocalMockOrders();
  const orderIndex = localOrders.findIndex(order => order.id === orderId);
  if (orderIndex !== -1) {
    const existing = localOrders[orderIndex];
    const updated = {
      ...existing,
      status: payload.status !== undefined ? payload.status : existing.status,
      driver_email: payload.driverEmail !== undefined ? payload.driverEmail : existing.driver_email,
      driver_name: payload.driverName !== undefined ? payload.driverName : existing.driver_name,
      driver_location: payload.driverLocation !== undefined ? payload.driverLocation : existing.driver_location,
    };
    localOrders[orderIndex] = updated;
    saveLocalMockOrders(localOrders);
    return updated;
  }
  throw new Error(`Order ${orderId} not found in mock store`);
}

export async function quoteDelivery(payload) {
  return apiClient.quoteDelivery(payload);
}

export async function geocodeAddress(address) {
  return apiClient.geocodeAddress(address);
}

