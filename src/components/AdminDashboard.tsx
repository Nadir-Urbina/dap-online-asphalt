'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/types';
import { getAllOrders, updateOrderStatus } from '@/lib/firestore';
import { PICKUP_LOCATIONS, ASPHALT_MIXES } from '@/data/constants';

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const fetchedOrders = selectedStatus === 'all' 
        ? await getAllOrders() 
        : await getAllOrders(selectedStatus);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'authorized': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'in_production': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationName = (locationId: string) => {
    return PICKUP_LOCATIONS.find(loc => loc.id === locationId)?.name || 'Unknown Location';
  };

  const getMixName = (mixId: string) => {
    return ASPHALT_MIXES.find(mix => mix.id === mixId)?.name || 'Unknown Mix';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    authorized: orders.filter(o => o.status === 'authorized').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    in_production: orders.filter(o => o.status === 'in_production').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-xl text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { key: 'all', label: 'All Orders', count: orderCounts.all },
              { key: 'pending', label: 'Pending', count: orderCounts.pending },
              { key: 'authorized', label: 'Authorized', count: orderCounts.authorized },
              { key: 'confirmed', label: 'Confirmed', count: orderCounts.confirmed },
              { key: 'in_production', label: 'In Production', count: orderCounts.in_production },
              { key: 'ready', label: 'Ready', count: orderCounts.ready },
              { key: 'completed', label: 'Completed', count: orderCounts.completed },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`${
                  selectedStatus === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.label}</span>
                <span className={`${
                  selectedStatus === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'
                } rounded-full px-2.5 py-0.5 text-xs font-medium`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            {selectedStatus === 'all' ? 'All Orders' : `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Orders`}
          </h3>
          
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found for the selected status.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mix & Tonnage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pickup Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id?.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerDetails.firstName} {order.customerDetails.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{order.customerDetails.email}</div>
                        {order.customerDetails.company && (
                          <div className="text-sm text-gray-500">{order.customerDetails.company}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getMixName(order.items[0]?.mixType || '')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items[0]?.tonnage} tons
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getLocationName(order.items[0]?.productId || '')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${order.authorizedAmount.toFixed(2)}
                        </div>
                        {order.finalAmount && order.finalAmount !== order.authorizedAmount && (
                          <div className="text-sm text-green-600">
                            Final: ${order.finalAmount.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Management Modal */}
      {selectedOrder && (
        <OrderManagementModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={() => {
            loadOrders();
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

const OrderManagementModal = ({ 
  order, 
  onClose, 
  onUpdate 
}: { 
  order: Order; 
  onClose: () => void; 
  onUpdate: () => void; 
}) => {
  const [actualTonnage, setActualTonnage] = useState<number>(order.items[0]?.tonnage || 0);
  const [processing, setProcessing] = useState(false);

  const originalTonnage = order.items[0]?.tonnage || 0;
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

        // Show success message with capture details
        alert(result.message);
      }

      // Update order status and actual tonnage
      await updateOrderStatus(order.id!, 'completed', {
        finalAmount: Math.min(actualAmount, order.authorizedAmount),
        actualTonnage,
      });

      onUpdate();
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Error processing order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Manage Order: {order.id?.slice(0, 8)}...</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Order Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Order Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Customer:</span> {order.customerDetails.firstName} {order.customerDetails.lastName}
              </div>
              <div>
                <span className="font-medium">Email:</span> {order.customerDetails.email}
              </div>
              <div>
                <span className="font-medium">Mix:</span> {mixDetails?.name}
              </div>
              <div>
                <span className="font-medium">Original Tonnage:</span> {originalTonnage} tons
              </div>
              <div>
                <span className="font-medium">Authorized Amount:</span> ${order.authorizedAmount.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Price per Ton:</span> ${mixDetails?.pricePerTon}/ton
              </div>
            </div>
          </div>

          {/* Actual Tonnage Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actual Tonnage Delivered
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={actualTonnage}
              onChange={(e) => setActualTonnage(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Payment Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Payment Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Authorized Amount (110%):</span>
                <span>${order.authorizedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Order:</span>
                <span>${(order.authorizedAmount / 1.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Final Charge ({actualTonnage} tons):</span>
                <span className="text-green-600">${actualAmount.toFixed(2)}</span>
              </div>
              {actualAmount <= order.authorizedAmount ? (
                <div className="text-sm text-green-600 mt-2">
                  ✅ Amount is within authorized limit - will capture ${actualAmount.toFixed(2)}
                </div>
              ) : (
                <div className="text-sm text-red-600 mt-2">
                  ⚠️ Amount exceeds authorization by ${(actualAmount - order.authorizedAmount).toFixed(2)} - will capture maximum authorized amount
                </div>
              )}
            </div>
          </div>

          {/* Process Order Info */}
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-800">
              <span className="font-medium">Ready to Process:</span> This will capture the payment for the actual tonnage delivered and mark the order as completed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessOrder}
              disabled={processing}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Process Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 