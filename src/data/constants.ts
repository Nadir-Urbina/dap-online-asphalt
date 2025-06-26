import { PickupLocation, AsphaltMix, Product } from '@/types';

export const PICKUP_LOCATIONS: PickupLocation[] = [
  {
    id: 'phillips-hwy',
    name: 'Phillips Hwy Plant',
    address: '7544 Philips Highway, Jacksonville, FL 32256',
    coordinates: { lat: 30.3322, lng: -81.6557 },
    availability: {
      days: 'Monday – Friday',
      hours: '7AM – 4PM',
      weekendNote: 'weekends available by request'
    }
  },
  {
    id: '12th-street',
    name: '12th Street Plant',
    address: '6820 West 12th Street, Jacksonville, FL 32254',
    coordinates: { lat: 30.3398, lng: -81.6912 },
    availability: {
      days: 'Monday – Friday',
      hours: '7AM – 4PM',
      weekendNote: 'weekends available by request'
    }
  },
  {
    id: 'green-cove',
    name: 'Green Cove Springs Plant',
    address: '1921 Jersey Avenue, Green Cove Springs, FL 32043',
    coordinates: { lat: 29.9947, lng: -81.6757 },
    availability: {
      days: 'Monday – Friday',
      hours: '7AM – 4PM',
      weekendNote: 'weekends available by request'
    }
  }
];

export const ASPHALT_MIXES: AsphaltMix[] = [
  {
    id: 'sp-12.5',
    name: 'SP-12.5',
    description: 'Superpave 12.5mm mix for surface course applications',
    pricePerTon: 85.00,
    specifications: {
      aggregateSize: '12.5mm',
      asphaltContent: 5.8,
      additives: ['Polymer Modified Binder']
    }
  },
  {
    id: 'sp-19',
    name: 'SP-19',
    description: 'Superpave 19mm mix for intermediate and base course',
    pricePerTon: 75.00,
    specifications: {
      aggregateSize: '19mm',
      asphaltContent: 5.2,
      additives: ['Anti-Strip Agent']
    }
  },
  {
    id: 'sp-25',
    name: 'SP-25',
    description: 'Superpave 25mm mix for heavy-duty base course',
    pricePerTon: 70.00,
    specifications: {
      aggregateSize: '25mm',
      asphaltContent: 4.8,
      additives: ['Recycled Asphalt Pavement (RAP)']
    }
  },
  {
    id: 'friction-course',
    name: 'Friction Course',
    description: 'Open-graded friction course for improved drainage',
    pricePerTon: 95.00,
    specifications: {
      aggregateSize: '9.5mm',
      asphaltContent: 6.2,
      additives: ['Stone Matrix Asphalt (SMA)', 'Fibers']
    }
  }
];

export const OTHER_PRODUCTS: Product[] = [
  {
    id: 'asphalt-shovel',
    name: 'Asphalt Lute/Shovel',
    description: 'Heavy-duty aluminum lute for asphalt spreading',
    price: 85.00,
    category: 'tools',
    inStock: true
  },
  {
    id: 'asphalt-rake',
    name: 'Asphalt Rake',
    description: 'Professional grade asphalt rake with fiberglass handle',
    price: 65.00,
    category: 'tools',
    inStock: true
  },
  {
    id: 'screed-plate',
    name: 'Screed Plate - 8ft',
    description: 'Replacement screed plate for paving equipment',
    price: 450.00,
    category: 'parts',
    inStock: true
  },
  {
    id: 'conveyor-belt',
    name: 'Conveyor Belt Section',
    description: 'Heavy-duty conveyor belt for asphalt plant (10ft section)',
    price: 320.00,
    category: 'parts',
    inStock: false
  }
];

export const ORDER_STATUSES = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  CONFIRMED: 'confirmed',
  IN_PRODUCTION: 'in_production',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const; 