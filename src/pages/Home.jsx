import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileLayout from '../components/MobileLayout';
import { useDeliveryLocation } from '../hooks/useDeliveryLocation';
import { buildRestaurantViewModel } from '../lib/delivery';
import { fetchRestaurants } from '../lib/backend';

const CATEGORIES = ['All', 'Burgers', 'Sushi', 'Pizza', 'Indian', 'Mexican', 'Healthy'];

const FEATURED = [
  { id: 'f1', name: 'Smash Burger Special', restaurant: 'Burger Palace', discount: '20% OFF', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', bg: '#2A1A0A' },
  { id: 'f2', name: 'Dragon Roll Combo', restaurant: 'Sushi Zen', discount: 'Free Miso', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80', bg: '#0A1A2A' },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();
  const { location, detectCurrentLocation, isDetectingLocation } = useDeliveryLocation();

  useEffect(() => {
    let active = true;

    fetchRestaurants().then(data => {
      if (active) setRestaurants(data);
    });

    return () => {
      active = false;
    };
  }, []);

  const filtered = restaurants
    .map(restaurant => buildRestaurantViewModel(restaurant, location))
    .filter(Boolean)
    .filter(restaurant => {
      const matchesCategory =
        activeCategory === 'All' ||
        restaurant.tags?.includes(activeCategory) ||
        restaurant.cuisine === activeCategory;
      const matchesSearch =
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER));

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-0.5">
              <MapPin size={12} className="text-primary" />
              <span>Delivering to</span>
            </div>
            <h2 className="text-white font-semibold text-base">{location.address}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={detectCurrentLocation}
              className="rounded-full bg-secondary border border-border px-3 h-10 text-[11px] font-semibold text-white"
            >
              {isDetectingLocation ? 'Locating...' : 'Use GPS'}
            </button>
            <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center">
              <span className="text-lg">👤</span>
            </button>
          </div>
        </div>

        <div className="mt-4 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder="Search restaurants, cuisines..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="px-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={16} className="text-primary" />
          <span className="text-white font-semibold text-sm">Featured Deals</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {FEATURED.map(feature => (
            <motion.div
              key={feature.id}
              whileTap={{ scale: 0.97 }}
              className="flex-shrink-0 w-64 rounded-2xl overflow-hidden relative h-36 cursor-pointer"
              style={{ backgroundColor: feature.bg }}
            >
              <img src={feature.image} alt={feature.name} className="absolute right-0 top-0 w-36 h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="relative p-4">
                <span className="text-xs font-bold text-primary bg-primary/20 rounded-full px-2 py-0.5">{feature.discount}</span>
                <p className="text-white font-bold text-sm mt-2 leading-tight">{feature.name}</p>
                <p className="text-white/60 text-xs mt-0.5">{feature.restaurant}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-5 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeCategory === category ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground border border-border'}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">
            {activeCategory === 'All' ? 'Nearby Restaurants' : activeCategory}
            <span className="text-muted-foreground font-normal ml-2">{filtered.length} places</span>
          </h3>
        </div>
        <div className="space-y-3 pb-4">
          {filtered.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/restaurant/${restaurant.id}`}>
                <div className="bg-card rounded-2xl overflow-hidden border border-border/50 active:scale-[0.98] transition-transform">
                  <div className="relative h-44">
                    <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    {!restaurant.is_open && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm bg-black/50 px-3 py-1 rounded-full">Closed</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="bg-black/70 backdrop-blur text-white text-xs px-2 py-1 rounded-full font-medium">{restaurant.cuisine}</span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <h4 className="text-white font-bold text-base">{restaurant.name}</h4>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star size={13} className="text-primary fill-primary" />
                      <span className="text-white text-xs font-semibold">{restaurant.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={13} className="text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">{restaurant.deliveryEta}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                      <span className="text-muted-foreground text-xs">{restaurant.distanceLabel}</span>
                      <span className="text-muted-foreground text-xs">${restaurant.dynamicDeliveryFee.toFixed(2)} delivery</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
