'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function NavBar() {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false); // Close menu after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-bg-surface shadow-lg border-b border-border-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - responsive sizing */}
          <div className="flex items-center min-w-0 flex-1">
            <h1 className="nav-brand text-lg sm:text-xl lg:text-2xl truncate">
              DAP Online Plant
            </h1>
            <span className="hidden sm:inline ml-2 text-xs sm:text-sm text-text-muted">
              Asphalt & Equipment Store
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <Link href="/" className="nav-link text-sm lg:text-base">Orders</Link>
            <a href="#" className="nav-link text-sm lg:text-base">Products</a>
            
            {user ? (
              <div className="flex items-center space-x-2 lg:space-x-4">
                {(user.role === 'admin' || user.role === 'plant_operator') && (
                  <a href="/admin" className="nav-link text-sm lg:text-base">Admin</a>
                )}
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs lg:text-sm text-text-secondary hidden lg:inline">
                    Welcome, {user.firstName}
                  </span>
                  <span className="text-xs lg:text-sm text-text-secondary lg:hidden">
                    {user.firstName}
                  </span>
                  {user.role === 'customer' && (
                    <span className="badge badge-success">
                      Customer
                    </span>
                  )}
                  {(user.role === 'admin' || user.role === 'plant_operator') && (
                    <span className={`badge ${
                      user.role === 'admin' 
                        ? 'badge-warning' 
                        : 'badge-info'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Plant Operator'}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="nav-link text-sm hover:text-secondary-light"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a href="/admin" className="nav-link text-sm lg:text-base">Staff Login</a>
                <span className="nav-link text-sm lg:text-base cursor-pointer">Account</span>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-text-muted hover:text-secondary hover:bg-bg-surface-light focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-bg-surface border-t border-border-primary">
            <Link
              href="/"
              className="block px-3 py-2 text-base font-medium text-text-secondary hover:text-secondary hover:bg-bg-surface-light rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Orders
            </Link>
            <a
              href="#"
              className="block px-3 py-2 text-base font-medium text-text-secondary hover:text-secondary hover:bg-bg-surface-light rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </a>
            
            {user ? (
              <>
                {(user.role === 'admin' || user.role === 'plant_operator') && (
                  <a
                    href="/admin"
                    className="block px-3 py-2 text-base font-medium text-text-secondary hover:text-secondary hover:bg-bg-surface-light rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </a>
                )}
                
                <div className="px-3 py-2 border-t border-border-secondary">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-text-primary">
                      Welcome, {user.firstName} {user.lastName}
                    </span>
                    {user.role === 'customer' && (
                      <span className="badge badge-success">
                        Customer
                      </span>
                    )}
                    {(user.role === 'admin' || user.role === 'plant_operator') && (
                      <span className={`badge ${
                        user.role === 'admin' 
                          ? 'badge-warning' 
                          : 'badge-info'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Plant Operator'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-0 py-1 text-sm text-secondary hover:text-secondary-light"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <a
                  href="/admin"
                  className="block px-3 py-2 text-base font-medium text-text-secondary hover:text-secondary hover:bg-bg-surface-light rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Staff Login
                </a>
                <a
                  href="#"
                  className="block px-3 py-2 text-base font-medium text-text-secondary hover:text-secondary hover:bg-bg-surface-light rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Account
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 