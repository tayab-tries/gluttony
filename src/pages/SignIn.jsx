import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';

const ROLE_OPTIONS = [
  { value: 'customer', label: 'Customer' },
  { value: 'driver', label: 'Driver' },
  { value: 'owner', label: 'Restaurant Owner' },
  { value: 'admin', label: 'Admin' },
];

export default function SignIn() {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, hasSupabaseEnv } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const result =
      mode === 'signin'
        ? await signIn({ email: form.email, password: form.password })
        : await signUp({
            email: form.email,
            password: form.password,
            fullName: form.fullName,
            role: form.role,
          });

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    if (mode === 'signup' && result.needsEmailConfirmation) {
      setMessage('Account created. Check your email to confirm the account before signing in.');
      setMode('signin');
      return;
    }

    navigate('/');
  };

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-inter" style={{ maxWidth: 430, margin: '0 auto' }}>
      <div className="relative h-64 overflow-hidden flex-shrink-0">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
          alt="Food"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background" />
        <div className="absolute bottom-6 left-6">
          <span className="text-2xl font-bold text-white tracking-tight">Gluttony</span>
        </div>
      </div>

      <div className="flex-1 px-6 pt-6 pb-8 overflow-y-auto">
        <div className="flex gap-2 mb-6 bg-secondary rounded-xl p-1">
          {['signin', 'signup'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setMode(tab);
                setError('');
                setMessage('');
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                mode === tab ? 'bg-card text-white shadow' : 'text-muted-foreground'
              }`}
            >
              {tab === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="text-muted-foreground text-sm mb-6">
          {mode === 'signin' ? 'Use your account to continue' : 'Create a role-based account for the app'}
        </p>

        {!hasSupabaseEnv && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-sm text-yellow-300 mb-4">
            Supabase env vars are not configured yet. Fill `.env` before auth will work.
          </div>
        )}

        {error ? (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-red-400 mb-4">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 text-sm text-primary mb-4">
            {message}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={event => updateField('fullName', event.target.value)}
                  placeholder="Jordan Park"
                  className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-white placeholder-muted-foreground focus:outline-none focus:border-primary text-sm transition-colors"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Role</label>
                <select
                  value={form.role}
                  onChange={event => updateField('role', event.target.value)}
                  className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary text-sm transition-colors"
                >
                  {ROLE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={event => updateField('email', event.target.value)}
              placeholder="your@email.com"
              className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-white placeholder-muted-foreground focus:outline-none focus:border-primary text-sm transition-colors"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={event => updateField('password', event.target.value)}
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
            {loading
              ? mode === 'signin'
                ? 'Signing in...'
                : 'Creating account...'
              : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
