import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, MessageCircle, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileLayout from '../components/MobileLayout';
import { MOCK_ORDERS } from '../lib/mockData';
import { base44 } from '../api/base44Client';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '📋', description: 'Restaurant notified' },
  { key: 'accepted', label: 'Accepted', icon: '✅', description: 'Restaurant accepted your order' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', description: 'Chef is cooking your food' },
  { key: 'ready', label: 'Ready', icon: '📦', description: 'Order packed and ready' },
  { key: 'picked_up', label: 'Picked Up', icon: '🚗', description: 'Driver is on the way' },
  { key: 'delivered', label: 'Delivered', icon: '🎉', description: 'Enjoy your meal!' },
];

const STATUS_ORDER = ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered'];

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const data = await base44.entities.Order.filter({ id });
      if (data && data.length > 0) {
        setOrder(data[0]);
      } else {
        setOrder(MOCK_ORDERS.find(o => o.id === id) || MOCK_ORDERS[0]);
      }
    } catch {
      setOrder(MOCK_ORDERS.find(o => o.id === id) || MOCK_ORDERS[0]);
    }
  };

  if (!order) return (
    <MobileLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </MobileLayout>
  );

  const currentStepIndex = STATUS_ORDER.indexOf(order.status);

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-2 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Order Tracking</h1>
          <p className="text-xs text-muted-foreground">#{order.id}</p>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="mx-5 mt-4 rounded-2xl overflow-hidden h-40 relative bg-secondary border border-border">
        <img
          src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=600&q=80"
          alt="Map"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-1">🗺️</div>
            <p className="text-muted-foreground text-xs">Live tracking available</p>
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3 bg-card/90 backdrop-blur rounded-xl px-3 py-2 flex items-center gap-2">
          <MapPin size={14} className="text-primary flex-shrink-0" />
          <p className="text-white text-xs truncate">{order.delivery_address}</p>
          <span className="text-primary text-xs font-semibold ml-auto flex-shrink-0">{order.estimated_delivery}</span>
        </div>
      </div>

      {/* Status Steps */}
      <div className="mx-5 mt-5 bg-card rounded-2xl border border-border/50 p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Order Status</h3>
        <div className="space-y-1">
          {STATUS_STEPS.map((step, i) => {
            const isCompleted = i <= currentStepIndex;
            const isActive = i === currentStepIndex;
            const isFuture = i > currentStepIndex;
            return (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 transition-all ${
                      isCompleted ? 'bg-primary/20' : 'bg-secondary'
                    } ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                  >
                    {isCompleted ? (
                      i < currentStepIndex ? <CheckCircle2 size={16} className="text-primary" /> : <span>{step.icon}</span>
                    ) : (
                      <Circle size={16} className="text-muted-foreground/40" />
                    )}
                  </motion.div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`w-0.5 h-6 mt-1 ${i < currentStepIndex ? 'bg-primary/40' : 'bg-border'}`} />
                  )}
                </div>
                <div className="pb-4 pt-1.5 flex-1">
                  <p className={`text-sm font-semibold ${isCompleted ? 'text-white' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  {isActive && (
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Driver Info */}
      {(order.status === 'picked_up' || order.status === 'ready') && (
        <div className="mx-5 mt-4 bg-card rounded-2xl border border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-2xl">🚗</div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Marcus Rivera</p>
              <p className="text-muted-foreground text-xs">Your delivery driver</p>
            </div>
            <div className="flex gap-2">
              <button className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center">
                <Phone size={15} className="text-primary" />
              </button>
              <button className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center">
                <MessageCircle size={15} className="text-primary" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="mx-5 mt-4 mb-6 bg-card rounded-2xl border border-border/50 p-4">
        <h3 className="text-white font-semibold text-sm mb-3">Order Items</h3>
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{item.quantity}x</span>
                <span className="text-white text-sm">{item.menu_item_name}</span>
              </div>
              <span className="text-primary text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="h-px bg-border mt-2 pt-2" />
          <div className="flex justify-between font-bold">
            <span className="text-white">Total</span>
            <span className="text-primary">${order.total_price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}