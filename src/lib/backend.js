import { apiClient } from './apiClient';
import { MOCK_MENU_ITEMS, MOCK_ORDERS, MOCK_RESTAURANTS } from './mockData';

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
  return MOCK_ORDERS.filter(order => {
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
  return MOCK_ORDERS.find(order => order.id === orderId) || MOCK_ORDERS[0];
}

export async function createOrder(payload) {
  const response = await apiClient.createOrder(payload);
  return response.order;
}

export async function updateOrderStatus(orderId, payload) {
  const response = await apiClient.updateOrderStatus(orderId, payload);
  return response.order;
}

export async function quoteDelivery(payload) {
  return apiClient.quoteDelivery(payload);
}

export async function geocodeAddress(address) {
  return apiClient.geocodeAddress(address);
}
