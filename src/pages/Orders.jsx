import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock } from 'lucide-react';
import MobileLayout from '../components/MobileLayout';
import { MOCK_ORDERS } from '../lib/mockData';
import { useAuthDemo } from '../lib/AuthDemoContext';
import { base44 } from '../api/base44Client';

const STATUS_COLORS = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  accepted: 'text-blue-400 bg-blue-400/10',
  preparing: 'text-orange-400 bg-orange-400/10',
  ready: 'text-green-400 bg-green-400/10',
  picked_up: 'text-primary bg-primary/10',
  delivered: 'text-green-500 bg-green-500/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

const STATUS_LABELS = {
  pending: 'Pending', accepted: 'Accepted', preparing: 'Preparing',
  ready: 'Ready', picked_up: 'On the way', delivered: 'Delivered', cancelled: 'Cancelled'
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const { currentUser } = useAuthDemo();
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await base44.entities.Order.filter({ customer_email: currentUser?.email });
      setOrders(data.length > 0 ? data : MOCK_ORDERS.slice(0, 2));
    } catch {
      setOrders(MOCK_ORDERS.slice(0, 2));
    }
  };

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-white">Your Orders</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Track and reorder</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-8 text-center pt-24">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-white font-bold text-lg mb-2">No orders yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Place your first order to see it here</p>
          <button onClick={() => navigate('/')} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm">
            Order Now
          </button>
        </div>
      ) : (
        <div className="px-5 space-y-3">
          {orders.map(order => (
            <button
              key={order.id}
              onClick={() => navigate(`/track/${order.id}`)}
              className="w-full bg-card rounded-2xl border border-border/50 p-4 text-left active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold text-sm">Order #{order.id}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{order.restaurants?.join(', ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'text-muted-foreground bg-secondary'}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs">{order.items?.length} items</p>
                <p className="text-primary font-bold text-sm">${order.total_price?.toFixed(2)}</p>
              </div>
              {order.estimated_delivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="mt-2 flex items-center gap-1.5">
                  <Clock size={12} className="text-primary" />
                  <span className="text-primary text-xs font-medium">Est. {order.estimated_delivery}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </MobileLayout>
  );
}