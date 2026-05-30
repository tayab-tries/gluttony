import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileLayout from '../components/MobileLayout';
import { useCart } from '../lib/CartContext';
import { useAuth } from '../lib/AuthContext';
import { useDeliveryLocation } from '../hooks/useDeliveryLocation';
import DeliveryMapCard from '../components/DeliveryMapCard';
import { fetchRestaurants, quoteDelivery, createOrder, geocodeAddress } from '../lib/backend';
import { buildCartDeliveryQuote, getDriverLocation } from '../lib/delivery';

export default function Cart() {
  const { cartItems, itemsByRestaurant, updateQuantity, clearCart, totalPrice } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [restaurantsById, setRestaurantsById] = useState({});
  const [deliveryQuote, setDeliveryQuote] = useState(null);
  const { location, setLocation, detectCurrentLocation, isDetectingLocation, locationError } = useDeliveryLocation();

  useEffect(() => {
    let active = true;
    fetchRestaurants().then(restaurants => {
      if (!active) return;
      setRestaurantsById(Object.fromEntries(restaurants.map(restaurant => [restaurant.id, restaurant])));
    });
    return () => {
      active = false;
    };
  }, []);

  const localQuote = useMemo(
    () => buildCartDeliveryQuote(cartItems, restaurantsById, location),
    [cartItems, restaurantsById, location]
  );

  useEffect(() => {
    if (cartItems.length === 0 || Object.keys(restaurantsById).length === 0) {
      setDeliveryQuote(null);
      return;
    }

    let active = true;
    const pickupPoints = [...new Set(cartItems.map(item => item.restaurant_id))]
      .map(id => restaurantsById[id])
      .filter(Boolean)
      .map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        lat: restaurant.location?.lat,
        lng: restaurant.location?.lng,
      }))
      .filter(point => typeof point.lat === 'number' && typeof point.lng === 'number');

    quoteDelivery({
      pickupPoints,
      dropoffPoint: { lat: location.lat, lng: location.lng },
    })
      .then(response => {
        if (!active) return;
        setDeliveryQuote({
          ...localQuote,
          deliveryFee: response.deliveryFee,
          serviceFee: response.serviceFee,
          routeDistanceKm: response.distanceKm ?? response.route?.distanceKm ?? localQuote.routeDistanceKm,
          routeDistanceLabel: response.distanceKm ? `${response.distanceKm.toFixed(1)} km` : localQuote.routeDistanceLabel,
          estimatedDelivery: response.etaLabel || localQuote.estimatedDelivery,
        });
      })
      .catch(() => {
        if (active) setDeliveryQuote(null);
      });

    return () => {
      active = false;
    };
  }, [cartItems, restaurantsById, location, localQuote]);

  const effectiveQuote = deliveryQuote || {
    ...localQuote,
    serviceFee: 0.99,
  };
  const serviceFee = effectiveQuote.serviceFee ?? 0.99;
  const deliveryFee = effectiveQuote.deliveryFee ?? 0;
  const grandTotal = totalPrice + deliveryFee + serviceFee;
  const restaurantStops = effectiveQuote.restaurantStops || [];
  const mapPoints = [
    ...restaurantStops.map(restaurant => ({
      id: restaurant.id,
      label: restaurant.name,
      type: 'restaurant',
      lat: restaurant.location?.lat,
      lng: restaurant.location?.lng,
    })),
    {
      id: 'customer',
      label: location.address,
      type: 'customer',
      lat: location.lat,
      lng: location.lng,
    },
  ];

  const placeOrder = async () => {
    setPlacing(true);

    try {
      let customerLocation = { lat: location.lat, lng: location.lng };
      if (!location.source || location.source === 'default') {
        try {
          const geocoded = await geocodeAddress(location.address);
          customerLocation = { lat: geocoded.lat, lng: geocoded.lng };
          setLocation({ ...geocoded, source: 'geocoded' });
        } catch {}
      }

      const restaurantLocations = restaurantStops.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        lat: restaurant.location?.lat,
        lng: restaurant.location?.lng,
      }));

      const payload = {
        customerId: currentUser?.id,
        customerEmail: currentUser?.email || 'guest@demo.com',
        items: cartItems,
        subtotalPrice: totalPrice,
        deliveryFee,
        serviceFee,
        totalPrice: grandTotal,
        deliveryAddress: location.address,
        customerLocation,
        status: 'pending',
        restaurants: [...new Set(cartItems.map(item => item.restaurant_name))],
        restaurantIds: [...new Set(cartItems.map(item => item.restaurant_id))],
        estimatedDelivery: effectiveQuote.estimatedDelivery,
        distanceKm: effectiveQuote.routeDistanceKm,
        routeStops: effectiveQuote.stopCount,
        restaurantLocations,
        driverName: 'Dispatch pending',
        driverLocation: getDriverLocation({
          status: 'pending',
          restaurant_locations: restaurantLocations,
          customer_location: customerLocation,
        }),
      };

      const order = await createOrder(payload);
      clearCart();
      navigate(`/track/${order.id}`);
    } catch {
      const fallbackOrderId = `demo-${Date.now()}`;
      const draftOrder = {
        id: fallbackOrderId,
        customer_email: currentUser?.email || 'guest@demo.com',
        items: cartItems,
        subtotal_price: totalPrice,
        delivery_fee: deliveryFee,
        service_fee: serviceFee,
        total_price: grandTotal,
        delivery_address: location.address,
        customer_location: { lat: location.lat, lng: location.lng },
        status: 'pending',
        restaurants: [...new Set(cartItems.map(item => item.restaurant_name))],
        estimated_delivery: effectiveQuote.estimatedDelivery,
        distance_km: effectiveQuote.routeDistanceKm,
        route_stops: effectiveQuote.stopCount,
        restaurant_locations: restaurantStops.map(restaurant => ({
          id: restaurant.id,
          name: restaurant.name,
          lat: restaurant.location?.lat,
          lng: restaurant.location?.lng,
        })),
        driver_name: 'Dispatch pending',
      };
      localStorage.setItem(`gluttony_order_${fallbackOrderId}`, JSON.stringify(draftOrder));
      clearCart();
      navigate(`/track/${fallbackOrderId}`);
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-screen px-8 text-center pb-20">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-white text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground text-sm mb-6">Add items from restaurants to get started</p>
          <button onClick={() => navigate('/')} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold text-sm">
            Browse Restaurants
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Your Cart</h1>
      </div>

      <div className="px-5 space-y-4 mt-4">
        {Object.entries(itemsByRestaurant).map(([restaurantId, group]) => (
          <div key={restaurantId} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <span className="text-base">🍽️</span>
              <span className="text-white font-semibold text-sm">{group.restaurant_name}</span>
              <span className="text-muted-foreground text-xs ml-auto">{group.items.length} items</span>
            </div>
            <div className="divide-y divide-border">
              {group.items.map(item => (
                <div key={item.menu_item_id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.menu_item_name}</p>
                    <p className="text-primary text-sm font-semibold mt-0.5">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                      className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center"
                    >
                      {item.quantity === 1 ? <Trash2 size={12} className="text-destructive" /> : <Minus size={12} className="text-white" />}
                    </button>
                    <span className="text-white text-sm font-semibold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                      className="w-7 h-7 bg-primary rounded-full flex items-center justify-center"
                    >
                      <Plus size={12} className="text-primary-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <DeliveryMapCard
          points={mapPoints}
          etaLabel={effectiveQuote.estimatedDelivery}
          addressLabel={location.address}
        />

        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-primary" />
            <span className="text-white text-sm font-semibold">Delivery Address</span>
            <button
              onClick={detectCurrentLocation}
              className="ml-auto rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-white"
            >
              {isDetectingLocation ? 'Locating...' : 'Use GPS'}
            </button>
          </div>
          <input
            value={location.address}
            onChange={event => setLocation({ address: event.target.value })}
            className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary border border-transparent transition-colors"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Route distance</span>
            <span className="text-white">{effectiveQuote.routeDistanceLabel}</span>
          </div>
          {locationError ? <p className="text-xs text-red-400 mt-2">{locationError}</p> : null}
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
          <h3 className="text-white font-semibold text-sm">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-white">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery fee</span>
              <span className="text-white">${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service fee</span>
              <span className="text-white">${serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stops</span>
              <span className="text-white">{effectiveQuote.stopCount}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between">
              <span className="text-white font-bold">Total</span>
              <span className="text-primary font-bold text-lg">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={placeOrder}
          disabled={placing}
          className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-bold text-sm disabled:opacity-60 shadow-2xl shadow-primary/30 mb-4"
        >
          {placing ? 'Placing Order...' : `Place Order • $${grandTotal.toFixed(2)}`}
        </motion.button>
      </div>
    </MobileLayout>
  );
}
