'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Video,
  MessageSquare,
  BarChart3,
  UserCheck,
  Menu,
  X,
  HeartPulse
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Video Analytics', href: '/videos', icon: Video },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Advanced Analytics', href: '/analytics', icon: BarChart3 },
];

// Removed secondary navigation items as requested

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Start with sidebar open on desktop
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 769;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // Close sidebar on mobile by default
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside or pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen && isMobile) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll on mobile only
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen, isMobile]);

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  return (
    <div className={`dashboard-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Header Section */}
        <div className="nav-header">
          <div className="nav-header-content">
            <div className="nav-logo">
              <div className="nav-logo-icon">
                <HeartPulse size={28} className="text-pink-400" />
              </div>
              <div className="nav-logo-text">
                <h1 className="nav-title">Doctor Portal</h1>
                <p className="nav-subtitle">Child Development Tracker</p>
              </div>
            </div>
            
            <button 
              className="nav-mobile-close" 
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
              style={{ display: isMobile ? 'flex' : 'none' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="nav-menu">
          <ul className="nav-list">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.name} className="nav-item">
                  <Link 
                    href={item.href} 
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="nav-link-icon">
                      <Icon size={20} />
                    </div>
                    <span className="nav-link-text">{item.name}</span>
                    {isActive && (
                      <div className="nav-link-indicator">
                        <div className="nav-indicator-dot"></div>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="nav-profile">
          <div className="nav-profile-card">
            <div className="nav-profile-avatar">
              <div className="nav-avatar-icon">
                <UserCheck size={24} />
              </div>
              <div className="nav-status-indicator">
                <div className="nav-status-dot"></div>
              </div>
            </div>
            
            <div className="nav-profile-info">
              <div className="nav-profile-header">
                <h3 className="nav-profile-name">Dr. Vadivelan K</h3>
                <span className="nav-profile-role">DOCTOR</span>
              </div>
              <div className="nav-profile-status">
                <div className="nav-online-badge">
                  <div className="nav-online-dot"></div>
                  <span>Online</span>
                </div>
                <span className="nav-availability">Available</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Mobile Menu Button */}
        {isMobile && (
          <div className="mobile-header">
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <div className="mobile-title">
              <HeartPulse size={20} className="text-primary" />
              <span>Doctor Portal</span>
            </div>
          </div>
        )}

        {/* Desktop Menu Toggle Button */}
        {!isMobile && (
          <div className="desktop-header">
            <button 
              className="desktop-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        )}

        {children}
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
