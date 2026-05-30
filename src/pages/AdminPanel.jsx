import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Store, ShoppingBag, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { fetchOrders, fetchRestaurants } from '../lib/backend';

const STATUS_COLORS = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  accepted: 'text-blue-400 bg-blue-400/10',
  preparing: 'text-orange-400 bg-orange-400/10',
  ready: 'text-green-400 bg-green-400/10',
  picked_up: 'text-primary bg-primary/10',
  delivered: 'text-green-500 bg-green-500/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

export default function AdminPanel() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    Promise.all([fetchOrders(), fetchRestaurants()]).then(([orderData, restaurantData]) => {
      if (!active) return;
      setOrders(orderData);
      setRestaurants(restaurantData);
    });
    return () => {
      active = false;
    };
  }, []);

  const totalOrders = orders.length;
  const activeOrders = orders.filter(order => !['delivered', 'cancelled'].includes(order.status)).length;
  const totalRevenue = orders.filter(order => order.status === 'delivered').reduce((sum, order) => sum + (order.total_price || 0), 0);
  const totalRestaurants = restaurants.length;

  const stats = [
    { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Active Orders', value: activeOrders, icon: Activity, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Restaurants', value: totalRestaurants, icon: Store, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  return (
    <div className="min-h-screen bg-background font-inter" style={{ maxWidth: 430, margin: '0 auto' }}>
      <div className="bg-card border-b border-border px-5 pt-12 pb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/profile')} className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">{currentUser?.full_name} • Platform Overview</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Overview</p>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ label, value, icon: StatIcon, color, bg }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-2xl border border-border/50 p-4"
              >
                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                  <StatIcon size={16} className={color} />
                </div>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Restaurants</p>
          <div className="space-y-2">
            {restaurants.slice(0, 4).map(restaurant => (
              <div key={restaurant.id} className="bg-card rounded-2xl border border-border/50 px-4 py-3 flex items-center gap-3">
                <img src={restaurant.image_url} alt={restaurant.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{restaurant.name}</p>
                  <p className="text-muted-foreground text-xs">{restaurant.cuisine} • ⭐ {restaurant.rating}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${restaurant.is_open ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                  {restaurant.is_open ? 'Open' : 'Closed'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Orders</p>
          <div className="space-y-2">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="bg-card rounded-2xl border border-border/50 px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-white text-sm font-medium">#{order.id}</span>
                    <span className="text-muted-foreground text-xs ml-2">{order.restaurants?.join(', ')}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || 'text-muted-foreground bg-secondary'}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">{order.customer_email}</span>
                  <span className="text-primary text-xs font-bold">${order.total_price?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
