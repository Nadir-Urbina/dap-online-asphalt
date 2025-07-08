'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getOrder } from '@/lib/firestore';
import { Order } from '@/types';

function OrderCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const paymentIntentId = searchParams.get('paymentIntentId');

    if (!orderId || !paymentIntentId) {
      // Redirect to home if missing required params
      router.push('/');
      return;
    }

    // Fetch order details
    const fetchOrder = async () => {
      try {
        const orderData = await getOrder(orderId);
        if (orderData) {
          setOrder(orderData);
        } else {
          // Order not found, redirect to home
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [searchParams, router]);

  const startNewOrder = () => {
    router.push('/order');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="heading-lg mb-4">Order Not Found</h1>
          <p className="text-text-secondary mb-6">We couldn't find your order details.</p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="heading-xl mb-4 text-green-600">Order Placed Successfully!</h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Your asphalt order has been submitted and payment has been authorized. 
            You&apos;ll receive an email confirmation shortly.
          </p>
        </div>

        {/* Truck Driver Notice - Compact */}
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-base font-bold text-orange-900 mb-2">
                🚛 Important for Truck Drivers
              </h3>
              <p className="text-orange-800 text-sm mb-2">
                <strong>Truck drivers must present this Order ID at plant check-in:</strong>
              </p>
              <div className="bg-orange-100 border border-orange-300 rounded p-3 mb-2">
                <div className="text-center">
                  <span className="text-xs text-orange-700 block mb-1">Order ID:</span>
                  <span className="font-mono text-lg font-bold text-orange-900 bg-white px-3 py-1 rounded border inline-block">
                    {order.id}
                  </span>
                </div>
              </div>
              <p className="text-orange-700 text-xs">
                Present this ID to the scale house or plant operator for order verification.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="card card-body">
            <h2 className="heading-lg mb-6">Order Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-text-secondary">Order ID:</span>
                <span className="font-mono text-sm">{order.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Status:</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Mix Type:</span>
                <span className="font-medium">{order.items[0]?.mixType}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Tonnage Ordered:</span>
                <span className="font-medium">{order.originalTonnage} tons</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Pickup Location:</span>
                <span className="font-medium">{order.pickupLocation.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Pickup Address:</span>
                <span className="font-medium text-right">{order.pickupLocation.address}</span>
              </div>
              
              {order.destination && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Destination:</span>
                  <span className="font-medium">{order.destination}</span>
                </div>
              )}
              
              <hr className="my-4" />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Authorized Amount:</span>
                <span className="text-green-600">${order.authorizedAmount.toFixed(2)}</span>
              </div>
            </div>
            
            {order.specialInstructions && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Special Instructions:</h3>
                <p className="text-text-secondary">{order.specialInstructions}</p>
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="card card-body">
            <h2 className="heading-lg mb-6">Customer Information</h2>
            
            <div className="space-y-4">
              <div>
                <span className="text-text-secondary">Name:</span>
                <p className="font-medium">
                  {order.customerDetails.firstName} {order.customerDetails.lastName}
                </p>
              </div>
              
              <div>
                <span className="text-text-secondary">Email:</span>
                <p className="font-medium">{order.customerDetails.email}</p>
              </div>
              
              {order.customerDetails.phone && (
                <div>
                  <span className="text-text-secondary">Phone:</span>
                  <p className="font-medium">{order.customerDetails.phone}</p>
                </div>
              )}
              
              {order.customerDetails.company && (
                <div>
                  <span className="text-text-secondary">Company:</span>
                  <p className="font-medium">{order.customerDetails.company}</p>
                </div>
              )}
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Next Steps</h4>
                  <div className="text-sm text-blue-700 mt-1">
                    <ul className="list-disc list-inside space-y-1">
                      <li>You'll receive an email confirmation shortly</li>
                      <li>Our plant team will prepare your order</li>
                      <li>You'll be notified when your order is ready for pickup</li>
                      <li>Final payment will be charged based on actual tonnage delivered</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center space-x-4">
          <button onClick={startNewOrder} className="btn-primary">
            Place Another Order
          </button>
          <button onClick={() => router.push('/')} className="btn-outline">
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading order confirmation...</p>
        </div>
      </div>
    }>
      <OrderCompleteContent />
    </Suspense>
  );
} 