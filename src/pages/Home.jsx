import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Clock, ChevronRight, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileLayout from '../components/MobileLayout';
import { MOCK_RESTAURANTS } from '../lib/mockData';
import { useAuthDemo } from '../lib/AuthDemoContext';

const CATEGORIES = ['All', 'Burgers', 'Sushi', 'Pizza', 'Indian', 'Mexican', 'Healthy'];

const FEATURED = [
  { id: 'f1', name: 'Smash Burger Special', restaurant: 'Burger Palace', discount: '20% OFF', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', bg: '#2A1A0A' },
  { id: 'f2', name: 'Dragon Roll Combo', restaurant: 'Sushi Zen', discount: 'Free Miso', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80', bg: '#0A1A2A' },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = useAuthDemo();
  const navigate = useNavigate();

  const filtered = MOCK_RESTAURANTS.filter(r => {
    const matchesCategory = activeCategory === 'All' || r.tags?.includes(activeCategory) || r.cuisine === activeCategory;
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <MobileLayout>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-0.5">
              <MapPin size={12} className="text-primary" />
              <span>Delivering to</span>
            </div>
            <h2 className="text-white font-semibold text-base">Current Location</h2>
          </div>
          <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center">
            <span className="text-lg">👤</span>
          </button>
        </div>

        <div className="mt-4 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search restaurants, cuisines..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Featured */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Flame size={16} className="text-primary" />
          <span className="text-white font-semibold text-sm">Featured Deals</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {FEATURED.map(f => (
            <motion.div
              key={f.id}
              whileTap={{ scale: 0.97 }}
              className="flex-shrink-0 w-64 rounded-2xl overflow-hidden relative h-36 cursor-pointer"
              style={{ backgroundColor: f.bg }}
            >
              <img src={f.image} alt={f.name} className="absolute right-0 top-0 w-36 h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="relative p-4">
                <span className="text-xs font-bold text-primary bg-primary/20 rounded-full px-2 py-0.5">{f.discount}</span>
                <p className="text-white font-bold text-sm mt-2 leading-tight">{f.name}</p>
                <p className="text-white/60 text-xs mt-0.5">{f.restaurant}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground border border-border'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurants */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">
            {activeCategory === 'All' ? 'Nearby Restaurants' : activeCategory}
            <span className="text-muted-foreground font-normal ml-2">{filtered.length} places</span>
          </h3>
        </div>
        <div className="space-y-3 pb-4">
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/restaurant/${r.id}`}>
                <div className="bg-card rounded-2xl overflow-hidden border border-border/50 active:scale-[0.98] transition-transform">
                  <div className="relative h-44">
                    <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    {!r.is_open && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm bg-black/50 px-3 py-1 rounded-full">Closed</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="bg-black/70 backdrop-blur text-white text-xs px-2 py-1 rounded-full font-medium">{r.cuisine}</span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <h4 className="text-white font-bold text-base">{r.name}</h4>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star size={13} className="text-primary fill-primary" />
                      <span className="text-white text-xs font-semibold">{r.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={13} className="text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">{r.delivery_time}</span>
                    </div>
                    <div className="ml-auto">
                      <span className="text-muted-foreground text-xs">{r.delivery_fee === 0 ? 'Free delivery' : `$${r.delivery_fee} delivery`}</span>
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