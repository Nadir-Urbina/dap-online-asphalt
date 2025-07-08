export interface AsphaltMix {
  id?: string;
  mixId: string; // Unique mix identifier (e.g., SP-12.5, SP-19)
  type: string; // e.g., "Superpave", "Dense-graded", "Stone Matrix"
  name: string;
  description: string;
  pricePerTon: number;
  specifications: {
    aggregateSize: string;
    asphaltContent: number; // Percentage
    voidRatio?: number; // Air voids percentage
    stability?: number; // Marshall stability
    flow?: number; // Marshall flow
    additives?: string[];
    gradation?: string; // Gradation specification
  };
  performanceGrade?: string; // PG grade (e.g., PG 64-22)
  applications?: string[]; // Where this mix is typically used
  minimumTemperature?: number; // Minimum laying temperature
  maximumTemperature?: number; // Maximum laying temperature
  active: boolean;
  availableForOrders: boolean; // Can customers order this mix
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  id?: string;
  productId: string; // Unique product identifier (SKU)
  type: 'tool' | 'equipment' | 'part' | 'supplies';
  name: string;
  description: string;
  price: number;
  stock: number;
  minStock?: number; // Minimum stock level for alerts
  imageUrl?: string;
  category?: string;
  manufacturer?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  availability?: {
    days: string;
    hours: string;
    weekendNote?: string;
  };
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  tonnage?: number; // For asphalt orders
  mixType?: string; // For asphalt orders
}

// New Load Tracking Interfaces
export interface Load {
  id: string;
  loadNumber: number; // Sequential load number (1, 2, 3, etc.)
  tonnageDelivered: number;
  deliveryTime: Date;
  truckId?: string; // Optional truck identifier
  driverName?: string; // Optional driver name
  ticketNumber?: string; // Plant ticket/receipt number
  notes?: string; // Any delivery notes
  status: 'scheduled' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: Date;
  createdBy: string; // uid of plant operator who created this load
}

export interface Order {
  id: string;
  customerId?: string; // null for guest checkout
  customerDetails: CustomerDetails;
  items: OrderItem[];
  pickupLocation: PickupLocation;
  destination?: string;
  specialInstructions?: string;
  status: 'pending' | 'authorized' | 'confirmed' | 'in_production' | 'ready' | 'partial_delivery' | 'completed' | 'cancelled';
  paymentIntentId?: string; // Stripe payment intent for authorization
  authorizedAmount: number;
  finalAmount?: number;
  
  // Partial Payment Tracking
  partialPaymentAmount?: number; // Total amount captured in partial payments
  lastPaymentDate?: Date; // When the last payment was processed
  
  // Load Tracking Fields
  originalTonnage: number; // The original ordered tonnage
  totalDelivered: number; // Running total of all loads delivered
  maxAllowedTonnage: number; // originalTonnage * 1.1 (110% limit)
  loads: Load[]; // Array of all loads for this order
  isMultiLoad: boolean; // Flag to indicate if this order expects multiple loads
  
  // Payment Tracking
  paymentStrategy: 'full_upfront' | 'per_load' | 'completion'; // How payment is handled
  paidLoads: string[]; // Array of load IDs that have been paid for
  
  createdAt: Date;
  estimatedReadyTime?: Date;
  completedAt?: Date; // When the entire order was completed
}

export interface PaymentAuthorization {
  paymentIntentId: string;
  authorizedAmount: number;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
}

// Load Management Types
export interface LoadSummary {
  totalLoads: number;
  totalDelivered: number;
  remainingTonnage: number;
  percentComplete: number;
  canAddMoreLoads: boolean; // Based on 110% limit
  maxAdditionalTonnage: number; // How much more can be delivered
}

export interface CreateLoadRequest {
  orderId: string;
  tonnageDelivered: number;
  truckId?: string;
  driverName?: string;
  ticketNumber?: string;
  notes?: string;
}

// Authentication & Authorization Types
export type UserRole = 'admin' | 'plant_operator' | 'customer';

export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  createdBy?: string; // uid of admin who created this user
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isPlantOperator: boolean;
  canManageUsers: boolean;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  temporaryPassword: string;
} 