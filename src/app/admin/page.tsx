'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import UserManagement from '@/components/UserManagement';
import AdminDashboard from '@/components/AdminDashboard';
import ProductManagement from '@/components/ProductManagement';
import AsphaltMixManagement from '@/components/AsphaltMixManagement';

type TabType = 'orders' | 'users' | 'products' | 'mixes';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const { canManageUsers } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Order Management
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Product Management
              </button>

              <button
                onClick={() => setActiveTab('mixes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'mixes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Asphalt Mix Management
              </button>
              
              {canManageUsers && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'users'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  User Management
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {activeTab === 'orders' && <AdminDashboard />}
            {activeTab === 'products' && <ProductManagement />}
            {activeTab === 'mixes' && <AsphaltMixManagement />}
            {activeTab === 'users' && canManageUsers && (
              <ProtectedRoute requireUserManagement={true}>
                <UserManagement />
              </ProtectedRoute>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 