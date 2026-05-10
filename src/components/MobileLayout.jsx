import React from 'react';
import BottomNav from './BottomNav';

export default function MobileLayout({ children, hideNav = false }) {
  return (
    <div className="min-h-screen bg-background" style={{ maxWidth: 430, margin: '0 auto', position: 'relative' }}>
      <div className={hideNav ? '' : 'pb-20'}>
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}