import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './BottomNav.scss';

const navItems = [
  { path: '/dashboard', icon: 'home', label: 'Home' },
  { path: '/learn', icon: 'school', label: 'Learn' },
  { path: '/jobs', icon: 'work', label: 'Jobs' },
  { path: '/community', icon: 'groups', label: 'Social' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
];

export default function BottomNav() {
  const location = useLocation();
  
  // Don't show on landing page, auth pages, learning session, or gamified learning
  if (location.pathname === '/' || 
      location.pathname === '/login' ||
      location.pathname === '/register' ||
      location.pathname.includes('/learn/session') || 
      location.pathname.includes('/course/') ||
      location.pathname.includes('/learn/gamified')) {
    return null;
  }

  return (
    <nav className="bottom-nav">
      <div className="nav-glass">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="label">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
