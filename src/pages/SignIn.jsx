import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthDemo } from '../lib/AuthDemoContext';
import { motion } from 'framer-motion';

const DEMO_CREDS = [
  { email: 'customer@demo.com', role: 'Customer', icon: '🛍️' },
  { email: 'driver@demo.com', role: 'Driver', icon: '🚗' },
  { email: 'owner@demo.com', role: 'Restaurant Owner', icon: '🍽️' },
  { email: 'admin@demo.com', role: 'Admin', icon: '⚙️' },
];

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthDemo();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (result.success) {
        const routes = { customer: '/', driver: '/driver', owner: '/owner', admin: '/admin' };
        navigate(routes[result.role] || '/');
      } else {
        setError(result.error);
      }
    }, 600);
  };

  const quickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-inter" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* Hero */}
      <div className="relative h-64 overflow-hidden flex-shrink-0">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
          alt="Food"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background" />
        <div className="absolute bottom-6 left-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-white tracking-tight">Gluttony</span>
          </div>
          <p className="text-white/70 text-sm">Order from anywhere, delivered fast</p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-6 pb-8 overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
        <p className="text-muted-foreground text-sm mb-6">Sign in to your account</p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-red-400 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-white placeholder-muted-foreground focus:outline-none focus:border-primary text-sm transition-colors"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-white placeholder-muted-foreground focus:outline-none focus:border-primary text-sm transition-colors"
              required
            />
          </div>
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-4 text-sm transition-opacity disabled:opacity-60 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">Quick Demo Login</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_CREDS.map(c => (
              <button
                key={c.email}
                onClick={() => quickLogin(c.email)}
                className="bg-secondary border border-border rounded-xl px-3 py-2.5 text-left transition-all hover:border-primary/60 active:scale-95"
              >
                <div className="text-base mb-0.5">{c.icon}</div>
                <div className="text-xs font-medium text-white">{c.role}</div>
                <div className="text-[10px] text-muted-foreground truncate">{c.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}