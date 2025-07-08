'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ASPHALT_MIXES, PICKUP_LOCATIONS } from '@/data/constants';
import { AsphaltMix } from '@/types';

const orderSchema = z.object({
  mixType: z.string().min(1, 'Please select an asphalt mix'),
  tonnage: z.number().min(0.5, 'Tonnage must be at least 0.5 tons'),
  pickupDate: z.string().min(1, 'Please select a pickup date').refine((date) => {
    const selectedDate = new Date(date + 'T00:00:00');
    const today = new Date();
    
    // Compare using ISO date strings for consistency
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    const todayString = today.toISOString().split('T')[0];
    
    console.log('Date validation debug:', {
      inputDate: date,
      selectedDateString,
      todayString,
      isValid: selectedDateString >= todayString
    });
    
    return selectedDateString >= todayString;
  }, 'Pickup date cannot be in the past'),
  pickupTime: z.string().min(1, 'Please select a pickup time'),
  customerDetails: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
    company: z.string().optional(),
  }),
  onsiteContact: z.object({
    name: z.string().min(1, 'Onsite contact name is required'),
    phone: z.string().min(1, 'Onsite contact phone is required'),
  }),
  pickupLocationId: z.string().min(1, 'Please select a pickup location'),
  destination: z.string().optional(),
  specialInstructions: z.string().optional(),
}).refine((data) => {
  // If pickup date is today, ensure pickup time is in the future
  if (!data.pickupDate || !data.pickupTime) return true;
  
  const selectedDate = new Date(data.pickupDate + 'T00:00:00');
  const today = new Date();
  
  // Check if the selected date is today using ISO date strings
  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const todayString = today.toISOString().split('T')[0];
  
  if (selectedDateString === todayString) {
    const currentHour = today.getHours();
    const currentMinutes = today.getMinutes();
    const selectedHour = parseInt(data.pickupTime);
    
    console.log('Debug validation:', {
      currentTime: `${currentHour}:${currentMinutes}`,
      selectedHour,
      currentHour,
      requiredMinHour: currentHour + 2,
      isValid: selectedHour >= currentHour + 2
    });
    
    // Must be at least 2 hours from now to allow for processing time
    return selectedHour >= currentHour + 2;
  }
  
  return true;
}, {
  message: "For same-day pickup, time must be at least 2 hours from now",
  path: ["pickupTime"]
});

type OrderFormData = z.infer<typeof orderSchema>;

interface AsphaltOrderFormProps {
  onSubmit: (data: OrderFormData) => void;
  isLoading?: boolean;
}

