'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.push('/admin');
    }
  }, [user, router]);

  const handleLoginSuccess = () => {
    // Redirect to admin after successful login
    router.push('/admin');
  };

  const handleBackToOrder = () => {
    router.push('/order');
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button 
            onClick={handleBackToOrder}
            className="btn-outline mb-4"
          >
            ← Back to Order
          </button>
          <h1 className="heading-xl mb-4">Customer Login</h1>
          <p className="text-text-secondary">
            Sign in to your account to manage orders and view order history.
          </p>
        </div>

        <div className="card card-body">
          <LoginForm onSuccess={handleLoginSuccess} />
          
          <div className="mt-6 text-center">
            <p className="text-text-secondary text-sm">
              Don't have an account? You can place orders as a guest or contact us to create an account.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={handleBackToOrder}
            className="btn-secondary"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
} 