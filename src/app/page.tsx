'use client';

import React from 'react';
import AsphaltOrderForm from '@/components/AsphaltOrderForm';

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

  const handleOrderSubmit = async (data: OrderFormData) => {
    console.log('Order submitted:', data);
    // TODO: Implement order processing logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-primary via-bg-surface to-bg-surface-light">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 lg:py-32">
        {/* Background accent */}
        <div className="absolute inset-0 bg-secondary/5 blur-3xl rounded-full transform -translate-y-1/2 scale-150"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="heading-xl mb-4 sm:mb-6">
            Professional Asphalt Solutions
          </h1>
          {/* Secondary color accent line */}
          <div className="w-24 h-1 bg-secondary mx-auto mb-6 sm:mb-8"></div>
          
          <p className="text-body text-lg sm:text-xl mb-8 sm:mb-12 max-w-3xl mx-auto">
            Order high-quality asphalt mixes, tools, and equipment from our three convenient locations. 
            Get started with our easy online ordering system.
          </p>
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
      <section className="py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AsphaltOrderForm onSubmit={handleOrderSubmit} />
        </div>
      </section>
    </div>
  );
}
