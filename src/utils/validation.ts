import { z } from 'zod';

// Validation schemas
export const customerDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  tonnage: z.number().min(0.5, 'Minimum tonnage is 0.5 tons').optional(),
  mixType: z.string().optional(),
});

export const orderSchema = z.object({
  customerDetails: customerDetailsSchema,
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  pickupLocationId: z.string().min(1, 'Pickup location is required'),
  destination: z.string().optional(),
  specialInstructions: z.string().optional(),
});

// Validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const calculateEstimatedTotal = (tonnage: number, pricePerTon: number): number => {
  return tonnage * pricePerTon;
};

export const formatTonnage = (tonnage: number): string => {
  return `${tonnage} ${tonnage === 1 ? 'ton' : 'tons'}`;
}; 