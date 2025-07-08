'use client';

import React from 'react';
import AsphaltOrderForm from '@/components/AsphaltOrderForm';
import { useRouter } from 'next/navigation';
import { ASPHALT_MIXES } from '@/data/constants';

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

export default function OrderPage() {
  const router = useRouter();

  const handleOrderSubmit = (data: OrderFormData) => {
    console.log('Order submitted:', data);
    
    // Calculate estimated total for URL params
    const mix = ASPHALT_MIXES.find(m => m.id === data.mixType);
    const estimatedTotal = mix ? mix.pricePerTon * data.tonnage : 0;
    
    // Create URL search params with order data
    const params = new URLSearchParams({
      mixType: data.mixType,
      tonnage: data.tonnage.toString(),
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime,
      pickupLocationId: data.pickupLocationId,
      firstName: data.customerDetails.firstName,
      lastName: data.customerDetails.lastName,
      email: data.customerDetails.email,
      onsiteContactName: data.onsiteContact.name,
      onsiteContactPhone: data.onsiteContact.phone,
      estimatedTotal: estimatedTotal.toString(),
      ...(data.customerDetails.phone && { phone: data.customerDetails.phone }),
      ...(data.customerDetails.company && { company: data.customerDetails.company }),
      ...(data.destination && { destination: data.destination }),
      ...(data.specialInstructions && { specialInstructions: data.specialInstructions }),
    });

    // Navigate to checkout with order data
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="heading-xl mb-4">Place Your Asphalt Order</h1>
          <p className="text-text-secondary">
            Fill out the form below to place your asphalt mix order. You'll review and authorize payment on the next step.
          </p>
        </div>
        
        <AsphaltOrderForm onSubmit={handleOrderSubmit} />
      </div>
    </div>
  );
} 