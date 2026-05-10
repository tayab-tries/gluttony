import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, User, MapPin, Bell, CreditCard, HelpCircle, Star } from 'lucide-react';
import MobileLayout from '../components/MobileLayout';
import { useAuthDemo } from '../lib/AuthDemoContext';

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Personal Information' },
      { icon: MapPin, label: 'Saved Addresses' },
      { icon: CreditCard, label: 'Payment Methods' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications' },
      { icon: Star, label: 'Favorites' },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help & Support' },
    ]
  }
];

export default function Profile() {
  const { currentUser, logout } = useAuthDemo();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const roleLabel = {
    customer: '🛍️ Customer', driver: '🚗 Driver', owner: '🍽️ Restaurant Owner', admin: '⚙️ Admin'
  }[currentUser?.role] || '🛍️ Customer';

  return (
    <MobileLayout>
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
      </div>

      {/* User Card */}
      <div className="mx-5 mb-6 bg-card rounded-2xl border border-border/50 p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-3xl">
            {currentUser?.role === 'driver' ? '🚗' : currentUser?.role === 'owner' ? '🍽️' : currentUser?.role === 'admin' ? '⚙️' : '👤'}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg">{currentUser?.full_name || 'Guest User'}</h3>
            <p className="text-muted-foreground text-sm">{currentUser?.email}</p>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full mt-1 inline-block">
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="px-5 space-y-4">
        {MENU_SECTIONS.map(section => (
          <div key={section.title}>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">{section.title}</p>
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              {section.items.map(({ icon: Icon, label }, i) => (
                <button key={label} className={`w-full flex items-center gap-3 px-4 py-4 text-left active:bg-secondary transition-colors ${i > 0 ? 'border-t border-border' : ''}`}>
                  <div className="w-8 h-8 bg-secondary rounded-xl flex items-center justify-center">
                    <Icon size={15} className="text-muted-foreground" />
                  </div>
                  <span className="text-white text-sm flex-1">{label}</span>
                  <ChevronRight size={15} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Role switcher shortcut */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Role Panels</p>
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            {currentUser?.role === 'driver' && (
              <button onClick={() => navigate('/driver')} className="w-full flex items-center gap-3 px-4 py-4 text-left">
                <span className="text-lg">🚗</span>
                <span className="text-white text-sm flex-1">Driver Panel</span>
                <ChevronRight size={15} className="text-muted-foreground" />
              </button>
            )}
            {currentUser?.role === 'owner' && (
              <button onClick={() => navigate('/owner')} className="w-full flex items-center gap-3 px-4 py-4 text-left">
                <span className="text-lg">🍽️</span>
                <span className="text-white text-sm flex-1">Restaurant Panel</span>
                <ChevronRight size={15} className="text-muted-foreground" />
              </button>
            )}
            {currentUser?.role === 'admin' && (
              <button onClick={() => navigate('/admin')} className="w-full flex items-center gap-3 px-4 py-4 text-left">
                <span className="text-lg">⚙️</span>
                <span className="text-white text-sm flex-1">Admin Panel</span>
                <ChevronRight size={15} className="text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-red-400 mt-2"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>

      <div className="pb-8 pt-6 text-center">
        <p className="text-muted-foreground text-xs">Gluttony v1.0</p>
      </div>
    </MobileLayout>
  );
}