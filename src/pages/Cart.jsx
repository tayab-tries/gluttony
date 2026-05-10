import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, ChevronRight, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileLayout from '../components/MobileLayout';
import { useCart } from '../lib/CartContext';
import { useAuthDemo } from '../lib/AuthDemoContext';
import { base44 } from '../api/base44Client';

export default function Cart() {
  const { cartItems, itemsByRestaurant, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const { currentUser } = useAuthDemo();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState('42 Customer Lane, Apt 5');

  const deliveryFee = 2.49;
  const serviceFee = 0.99;
  const grandTotal = totalPrice + deliveryFee + serviceFee;

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const order = await base44.entities.Order.create({
        customer_email: currentUser?.email || 'guest@demo.com',
        items: cartItems,
        total_price: grandTotal,
        delivery_address: address,
        status: 'pending',
        restaurants: [...new Set(cartItems.map(i => i.restaurant_name))],
        estimated_delivery: '35 min',
      });
      clearCart();
      navigate(`/track/${order.id}`);
    } catch (err) {
      // Fallback to mock order ID
      clearCart();
      navigate(`/track/ord1`);
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
        {/* Items grouped by restaurant */}
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

        {/* Delivery Address */}
        <div className="bg-card rounded-2xl border border-border/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-primary" />
            <span className="text-white text-sm font-semibold">Delivery Address</span>
          </div>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full bg-secondary rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary border border-transparent transition-colors"
          />
        </div>

        {/* Order Summary */}
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