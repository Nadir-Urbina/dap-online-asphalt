'use client';

import React, { useState } from 'react';
import AsphaltOrderForm from '@/components/AsphaltOrderForm';
import PaymentAuthorization from '@/components/PaymentAuthorization';
import { useAuth } from '@/contexts/AuthContext';
import { ASPHALT_MIXES, PICKUP_LOCATIONS } from '@/data/constants';
import { createOrder } from '@/lib/firestore';

interface OrderFormData {
  mixType: string;
  tonnage: number;
  pickupDate: string;
  pickupTime: string;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
  };
  onsiteContact: {
    name: string;
    phone: string;
  };
  pickupLocationId: string;
  destination?: string;
  specialInstructions?: string;
}

export default function Home() {
  const { user } = useAuth();
  const [orderStep, setOrderStep] = useState<'form' | 'auth' | 'payment' | 'success'>('form');
  const [orderData, setOrderData] = useState<OrderFormData | null>(null);
  const [completedOrder, setCompletedOrder] = useState<{ orderId: string; paymentIntentId: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOrderSubmit = async (data: OrderFormData) => {
    console.log('Order submitted:', data);
    setOrderData(data);
    
    // If user is logged in, go directly to payment
    if (user) {
      setOrderStep('payment');
    } else {
      // Show auth options for guest users
      setOrderStep('auth');
    }
  };

  const handleGuestCheckout = () => {
    setOrderStep('payment');
  };

  const handleSignInRequired = () => {
    // Redirect to admin login or show sign-in modal
    window.location.href = '/admin';
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!orderData) return;
    
    setIsProcessing(true);
    try {
      // Create order in Firebase with payment intent ID
      const orderId = await createOrder({
        customerId: user?.uid,
        customerDetails: orderData.customerDetails,
        items: [{
          productId: orderData.mixType,
          quantity: 1,
          tonnage: orderData.tonnage,
          mixType: orderData.mixType
        }],
        pickupLocationId: orderData.pickupLocationId,
        destination: orderData.destination,
        specialInstructions: orderData.specialInstructions,
        paymentIntentId: paymentIntentId,
        authorizedAmount: (ASPHALT_MIXES.find(m => m.id === orderData.mixType)?.pricePerTon || 0) * orderData.tonnage
      });

      // Show success state with order details
      setCompletedOrder({ orderId, paymentIntentId });
      setOrderStep('success');
    } catch (error) {
      console.error('Error creating order:', error);
      // Show error state instead of alert
      setOrderStep('form');
      setOrderData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Return to form instead of showing alert
    setOrderStep(user ? 'form' : 'auth');
    setIsProcessing(false);
  };

  const startNewOrder = () => {
    setOrderStep('form');
    setOrderData(null);
    setCompletedOrder(null);
    setIsProcessing(false);
  };

  const scrollToOrderForm = () => {
    const orderSection = document.getElementById('order-form-section');
    orderSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 lg:py-20 min-h-[50vh] flex items-center">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/hero-image.jpg)',
          }}
        ></div>
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Secondary color accent overlay */}
        <div className="absolute inset-0 bg-secondary/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h1 className="heading-xl mb-4 sm:mb-6 text-white drop-shadow-lg">
            Duval Asphalt Online Asphalt Store
          </h1>
          {/* Secondary color accent line */}
          <div className="w-24 h-1 bg-secondary mx-auto mb-6 sm:mb-8 shadow-lg"></div>
          
          <p className="text-lg sm:text-xl mb-8 sm:mb-12 max-w-3xl mx-auto text-white/90 drop-shadow-md">
            Order high-quality asphalt mixes, tools, and equipment from our three convenient locations. 
            Get started with our easy online ordering system.
          </p>
          
          {/* Call to Action Button */}
          <button 
            onClick={scrollToOrderForm}
            className="btn-secondary text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Start Your Order
          </button>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[
              { number: '4', label: 'Mix Types', color: 'text-secondary' },
              { number: '3', label: 'Plant Locations', color: 'text-secondary' },
              { number: '24/7', label: 'Online Ordering', color: 'text-secondary' },
              { number: '100+', label: 'Tons Daily', color: 'text-secondary' }
            ].map((stat, index) => (
              <div 
                key={index} 
                className="card card-body text-center group hover:scale-105 transition-all duration-300"
              >
                <div className={`text-2xl sm:text-4xl font-bold ${stat.color} mb-2 group-hover:text-secondary-light transition-colors duration-300`}>
                  {stat.number}
                </div>
                <div className="text-text-secondary text-sm sm:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Form Section */}
      <section id="order-form-section" className="py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {orderStep === 'form' && (
            <AsphaltOrderForm onSubmit={handleOrderSubmit} isLoading={isProcessing} />
          )}
          
          {orderStep === 'auth' && orderData && (
            <div className="max-w-2xl mx-auto card">
              <h2 className="heading-lg mb-8">Complete Your Order</h2>
              
              {/* Order Summary */}
              <div className="bg-bg-surface-light p-6 rounded-lg mb-8">
                <h3 className="heading-md mb-5">Order Summary</h3>
                <div className="space-y-4 text-base">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-secondary">Mix Type:</span>
                    <span className="font-medium text-text-primary">
                      {ASPHALT_MIXES.find(m => m.id === orderData.mixType)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-secondary">Tonnage:</span>
                    <span className="font-medium text-text-primary">{orderData.tonnage} tons</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-secondary">Pickup Location:</span>
                    <span className="font-medium text-text-primary">
                      {PICKUP_LOCATIONS.find(l => l.id === orderData.pickupLocationId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-secondary">Pickup Date:</span>
                    <span className="font-medium text-text-primary">{orderData.pickupDate}</span>
                  </div>
                  <div className="border-t border-border-secondary pt-4 mt-5">
                    <div className="flex justify-between items-center py-2">
                      <span className="font-semibold text-lg text-text-primary">Estimated Total:</span>
                      <span className="text-secondary font-bold text-xl">
                        ${((ASPHALT_MIXES.find(m => m.id === orderData.mixType)?.pricePerTon || 0) * orderData.tonnage).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Authentication Options */}
              <div className="space-y-5">
                <h3 className="heading-md mb-6">Choose Checkout Method</h3>
                
                <button
                  onClick={handleGuestCheckout}
                  className="w-full btn-primary text-left p-6 h-auto rounded-lg"
                >
                  <div>
                    <div className="font-semibold mb-2 text-lg">Continue as Guest</div>
                    <div className="text-sm opacity-90 leading-relaxed">
                      Proceed with payment using the information you provided
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={handleSignInRequired}
                  className="w-full btn-secondary text-left p-6 h-auto rounded-lg"
                >
                  <div>
                    <div className="font-semibold mb-2 text-lg">Sign In / Register</div>
                    <div className="text-sm opacity-90 leading-relaxed">
                      Create an account or sign in for faster future orders
                    </div>
                  </div>
                </button>
                
                <div className="pt-4">
                  <button
                    onClick={() => setOrderStep('form')}
                    className="w-full text-text-secondary hover:text-secondary transition-colors py-3 text-base"
                  >
                    ← Back to Order Form
                  </button>
                </div>
              </div>
            </div>
          )}
          
                    {orderStep === 'payment' && orderData && (
            <div className="max-w-2xl mx-auto card">
              <h2 className="heading-lg mb-8">Payment Authorization</h2>
              
              {/* Order Summary */}
              <div className="bg-bg-surface-light p-6 rounded-lg mb-8">
                <h3 className="heading-md mb-5">Final Order Summary</h3>
                <div className="space-y-4 text-base">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-secondary">Customer:</span>
                    <span className="font-medium text-text-primary">
                      {orderData.customerDetails.firstName} {orderData.customerDetails.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-secondary">Mix Type:</span>
                    <span className="font-medium text-text-primary">
                      {ASPHALT_MIXES.find(m => m.id === orderData.mixType)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-secondary">Tonnage:</span>
                    <span className="font-medium text-text-primary">{orderData.tonnage} tons</span>
                  </div>
                  <div className="border-t border-border-secondary pt-4 mt-5">
                    <div className="flex justify-between items-center py-2">
                      <span className="font-semibold text-lg text-text-primary">Total to Authorize:</span>
                      <span className="text-secondary font-bold text-xl">
                        ${((ASPHALT_MIXES.find(m => m.id === orderData.mixType)?.pricePerTon || 0) * orderData.tonnage).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4 text-blue-700">
                    <p className="font-semibold text-base mb-2">Payment Authorization</p>
                    <p className="text-sm leading-relaxed">
                      We&apos;ll authorize your payment method for the estimated amount. 
                      Final charges will be based on actual tonnage delivered.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-5">
                <PaymentAuthorization
                  amount={(ASPHALT_MIXES.find(m => m.id === orderData.mixType)?.pricePerTon || 0) * orderData.tonnage}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  customerEmail={orderData.customerDetails.email}
                />
                
                <div className="pt-2">
                  <button
                    onClick={() => setOrderStep(user ? 'form' : 'auth')}
                    className="w-full text-text-secondary hover:text-secondary transition-colors py-3 text-base"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {orderStep === 'success' && completedOrder && orderData && (
            <div className="max-w-2xl mx-auto card">
              {/* Success Header */}
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="heading-lg text-green-600 mb-2">Order Confirmed!</h2>
                <p className="text-text-secondary">Your payment has been authorized and your order is being processed.</p>
              </div>

              {/* Order Details */}
              <div className="bg-bg-surface-light p-6 rounded-lg mb-8">
                <h3 className="heading-md mb-5">Order Details</h3>
                <div className="space-y-4 text-base">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-secondary">Order ID:</span>
                    <span className="font-mono text-sm font-medium text-text-primary bg-bg-surface px-2 py-1 rounded">
                      {completedOrder.orderId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-secondary">Customer:</span>
                    <span className="font-medium text-text-primary">
                      {orderData.customerDetails.firstName} {orderData.customerDetails.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-secondary">Email:</span>
                    <span className="font-medium text-text-primary">{orderData.customerDetails.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-secondary">Mix Type:</span>
                    <span className="font-medium text-text-primary">
                      {ASPHALT_MIXES.find(m => m.id === orderData.mixType)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-secondary">Tonnage:</span>
                    <span className="font-medium text-text-primary">{orderData.tonnage} tons</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-secondary">Pickup Location:</span>
                    <span className="font-medium text-text-primary">
                      {PICKUP_LOCATIONS.find(l => l.id === orderData.pickupLocationId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-text-secondary">Pickup Date:</span>
                    <span className="font-medium text-text-primary">{orderData.pickupDate}</span>
                  </div>
                  {orderData.specialInstructions && (
                    <div className="py-2">
                      <span className="text-text-secondary block mb-1">Special Instructions:</span>
                      <span className="font-medium text-text-primary">{orderData.specialInstructions}</span>
                    </div>
                  )}
                  <div className="border-t border-border-secondary pt-4 mt-5">
                    <div className="flex justify-between items-center py-2">
                      <span className="font-semibold text-lg text-text-primary">Authorized Amount:</span>
                      <span className="text-secondary font-bold text-xl">
                        ${((ASPHALT_MIXES.find(m => m.id === orderData.mixType)?.pricePerTon || 0) * orderData.tonnage).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-6 mb-8">
                <h4 className="font-semibold text-text-primary mb-3">What happens next?</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-start">
                    <span className="text-secondary mr-2">1.</span>
                    <span>Your order will be processed and prepared at the selected plant location</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-2">2.</span>
                    <span>You&apos;ll be notified when your order is ready for pickup</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-2">3.</span>
                    <span>Final payment will be processed based on actual tonnage delivered</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-secondary mr-2">4.</span>
                    <span>Any difference from the authorized amount will be refunded or charged accordingly</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <button
                  onClick={startNewOrder}
                  className="w-full btn-primary py-4 text-lg"
                >
                  Place Another Order
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-text-muted">
                    Need help? Contact us at{' '}
                    <a href="mailto:orders@duvalasphalt.com" className="text-secondary hover:text-secondary-light">
                      orders@duvalasphalt.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
