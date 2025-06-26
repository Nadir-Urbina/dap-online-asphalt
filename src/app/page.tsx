'use client';

import React, { useState } from 'react';
import AsphaltOrderForm from '@/components/AsphaltOrderForm';
import CustomerAuth from '@/components/CustomerAuth';
import PaymentAuthorization from '@/components/PaymentAuthorization';
import ProgressIndicator from '@/components/ProgressIndicator';
import { ASPHALT_MIXES, PICKUP_LOCATIONS } from '@/data/constants';
import { useAuth } from '@/contexts/AuthContext';

type OrderStep = 'order_form' | 'customer_auth' | 'payment_authorization' | 'confirmation';

interface OrderData {
  mixType: string;
  tonnage: number;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
  };
  pickupLocationId: string;
  destination?: string;
  specialInstructions?: string;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<OrderStep>('order_form');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [estimatedTotal, setEstimatedTotal] = useState<number>(0);
  const { user } = useAuth();

  const handleOrderSubmit = (data: OrderData) => {
    // Calculate estimated total
    const selectedMix = ASPHALT_MIXES.find(mix => mix.id === data.mixType);
    const total = selectedMix ? selectedMix.pricePerTon * data.tonnage : 0;
    
    setOrderData(data);
    setEstimatedTotal(total);
    
    // If user is already logged in as a customer, skip auth step
    if (user && user.role === 'customer') {
      setCurrentStep('payment_authorization');
    } else {
      setCurrentStep('customer_auth');
    }
  };

  const handleContinueAsGuest = () => {
    setCurrentStep('payment_authorization');
  };

  const handleAuthSuccess = () => {
    setCurrentStep('payment_authorization');
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    setPaymentIntentId(paymentId);
    
    // Save order to Firestore
    if (orderData) {
      try {
        const { createOrder } = await import('@/lib/firestore');
        
        const orderId = await createOrder({
          customerId: user?.uid || null, // Include customer ID if logged in, null for guests
          customerDetails: orderData.customerDetails,
          items: [{
            productId: orderData.mixType,
            quantity: 1,
            tonnage: orderData.tonnage,
            mixType: orderData.mixType,
          }],
          pickupLocationId: orderData.pickupLocationId,
          destination: orderData.destination,
          specialInstructions: orderData.specialInstructions,
          paymentIntentId: paymentId,
          authorizedAmount: estimatedTotal * 1.1, // 110% authorization
        });
        
        console.log('Order saved to Firestore:', orderId);
        setCurrentStep('confirmation');
      } catch (error) {
        console.error('Error saving order:', error);
        // Still proceed to confirmation even if Firestore save fails
        setCurrentStep('confirmation');
      }
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Handle payment error (show error message, etc.)
  };

  const getSelectedMixDetails = () => {
    if (!orderData) return null;
    return ASPHALT_MIXES.find(mix => mix.id === orderData.mixType);
  };

  const getSelectedLocationDetails = () => {
    if (!orderData) return null;
    return PICKUP_LOCATIONS.find(location => location.id === orderData.pickupLocationId);
  };

  if (currentStep === 'order_form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-surface to-bg-surface-light">
        <div className="py-4 sm:py-6 lg:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <div className="relative">
                {/* Background accent */}
                <div className="absolute inset-0 bg-secondary opacity-10 blur-3xl rounded-full transform -rotate-6"></div>
                
                <div className="relative z-10">
                  <h1 className="heading-xl text-text-primary mb-4 sm:mb-6">
                    Professional Asphalt Solutions
                  </h1>
                  <div className="w-24 h-1 bg-secondary mx-auto mb-4 sm:mb-6 rounded-full"></div>
                  <p className="text-body text-base sm:text-lg lg:text-xl max-w-3xl mx-auto px-2">
                    Order high-quality asphalt mixes, tools, and equipment from our three convenient locations. 
                    Get started with our easy online ordering system.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-10 lg:mb-12">
              <div className="card group hover:scale-105 transition-all duration-300">
                <div className="card-body text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-secondary mb-2 group-hover:text-secondary-light transition-colors">4</div>
                  <div className="text-sm sm:text-base text-text-secondary">Mix Types</div>
                </div>
              </div>
              <div className="card group hover:scale-105 transition-all duration-300">
                <div className="card-body text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-secondary mb-2 group-hover:text-secondary-light transition-colors">3</div>
                  <div className="text-sm sm:text-base text-text-secondary">Plant Locations</div>
                </div>
              </div>
              <div className="card group hover:scale-105 transition-all duration-300">
                <div className="card-body text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-secondary mb-2 group-hover:text-secondary-light transition-colors">24/7</div>
                  <div className="text-sm sm:text-base text-text-secondary">Online Ordering</div>
                </div>
              </div>
              <div className="card group hover:scale-105 transition-all duration-300">
                <div className="card-body text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-secondary mb-2 group-hover:text-secondary-light transition-colors">100+</div>
                  <div className="text-sm sm:text-base text-text-secondary">Tons Daily</div>
                </div>
              </div>
            </div>

            {/* Order Form */}
            <AsphaltOrderForm onSubmit={handleOrderSubmit} />
          </div>
        </div>
      </div>
    );
  }

  // Continue with other steps for now with basic structure
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-surface to-bg-surface-light">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-lg text-text-primary">DAP Online Plant</h1>
            <p className="text-body">Page under development</p>
          </div>
        </div>
      </div>
    </div>
  );
}
