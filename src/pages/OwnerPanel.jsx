import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { MOCK_ORDERS, MOCK_RESTAURANTS } from '../lib/mockData';
import { base44 } from '../api/base44Client';
import { useAuthDemo } from '../lib/AuthDemoContext';

const STATUS_BADGE = {
  pending: { label: 'New Order', cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  accepted: { label: 'Accepted', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  preparing: { label: 'Preparing', cls: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  ready: { label: 'Ready', cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  picked_up: { label: 'Picked Up', cls: 'text-primary bg-primary/10 border-primary/20' },
  delivered: { label: 'Delivered', cls: 'text-green-500 bg-green-500/10 border-green-500/20' },
};

const NEXT_STATUS = {
  pending: { label: 'Accept Order', next: 'accepted', color: 'bg-blue-500 text-white' },
  accepted: { label: 'Start Preparing', next: 'preparing', color: 'bg-primary text-primary-foreground' },
  preparing: { label: 'Mark as Ready', next: 'ready', color: 'bg-green-500 text-white' },
};

export default function OwnerPanel() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [updating, setUpdating] = useState(null);
  const { currentUser } = useAuthDemo();
  const navigate = useNavigate();

  // Mock: owner manages "Burger Palace" (r1)
  const myRestaurant = MOCK_RESTAURANTS[0];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await base44.entities.Order.list('-created_date', 50);
      setOrders(data.length > 0 ? data : MOCK_ORDERS);
    } catch {
      setOrders(MOCK_ORDERS);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await base44.entities.Order.update(orderId, { status: newStatus });
    } catch {}
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setUpdating(null);
  };

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const revenue = completedOrders.reduce((s, o) => s + (o.total_price || 0), 0);

  const displayOrders = activeTab === 'active' ? activeOrders : completedOrders;

  return (
    <div className="min-h-screen bg-background font-inter" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* Header */}
      <div className="bg-card border-b border-border px-5 pt-12 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/profile')} className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">{myRestaurant.name}</h1>
            <p className="text-xs text-muted-foreground">Restaurant Panel</p>
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-semibold">Open</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-white">{activeOrders.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-white">{completedOrders.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-primary">${revenue.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-5 mt-5 bg-secondary rounded-xl p-1">
        {['active', 'completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold capitalize transition-all ${activeTab === tab ? 'bg-card text-white shadow' : 'text-muted-foreground'}`}
          >
            {tab} {tab === 'active' ? `(${activeOrders.length})` : `(${completedOrders.length})`}
          </button>
        ))}
      </div>

      <div className="px-5 py-4 space-y-3 pb-8">
        {displayOrders.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 p-10 text-center">
            <div className="text-4xl mb-2">{activeTab === 'active' ? '🍽️' : '✅'}</div>
            <p className="text-muted-foreground text-sm">
              {activeTab === 'active' ? 'No incoming orders right now' : 'No completed orders yet'}
            </p>
          </div>
        ) : (
          displayOrders.map(order => {
            const badge = STATUS_BADGE[order.status] || STATUS_BADGE.pending;
            const next = NEXT_STATUS[order.status];
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border/50 overflow-hidden"
              >
                <div className="px-4 pt-4 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-semibold text-sm">Order #{order.id}</p>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="bg-secondary rounded-xl p-3 mb-3 space-y-1.5">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-white text-xs">{item.quantity}× {item.menu_item_name}</span>
                        <span className="text-muted-foreground text-xs">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="h-px bg-border" />
                    <div className="flex justify-between">
                      <span className="text-white text-xs font-semibold">Total</span>
                      <span className="text-primary text-xs font-bold">${order.total_price?.toFixed(2)}</span>
                    </div>
                  </div>

                  {next && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      disabled={updating === order.id}
                      onClick={() => updateStatus(order.id, next.next)}
                      className={`w-full py-3 rounded-xl text-xs font-bold disabled:opacity-60 ${next.color}`}
                    >
                      {updating === order.id ? 'Updating...' : next.label}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}