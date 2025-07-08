'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PaymentAuthorization from '@/components/PaymentAuthorization';
import { useAuth } from '@/contexts/AuthContext';
import { ASPHALT_MIXES, PICKUP_LOCATIONS } from '@/data/constants';
import { createOrder } from '@/lib/firestore';

interface OrderData {
  mixType: string;
  tonnage: number;
  pickupDate: string;
  pickupTime: string;
  pickupLocationId: string;
  firstName: string;
  lastName: string;
  email: string;
  onsiteContactName: string;
  onsiteContactPhone: string;
  estimatedTotal: number;
  phone?: string;
  company?: string;
  destination?: string;
  specialInstructions?: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Parse order data from URL params
    const mixType = searchParams.get('mixType');
    const tonnage = searchParams.get('tonnage');
    const pickupDate = searchParams.get('pickupDate');
    const pickupTime = searchParams.get('pickupTime');
    const pickupLocationId = searchParams.get('pickupLocationId');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const email = searchParams.get('email');
    const onsiteContactName = searchParams.get('onsiteContactName');
    const onsiteContactPhone = searchParams.get('onsiteContactPhone');
    const estimatedTotal = searchParams.get('estimatedTotal');

    // Validate required params
    if (!mixType || !tonnage || !pickupDate || !pickupTime || !pickupLocationId || 
        !firstName || !lastName || !email || !onsiteContactName || !onsiteContactPhone || !estimatedTotal) {
      // Redirect back to order form if missing required data
      router.push('/order');
      return;
    }

    setOrderData({
      mixType,
      tonnage: parseFloat(tonnage),
      pickupDate,
      pickupTime,
      pickupLocationId,
      firstName,
      lastName,
      email,
      onsiteContactName,
      onsiteContactPhone,
      estimatedTotal: parseFloat(estimatedTotal),
      phone: searchParams.get('phone') || undefined,
      company: searchParams.get('company') || undefined,
      destination: searchParams.get('destination') || undefined,
      specialInstructions: searchParams.get('specialInstructions') || undefined,
    });
  }, [searchParams, router]);

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!orderData) return;
    
    setIsProcessing(true);
    try {
      // Create order in Firebase with payment intent ID
      // Filter out undefined values to prevent Firestore errors
      const orderPayload: any = {
        customerId: user?.uid,
        customerDetails: {
          firstName: orderData.firstName,
          lastName: orderData.lastName,
          email: orderData.email,
          ...(orderData.phone && { phone: orderData.phone }),
          ...(orderData.company && { company: orderData.company }),
        },
        items: [{
          productId: orderData.mixType,
          quantity: 1,
          tonnage: orderData.tonnage,
          mixType: orderData.mixType
        }],
        pickupLocationId: orderData.pickupLocationId,
        paymentIntentId: paymentIntentId,
        authorizedAmount: orderData.estimatedTotal * 1.1 // 110% authorization
      };

      // Only include optional fields if they have values
      if (orderData.destination) {
        orderPayload.destination = orderData.destination;
      }
      if (orderData.specialInstructions) {
        orderPayload.specialInstructions = orderData.specialInstructions;
      }

      const orderId = await createOrder(orderPayload);

      // Navigate to success page with order details
      router.push(`/order-complete?orderId=${orderId}&paymentIntentId=${paymentIntentId}`);
    } catch (error) {
      console.error('Error creating order:', error);
      // Stay on checkout page and show error
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setIsProcessing(false);
    // Could show error message here instead of redirecting
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading your order...</p>
        </div>
      </div>
    );
  }

  const mix = ASPHALT_MIXES.find(m => m.id === orderData.mixType);
  const location = PICKUP_LOCATIONS.find(l => l.id === orderData.pickupLocationId);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button 
            onClick={() => router.back()}
            className="btn-outline mb-4"
          >
            ← Back to Order Form
          </button>
          <h1 className="heading-xl mb-4">Review & Authorize Payment</h1>
          <p className="text-text-secondary">
            Review your order details and authorize payment. You'll only be charged for the actual amount delivered.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Authorization */}
          <div className="card card-body">
            <h2 className="heading-lg mb-6">Payment Authorization</h2>
            
            <PaymentAuthorization
              amount={orderData.estimatedTotal * 1.1} // 110% authorization
              customerEmail={orderData.email}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              isProcessing={isProcessing}
            />
          </div>

          {/* Order Summary */}
          <div className="card card-body">
            <h2 className="heading-lg mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-text-secondary">Mix Type:</span>
                <span className="font-medium">{mix?.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Tonnage:</span>
                <span className="font-medium">{orderData.tonnage} tons</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Price per Ton:</span>
                <span className="font-medium">${mix?.pricePerTon.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Pickup Date:</span>
                <span className="font-medium">{new Date(orderData.pickupDate).toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Pickup Time:</span>
                <span className="font-medium">
                  {parseInt(orderData.pickupTime) > 12 
                    ? `${parseInt(orderData.pickupTime) - 12}:00 PM` 
                    : `${orderData.pickupTime}:00 AM`}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-text-secondary">Location:</span>
                <span className="font-medium">{location?.name}</span>
              </div>
              
              {orderData.destination && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Destination:</span>
                  <span className="font-medium">{orderData.destination}</span>
                </div>
              )}
              
              <hr className="my-4" />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Estimated Total:</span>
                <span className="text-green-600">${orderData.estimatedTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm text-text-secondary">
                <span>Authorization Amount (110%):</span>
                <span>${(orderData.estimatedTotal * 1.1).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-secondary/10 border border-secondary/30 rounded-md">
              <p className="text-sm text-text-primary">
                <span className="font-medium">Important:</span> You'll only be charged for the actual tonnage delivered. 
                We authorize 110% to account for potential silo variance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
} 