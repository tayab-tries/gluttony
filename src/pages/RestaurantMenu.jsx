import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileLayout from '../components/MobileLayout';
import { MOCK_RESTAURANTS, MOCK_MENU_ITEMS } from '../lib/mockData';
import { useCart } from '../lib/CartContext';

export default function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, cartItems, totalItems } = useCart();

  const restaurant = MOCK_RESTAURANTS.find(r => r.id === id);
  const menuItems = MOCK_MENU_ITEMS[id] || [];
  const categories = [...new Set(menuItems.map(i => i.category))];
  const [activeCategory, setActiveCategory] = useState(categories[0] || '');

  if (!restaurant) return null;

  const getQuantity = (itemId) => {
    const ci = cartItems.find(i => i.menu_item_id === itemId);
    return ci ? ci.quantity : 0;
  };

  const filtered = activeCategory ? menuItems.filter(i => i.category === activeCategory) : menuItems;

  return (
    <MobileLayout>
      {/* Hero */}
      <div className="relative h-56">
        <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-9 h-9 bg-black/50 backdrop-blur rounded-full flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
      </div>

      {/* Info */}
      <div className="px-5 -mt-4 relative z-10 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold text-white mb-1">{restaurant.name}</h1>
        <p className="text-muted-foreground text-sm mb-3">{restaurant.cuisine} • {restaurant.address}</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-secondary rounded-xl px-3 py-2">
            <Star size={13} className="text-primary fill-primary" />
            <span className="text-white text-xs font-semibold">{restaurant.rating}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-secondary rounded-xl px-3 py-2">
            <Clock size={13} className="text-muted-foreground" />
            <span className="text-white text-xs">{restaurant.delivery_time}</span>
          </div>
          <div className="bg-secondary rounded-xl px-3 py-2">
            <span className="text-xs text-white">{restaurant.delivery_fee === 0 ? 'Free delivery' : `$${restaurant.delivery_fee} delivery`}</span>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 px-5 py-4 overflow-x-auto scrollbar-hide border-b border-border">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="px-5 py-4 space-y-3 pb-4">
        {filtered.map(item => {
          const qty = getQuantity(item.id);
          return (
            <div key={item.id} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              <div className="flex gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold text-sm mb-1">{item.name}</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-2 line-clamp-2">{item.description}</p>
                  <span className="text-primary font-bold text-base">${item.price.toFixed(2)}</span>
                </div>
                <div className="relative flex-shrink-0">
                  <img src={item.image_url} alt={item.name} className="w-24 h-20 object-cover rounded-xl" />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                    {qty === 0 ? (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addToCart(item, restaurant)}
                        className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-primary/30"
                      >
                        <Plus size={16} strokeWidth={2.5} />
                      </motion.button>
                    ) : (
                      <div className="flex items-center gap-1 bg-primary rounded-full px-2 py-1 shadow-lg shadow-primary/30">
                        <button onClick={() => updateQuantity(item.id, qty - 1)}>
                          <Minus size={13} className="text-primary-foreground" strokeWidth={3} />
                        </button>
                        <span className="text-primary-foreground text-xs font-bold w-4 text-center">{qty}</span>
                        <button onClick={() => addToCart(item, restaurant)}>
                          <Plus size={13} className="text-primary-foreground" strokeWidth={3} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Cart CTA */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[390px] z-50"
          >
            <button
              onClick={() => navigate('/cart')}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-semibold text-sm flex items-center justify-between px-5 shadow-2xl shadow-primary/40"
            >
              <span className="bg-primary-foreground/20 rounded-lg px-2 py-0.5 text-xs font-bold">{totalItems}</span>
              <span>View Cart</span>
              <ShoppingBag size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileLayout>
  );
}