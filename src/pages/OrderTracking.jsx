import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileLayout from '../components/MobileLayout';
import DeliveryMapCard from '../components/DeliveryMapCard';
import { getDriverLocation, getOrderRoutePoints } from '../lib/delivery';
import { fetchOrder } from '../lib/backend';

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
    let active = true;
    let intervalId = null;

    async function load() {
      let currentOrder = null;
      try {
        const data = await fetchOrder(id);
        if (data) {
          currentOrder = data;
        }
      } catch (err) {}

      if (!currentOrder) {
        const localDraft = localStorage.getItem(`gluttony_order_${id}`);
        if (localDraft) {
          currentOrder = JSON.parse(localDraft);
        }
      }

      if (currentOrder && active) {
        setOrder(currentOrder);
        if (['delivered', 'cancelled'].includes(currentOrder.status) && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
    }

    load();

    intervalId = setInterval(() => {
      load();
    }, 3000);

    return () => {
      active = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [id]);

  if (!order) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  const currentStepIndex = STATUS_ORDER.indexOf(order.status);
  const derivedDriverLocation = order.driver_location || getDriverLocation(order);
  const routePoints = getOrderRoutePoints({
    ...order,
    driver_location: derivedDriverLocation,
  });

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

      <div className="mx-5 mt-4">
        <DeliveryMapCard
          points={routePoints}
          etaLabel={order.estimated_delivery}
          addressLabel={order.delivery_address}
        />
      </div>

      <div className="mx-5 mt-5 bg-card rounded-2xl border border-border/50 p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Order Status</h3>
        <div className="space-y-1">
          {STATUS_STEPS.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isActive = index === currentStepIndex;
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
                      index < currentStepIndex ? <CheckCircle2 size={16} className="text-primary" /> : <span>{step.icon}</span>
                    ) : (
                      <Circle size={16} className="text-muted-foreground/40" />
                    )}
                  </motion.div>
                  {index < STATUS_STEPS.length - 1 && (
                    <div className={`w-0.5 h-6 mt-1 ${index < currentStepIndex ? 'bg-primary/40' : 'bg-border'}`} />
                  )}
                </div>
                <div className="pb-4 pt-1.5 flex-1">
                  <p className={`text-sm font-semibold ${isCompleted ? 'text-white' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  {isActive ? <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {(order.status === 'picked_up' || order.status === 'ready') && (
        <div className="mx-5 mt-4 bg-card rounded-2xl border border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-2xl">🚗</div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{order.driver_name || 'Driver assigned soon'}</p>
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

      <div className="mx-5 mt-4 mb-6 bg-card rounded-2xl border border-border/50 p-4">
        <h3 className="text-white font-semibold text-sm mb-3">Order Items</h3>
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{item.quantity}x</span>
                <span className="text-white text-sm">{item.menu_item_name}</span>
              </div>
              <span className="text-primary text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="h-px bg-border mt-2 pt-2" />
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Delivery fee</span>
            <span className="text-white">${(order.delivery_fee || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Distance</span>
            <span className="text-white">{order.distance_km ? `${order.distance_km.toFixed(1)} km` : 'Pending'}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-white">Total</span>
            <span className="text-primary">${order.total_price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
