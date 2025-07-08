'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const scrollToOrderForm = () => {
    router.push('/order');
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

      {/* Features Section */}
      <section className="py-8 sm:py-16 bg-bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-lg mb-4">Why Choose Duval Asphalt?</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
                             We&apos;re committed to providing the highest quality asphalt products and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-secondary/10 mb-4">
                <svg className="h-8 w-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="heading-md mb-2">Quality Guaranteed</h3>
              <p className="text-text-secondary">
                All our asphalt mixes meet or exceed industry standards and specifications.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-secondary/10 mb-4">
                <svg className="h-8 w-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="heading-md mb-2">Fast Delivery</h3>
              <p className="text-text-secondary">
                Quick turnaround times with convenient pickup from three locations.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-secondary/10 mb-4">
                <svg className="h-8 w-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="heading-md mb-2">Expert Support</h3>
              <p className="text-text-secondary">
                Our experienced team is here to help you choose the right mix for your project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="heading-lg mb-4">Ready to Get Started?</h2>
          <p className="text-text-secondary mb-8 text-lg">
            Place your asphalt order online and get your project moving.
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => router.push('/order')}
              className="btn-primary text-lg px-8 py-4"
            >
              Place an Order
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="btn-outline text-lg px-8 py-4"
            >
              Customer Login
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
