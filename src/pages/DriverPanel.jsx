import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { fetchOrders, updateOrderStatus } from '../lib/backend';
import { getDriverLocation } from '../lib/delivery';
import DeliveryMapCard from '../components/DeliveryMapCard';

const STATUS_BADGE = {
  pending: { label: 'Pending', cls: 'text-yellow-400 bg-yellow-400/10' },
  preparing: { label: 'Preparing', cls: 'text-orange-400 bg-orange-400/10' },
  ready: { label: 'Ready for Pickup', cls: 'text-green-400 bg-green-400/10' },
  picked_up: { label: 'Picked Up', cls: 'text-primary bg-primary/10' },
  delivered: { label: 'Delivered', cls: 'text-green-500 bg-green-500/10' },
};

export default function DriverPanel() {
  const [orders, setOrders] = useState([]);
  const [updating, setUpdating] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    fetchOrders({ driverEmail: currentUser?.email }).then(data => {
      if (active) setOrders(data.filter(order => order.status !== 'cancelled'));
    });
    return () => {
      active = false;
    };
  }, [currentUser?.email]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const updatedOrder = await updateOrderStatus(orderId, {
        status: newStatus,
        driverEmail: currentUser?.email,
        driverName: currentUser?.full_name,
      });
      setOrders(prev => prev.map(order => (order.id === orderId ? updatedOrder : order)));
    } catch {
      setOrders(prev => prev.map(order => (order.id === orderId ? { ...order, status: newStatus } : order)));
    } finally {
      setUpdating(null);
    }
  };

  const activeOrders = orders.filter(order => !['delivered', 'cancelled'].includes(order.status));
  const completedOrders = orders.filter(order => order.status === 'delivered');

  return (
    <div className="min-h-screen bg-background font-inter" style={{ maxWidth: 430, margin: '0 auto' }}>
      <div className="bg-card border-b border-border px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/profile')} className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Driver Panel</h1>
            <p className="text-xs text-muted-foreground">{currentUser?.full_name}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-semibold">Online</span>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-white">{activeOrders.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-white">{completedOrders.length}</p>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </div>
          <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-primary">${(completedOrders.reduce((sum, order) => sum + (order.total_price || 0), 0) * 0.1).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Earnings</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Active Orders</p>
          {activeOrders.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
              <div className="text-4xl mb-2">🚗</div>
              <p className="text-muted-foreground text-sm">No active orders right now</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map(order => {
                const badge = STATUS_BADGE[order.status] || STATUS_BADGE.pending;
                const driverLocation = order.driver_location || getDriverLocation(order);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl border border-border/50 overflow-hidden"
                  >
                    <div className="px-4 pt-4 pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-white font-semibold text-sm">Order #{order.id}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">{order.restaurants?.join(', ')}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex items-start gap-2 bg-secondary rounded-xl p-3 mb-3">
                        <Package size={14} className="text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Pickup from</p>
                          <p className="text-white text-xs font-medium">{order.restaurants?.[0]}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-secondary rounded-xl p-3">
                        <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Deliver to</p>
                          <p className="text-white text-xs font-medium">{order.delivery_address}</p>
                          <p className="text-primary text-[11px] mt-1">{order.estimated_delivery} • {order.distance_km ? `${order.distance_km.toFixed(1)} km` : 'Awaiting route'}</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <DeliveryMapCard
                          points={[
                            ...(order.restaurant_locations || []).map(restaurant => ({
                              id: restaurant.id,
                              label: restaurant.name,
                              type: 'restaurant',
                              lat: restaurant.lat,
                              lng: restaurant.lng,
                            })),
                            ...(driverLocation
                              ? [{
                                  id: 'driver',
                                  label: order.driver_name || currentUser?.full_name || 'Driver',
                                  type: 'driver',
                                  lat: driverLocation.lat,
                                  lng: driverLocation.lng,
                                }]
                              : []),
                            ...(order.customer_location
                              ? [{
                                  id: 'customer',
                                  label: order.delivery_address,
                                  type: 'customer',
                                  lat: order.customer_location.lat,
                                  lng: order.customer_location.lng,
                                }]
                              : []),
                          ]}
                          etaLabel={order.estimated_delivery}
                          addressLabel={order.delivery_address}
                        />
                      </div>

                      <div className="mt-3 flex gap-2">
                        {order.status === 'ready' && (
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            disabled={updating === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'picked_up')}
                            className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl text-xs font-bold disabled:opacity-60"
                          >
                            {updating === order.id ? 'Updating...' : '📦 Mark as Picked Up'}
                          </motion.button>
                        )}
                        {order.status === 'picked_up' && (
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            disabled={updating === order.id}
                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                            className="flex-1 bg-green-500 text-white py-3 rounded-xl text-xs font-bold disabled:opacity-60"
                          >
                            {updating === order.id ? 'Updating...' : '✅ Mark as Delivered'}
                          </motion.button>
                        )}
                        {['pending', 'preparing', 'accepted'].includes(order.status) && (
                          <div className="flex-1 bg-secondary rounded-xl py-3 text-center">
                            <span className="text-muted-foreground text-xs">Waiting for restaurant...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {completedOrders.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Completed Today</p>
            <div className="space-y-2">
              {completedOrders.map(order => (
                <div key={order.id} className="bg-card rounded-2xl border border-border/50 px-4 py-3 flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">Order #{order.id}</p>
                    <p className="text-muted-foreground text-xs truncate">{order.delivery_address}</p>
                  </div>
                  <span className="text-primary font-bold text-sm">${order.total_price?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
