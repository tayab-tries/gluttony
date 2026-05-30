import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileLayout from '../components/MobileLayout';
import { useCart } from '../lib/CartContext';
import { useDeliveryLocation } from '../hooks/useDeliveryLocation';
import { buildRestaurantViewModel } from '../lib/delivery';
import { fetchRestaurantMenu, fetchRestaurants } from '../lib/backend';

export default function RestaurantMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, cartItems, totalItems } = useCart();
  const { location } = useDeliveryLocation();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      const [restaurants, menu] = await Promise.all([
        fetchRestaurants(),
        fetchRestaurantMenu(id),
      ]);

      if (!active) return;

      const currentRestaurant = buildRestaurantViewModel(
        restaurants.find(entry => entry.id === id),
        location
      );
      setRestaurant(currentRestaurant);
      setMenuItems(menu);
      const firstCategory = [...new Set(menu.map(item => item.category))][0] || '';
      setActiveCategory(firstCategory);
    }

    load();

    return () => {
      active = false;
    };
  }, [id, location]);

  if (!restaurant) return null;

  const categories = [...new Set(menuItems.map(item => item.category))];

  const getQuantity = itemId => {
    const cartItem = cartItems.find(item => item.menu_item_id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const filtered = activeCategory ? menuItems.filter(item => item.category === activeCategory) : menuItems;

  return (
    <MobileLayout>
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

      <div className="px-5 -mt-4 relative z-10 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold text-white mb-1">{restaurant.name}</h1>
        <p className="text-muted-foreground text-sm mb-3">{restaurant.cuisine} • {restaurant.address}</p>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 bg-secondary rounded-xl px-3 py-2">
            <Star size={13} className="text-primary fill-primary" />
            <span className="text-white text-xs font-semibold">{restaurant.rating}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-secondary rounded-xl px-3 py-2">
            <Clock size={13} className="text-muted-foreground" />
            <span className="text-white text-xs">{restaurant.deliveryEta}</span>
          </div>
          <div className="bg-secondary rounded-xl px-3 py-2">
            <span className="text-xs text-white">${restaurant.dynamicDeliveryFee.toFixed(2)} delivery</span>
          </div>
          <div className="bg-secondary rounded-xl px-3 py-2">
            <span className="text-xs text-white">{restaurant.distanceLabel} away</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-5 py-4 overflow-x-auto scrollbar-hide border-b border-border">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeCategory === category ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="px-5 py-4 space-y-3 pb-4">
        {filtered.map(item => {
          const quantity = getQuantity(item.id);
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
                    {quantity === 0 ? (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addToCart(item, restaurant)}
                        className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-primary/30"
                      >
                        <Plus size={16} strokeWidth={2.5} />
                      </motion.button>
                    ) : (
                      <div className="flex items-center gap-1 bg-primary rounded-full px-2 py-1 shadow-lg shadow-primary/30">
                        <button onClick={() => updateQuantity(item.id, quantity - 1)}>
                          <Minus size={13} className="text-primary-foreground" strokeWidth={3} />
                        </button>
                        <span className="text-primary-foreground text-xs font-bold w-4 text-center">{quantity}</span>
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
