'use client';

import React, { useState } from 'react';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';

interface PaymentAuthorizationProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  customerEmail: string;
}

const PaymentForm = ({ amount, onSuccess, onError, customerEmail }: PaymentAuthorizationProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setCardError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setIsLoading(false);
      return;
    }

    try {
      // Create payment intent on the server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          capture_method: 'manual', // This enables authorization without immediate capture
          customer_email: customerEmail,
        }),
      });

      const { client_secret } = await response.json();

      // Confirm the payment intent
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: customerEmail,
          },
        },
      });

      if (error) {
        setCardError(error.message || 'An error occurred');
        onError(error.message || 'Payment authorization failed');
      } else if (paymentIntent && paymentIntent.status === 'requires_capture') {
        // Payment is authorized but not captured
        onSuccess(paymentIntent.id);
      } else {
        setCardError('Payment authorization failed');
        onError('Payment authorization failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setCardError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6">
      <div className="card p-6">
        <h3 className="heading-md mb-4">Payment Authorization</h3>
        
        <div className="mb-6">
          <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-5 w-5 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-semibold text-text-primary mb-2">Authorization Only</h4>
                <div className="text-sm text-text-secondary leading-relaxed">
                  <p>Your card will be authorized for <strong className="text-secondary">${amount.toFixed(2)}</strong> but not charged. 
                  The final charge will be processed after order confirmation based on actual tonnage delivered.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">
              Card Details
            </label>
            <div className="form-input p-4">
              <CardElement options={cardElementOptions} />
            </div>
            {cardError && (
              <p className="mt-2 text-sm text-red-600">{cardError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!stripe || isLoading}
            className="w-full btn-primary py-4 text-lg"
          >
            {isLoading ? 'Authorizing...' : `Authorize $${amount.toFixed(2)}`}
          </button>
        </form>

        <div className="mt-6 text-xs text-text-muted space-y-1">
          <p>🔒 Your payment information is secure and encrypted.</p>
          <p>You will not be charged until your order is confirmed and ready for pickup.</p>
        </div>
      </div>
    </div>
  );
};

export default function PaymentAuthorization(props: PaymentAuthorizationProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
} 