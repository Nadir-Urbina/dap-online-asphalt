'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Order } from '@/types';
import { getOrder } from '@/lib/firestore';
import { ASPHALT_MIXES } from '@/data/constants';
import LoadManagement from '@/components/LoadManagement';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

function OrderManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'loads' | 'traditional'>('loads');

  const orderId = params.id as string;

  // Fetch order data
  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedOrder = await getOrder(orderId);
      if (fetchedOrder) {
        setOrder(ensureOrderCompatibility(fetchedOrder));
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  // Ensure backward compatibility with existing orders
  const ensureOrderCompatibility = (order: Order): Order => {
    return {
      ...order,
      originalTonnage: order.originalTonnage || order.items[0]?.tonnage || 0,
      totalDelivered: order.totalDelivered || 0,
      maxAllowedTonnage: order.maxAllowedTonnage || (order.items[0]?.tonnage || 0) * 1.1,
      loads: order.loads || [],
      isMultiLoad: order.isMultiLoad ?? ((order.items[0]?.tonnage || 0) >= 50),
      paymentStrategy: order.paymentStrategy || 'full_upfront',
      paidLoads: order.paidLoads || []
    };
  };

  // Handle load added (refresh data)
  const handleLoadAdded = async () => {
    await fetchOrder(); // Simple refresh
  };

  // Handle payment completed (redirect to dashboard)
  const handlePaymentCompleted = () => {
    router.push('/admin?tab=completed');
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Order</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/admin')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mixDetails = ASPHALT_MIXES.find(mix => mix.id === order.items[0]?.mixType);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center text-text-secondary hover:text-text-primary mb-4 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-text-primary">Order Management</h1>
              <p className="text-text-secondary mt-1">Order ID: {order.id}</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-bg-surface rounded-lg shadow-sm border border-border-primary p-6 mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Order Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-text-primary mb-2">Customer Information</h3>
              <div className="space-y-1 text-sm text-text-secondary">
                <p><span className="font-medium">Name:</span> {order.customerDetails.firstName} {order.customerDetails.lastName}</p>
                <p><span className="font-medium">Email:</span> {order.customerDetails.email}</p>
                {order.customerDetails.phone && <p><span className="font-medium">Phone:</span> {order.customerDetails.phone}</p>}
                {order.customerDetails.company && <p><span className="font-medium">Company:</span> {order.customerDetails.company}</p>}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-text-primary mb-2">Order Information</h3>
              <div className="space-y-1 text-sm text-text-secondary">
                <p><span className="font-medium">Mix Type:</span> {mixDetails?.name}</p>
                <p><span className="font-medium">Original Tonnage:</span> {order.originalTonnage} tons</p>
                <p><span className="font-medium">Price per Ton:</span> ${mixDetails?.pricePerTon}</p>
                <p><span className="font-medium">Created:</span> {order.createdAt.toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-text-primary mb-2">Payment Information</h3>
              <div className="space-y-1 text-sm text-text-secondary">
                <p><span className="font-medium">Authorized Amount:</span> ${order.authorizedAmount.toFixed(2)}</p>
                {order.finalAmount && <p><span className="font-medium">Final Amount:</span> ${order.finalAmount.toFixed(2)}</p>}
                <p><span className="font-medium">Max Allowed:</span> {order.maxAllowedTonnage} tons</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-bg-surface rounded-lg shadow-sm border border-border-primary">
          <div className="border-b border-border-secondary">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('loads')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'loads'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-primary'
                }`}
              >
                Load Management
              </button>
              <button
                onClick={() => setActiveTab('traditional')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'traditional'
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-primary'
                }`}
              >
                Traditional Processing
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'loads' ? (
              <LoadManagement 
                order={order} 
                onLoadAdded={handleLoadAdded}
                onPaymentCompleted={handlePaymentCompleted}
              />
            ) : (
              <TraditionalProcessing order={order} onComplete={handlePaymentCompleted} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Traditional Processing Component
function TraditionalProcessing({ order, onComplete }: { order: Order; onComplete: () => void }) {
  const [actualTonnage, setActualTonnage] = useState<number>(order.items[0]?.tonnage || 0);
  const [processing, setProcessing] = useState(false);

  const mixDetails = ASPHALT_MIXES.find(mix => mix.id === order.items[0]?.mixType);
  const actualAmount = actualTonnage * (mixDetails?.pricePerTon || 0);

  const handleProcessOrder = async () => {
    setProcessing(true);
    try {
      // Capture payment first
      if (order.paymentIntentId) {
        const response = await fetch('/api/capture-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: order.paymentIntentId,
            actualAmount,
            authorizedAmount: order.authorizedAmount,
            orderId: order.id,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Payment capture failed');
        }
      }

      onComplete();
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Error processing order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Actual Tonnage Input */}
      <div>
        <label className="form-label">Actual Tonnage Delivered</label>
        <input
          type="number"
          step="0.5"
          min="0"
          value={actualTonnage}
          onChange={(e) => setActualTonnage(parseFloat(e.target.value) || 0)}
          className="form-input"
        />
      </div>

      {/* Payment Summary */}
      <div className="bg-bg-surface-light p-4 rounded-lg">
        <h4 className="font-semibold text-text-primary mb-3">Payment Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Authorized Amount (110%):</span>
            <span className="font-medium text-text-primary">${order.authorizedAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Final Charge ({actualTonnage} tons):</span>
            <span className="font-semibold text-secondary text-lg">${actualAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Process Button */}
      <button
        onClick={handleProcessOrder}
        disabled={processing}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing...' : 'Process Order'}
      </button>
    </div>
  );
}

// Helper function for status colors
function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'authorized': return 'bg-blue-100 text-blue-800';
    case 'confirmed': return 'bg-purple-100 text-purple-800';
    case 'in_production': return 'bg-orange-100 text-orange-800';
    case 'ready': return 'bg-green-100 text-green-800';
    case 'partial_delivery': return 'bg-indigo-100 text-indigo-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default function ProtectedOrderManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'plant_operator']}>
      <OrderManagementPage />
    </ProtectedRoute>
  );
} 