export default function AsphaltOrderForm({ onSubmit, isLoading = false }: AsphaltOrderFormProps) {
  const [selectedMix, setSelectedMix] = useState<AsphaltMix | null>(null);
  const [estimatedTotal, setEstimatedTotal] = useState<number>(0);
  const [showOvertimeWarning, setShowOvertimeWarning] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  });

  const mixType = watch('mixType');
  const tonnage = watch('tonnage');
  const pickupDate = watch('pickupDate');
  const pickupTime = watch('pickupTime');

  // Update selected mix and calculate estimated total
  React.useEffect(() => {
    if (mixType) {
      const mix = ASPHALT_MIXES.find(m => m.id === mixType);
      setSelectedMix(mix || null);
      
      if (mix && tonnage) {
        setEstimatedTotal(mix.pricePerTon * tonnage);
      } else {
        setEstimatedTotal(0);
      }
    }
  }, [mixType, tonnage]);

  // Clear pickup time if it becomes invalid when date changes
  React.useEffect(() => {
    if (pickupDate && pickupTime) {
      const selectedDate = new Date(pickupDate + 'T00:00:00'); // Ensure consistent parsing
      const today = new Date();
      
      // Check if selected date is today
      const selectedDateString = selectedDate.toISOString().split('T')[0];
      const todayString = today.toISOString().split('T')[0];
      const isToday = selectedDateString === todayString;
      
      if (isToday) {
        const currentHour = today.getHours();
        const selectedHour = parseInt(pickupTime);
        
        // If it's today and selected time is no longer valid, clear it
        if (selectedHour < currentHour + 2) {
          setValue('pickupTime', '');
        }
      }
    }
  }, [pickupDate, pickupTime, setValue]);

  // Check for overtime charges
  React.useEffect(() => {
    if (pickupDate && pickupTime) {
      const selectedDate = new Date(pickupDate);
      const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday
      const timeValue = parseInt(pickupTime);
      
      // Show warning for weekends (Saturday = 6, Sunday = 0) or after 4 PM (16:00)
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isAfterHours = timeValue >= 16;
      
      setShowOvertimeWarning(isWeekend || isAfterHours);
    } else {
      setShowOvertimeWarning(false);
    }
  }, [pickupDate, pickupTime]);

  const handleFormSubmit = (data: OrderFormData) => {
    onSubmit(data);
  };

  // Generate time options (7 AM to 6 PM) with validation for today
  const generateTimeOptions = () => {
    const options = [];
    
    if (!pickupDate) {
      // If no date selected, show all times
      for (let hour = 7; hour <= 18; hour++) {
        const time12 = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayTime = `${time12}:00 ${ampm}`;
        options.push({ value: hour, label: displayTime });
      }
      return options;
    }
    
    const selectedDate = new Date(pickupDate + 'T00:00:00'); // Ensure consistent parsing
    const today = new Date();
    
    // Check if selected date is today using ISO date strings
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    const todayString = today.toISOString().split('T')[0];
    const isToday = selectedDateString === todayString;
    
    const currentHour = today.getHours();
    
    for (let hour = 7; hour <= 18; hour++) {
      // If it's today, only show times that are at least 2 hours from now
      if (isToday && hour < currentHour + 2) {
        continue;
      }
      
      const time12 = hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayTime = `${time12}:00 ${ampm}`;
      options.push({ value: hour, label: displayTime });
    }
    
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 card">
      <h2 className="heading-lg mb-4 sm:mb-6">Place Asphalt Order</h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 sm:space-y-8">
        {/* Asphalt Mix Selection - Dropdown */}
        <div>
          <label className="form-label">
            Select Asphalt Mix *
          </label>
          <select
            {...register('mixType')}
            className="form-input"
          >
            <option value="">Choose an asphalt mix...</option>
            {ASPHALT_MIXES.map((mix) => (
              <option key={mix.id} value={mix.id}>
                {mix.name} - ${mix.pricePerTon}/ton - {mix.description}
              </option>
            ))}
          </select>
          {errors.mixType && (
            <p className="mt-2 text-sm text-red-600">{errors.mixType.message}</p>
          )}
          
          {/* Selected Mix Details */}
          {selectedMix && (
            <div className="mt-4 p-4 bg-secondary/10 border border-secondary/30 rounded-md">
              <h4 className="heading-sm text-text-primary mb-2">{selectedMix.name}</h4>
              <p className="text-text-secondary mb-2">{selectedMix.description}</p>
              <div className="text-sm text-text-muted grid grid-cols-1 sm:grid-cols-3 gap-2">
                <p>Aggregate Size: {selectedMix.specifications.aggregateSize}</p>
                <p>Asphalt Content: {selectedMix.specifications.asphaltContent}%</p>
                {selectedMix.specifications.additives && (
                  <p>Additives: {selectedMix.specifications.additives.join(', ')}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tonnage Input */}
        <div>
          <label className="form-label">
            Tonnage Required *
          </label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            {...register('tonnage', { valueAsNumber: true })}
            className="form-input"
            placeholder="Enter tonnage"
          />
          {errors.tonnage && (
            <p className="mt-1 text-sm text-red-600">{errors.tonnage.message}</p>
          )}
        </div>

        {/* Pickup Date and Time */}
        <div>
          <h3 className="heading-md mb-3 sm:mb-4">Pickup Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                Pickup Date *
              </label>
              <input
                type="date"
                {...register('pickupDate')}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.pickupDate && (
                <p className="mt-1 text-sm text-red-600">{errors.pickupDate.message}</p>
              )}
            </div>
            
            <div>
              <label className="form-label">
                Pickup Time *
              </label>
              <select
                {...register('pickupTime')}
                className="form-input"
              >
                <option value="">Select time...</option>
                {timeOptions.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
              {errors.pickupTime && (
                <p className="mt-1 text-sm text-red-600">{errors.pickupTime.message}</p>
              )}
              {pickupDate && (() => {
                const selectedDate = new Date(pickupDate + 'T00:00:00');
                const today = new Date();
                const selectedDateString = selectedDate.toISOString().split('T')[0];
                const todayString = today.toISOString().split('T')[0];
                return selectedDateString === todayString;
              })() && (
                <p className="mt-1 text-sm text-white-600">
                  Same-day pickup requires at least 2 hours advance notice for processing.
                </p>
              )}
            </div>
          </div>

          {/* Overtime Warning */}
          {showOvertimeWarning && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Additional Charges Apply</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Pickup times after 4:00 PM or on weekends require additional charges for plant personnel overtime. Please contact us for specific rates.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Estimated Total */}
        {estimatedTotal > 0 && (
          <div className="card-body bg-bg-surface-light rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-medium text-text-primary">Estimated Total:</span>
              <span className="text-2xl font-bold text-green-600">
                ${estimatedTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-secondary">Authorization Amount (110%):</span>
              <span className="text-lg font-semibold text-secondary">
                ${(estimatedTotal * 1.1).toFixed(2)}
              </span>
            </div>
            <div className="bg-secondary/10 border border-secondary/30 rounded-md p-3">
              <p className="text-sm text-text-primary">
                <span className="font-medium">Important:</span> As you know, the silos could dispense over or under the quantity you are ordering. As a convenience to you, we are placing this authorization for 10% over what you ordered, and the final amount will be exactly what was dispensed to you at the plant.
              </p>
            </div>
          </div>
        )}

        {/* Customer Information */}
        <div>
          <h3 className="heading-md mb-3 sm:mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="form-label">
                First Name *
              </label>
              <input
                type="text"
                {...register('customerDetails.firstName')}
                className="form-input"
              />
              {errors.customerDetails?.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.customerDetails.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="form-label">
                Last Name *
              </label>
              <input
                type="text"
                {...register('customerDetails.lastName')}
                className="form-input"
              />
              {errors.customerDetails?.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.customerDetails.lastName.message}
                </p>
              )}
            </div>

            <div>
              <label className="form-label">
                Email *
              </label>
              <input
                type="email"
                {...register('customerDetails.email')}
                className="form-input"
              />
              {errors.customerDetails?.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.customerDetails.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="form-label">
                Phone (Optional)
              </label>
              <input
                type="tel"
                {...register('customerDetails.phone')}
                className="form-input"
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="md:col-span-2">
              <label className="form-label">
                Company (Optional)
              </label>
              <input
                type="text"
                {...register('customerDetails.company')}
                className="form-input"
                placeholder="Company name"
              />
            </div>
          </div>
        </div>

        {/* Onsite Contact Information */}
        <div>
          <h3 className="heading-md mb-3 sm:mb-4">Onsite Contact Information</h3>
          <p className="text-text-secondary mb-4 text-sm">
            Person who will be present at the pickup location to receive the asphalt mix.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="form-label">
                Contact Person Name *
              </label>
              <input
                type="text"
                {...register('onsiteContact.name')}
                className="form-input"
                placeholder="Full name of person receiving the mix"
              />
              {errors.onsiteContact?.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.onsiteContact.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="form-label">
                Contact Person Phone *
              </label>
              <input
                type="tel"
                {...register('onsiteContact.phone')}
                className="form-input"
                placeholder="(555) 123-4567"
              />
              {errors.onsiteContact?.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.onsiteContact.phone.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div>
          <h3 className="heading-md mb-4">Pickup Location</h3>
          <div className="space-y-3">
            {PICKUP_LOCATIONS.map((location) => (
              <div
                key={location.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  watch('pickupLocationId') === location.id
                    ? 'border-secondary bg-secondary/10'
                    : 'border-border-secondary hover:border-secondary/50'
                }`}
                onClick={() => setValue('pickupLocationId', location.id)}
              >
                <input
                  type="radio"
                  {...register('pickupLocationId')}
                  value={location.id}
                  className="sr-only"
                />
                <h4 className="heading-sm text-text-primary">{location.name}</h4>
                <p className="text-text-secondary">{location.address}</p>
                {location.availability && (
                  <div className="mt-2 text-xs text-text-muted">
                    <p>{location.availability.days} | {location.availability.hours}</p>
                    {location.availability.weekendNote && (
                      <p className="italic">({location.availability.weekendNote})</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {errors.pickupLocationId && (
            <p className="mt-2 text-sm text-red-600">{errors.pickupLocationId.message}</p>
          )}
        </div>

        {/* Additional Information */}
        <div>
          <h3 className="heading-md mb-4">Additional Information</h3>
          
          <div className="mb-4">
            <label className="form-label">
              Delivery Destination (Optional)
            </label>
            <input
              type="text"
              {...register('destination')}
              className="form-input"
              placeholder="Enter delivery address if different from pickup"
            />
          </div>

          <div>
            <label className="form-label">
              Special Instructions (Optional)
            </label>
            <textarea
              {...register('specialInstructions')}
              rows={3}
              className="form-input"
              placeholder="Any special requirements or instructions for your order"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Processing...' : 'Proceed to Payment Authorization'}
          </button>
        </div>
      </form>
    </div>
  );
} 