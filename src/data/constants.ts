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
    mixId: 'SP-12.5',
    type: 'Superpave',
    name: 'SP-12.5',
    description: 'Superpave 12.5mm mix for surface course applications',
    pricePerTon: 85.00,
    specifications: {
      aggregateSize: '12.5mm',
      asphaltContent: 5.8,
      voidRatio: 4.0,
      stability: 1800,
      flow: 12,
      additives: ['Polymer Modified Binder'],
      gradation: 'FDOT Type SP-12.5'
    },
    performanceGrade: 'PG 64-22',
    applications: ['Surface Course', 'Wearing Course'],
    minimumTemperature: 275,
    maximumTemperature: 325,
    active: true,
    availableForOrders: true
  },
  {
    id: 'sp-19',
    mixId: 'SP-19',
    type: 'Superpave',
    name: 'SP-19',
    description: 'Superpave 19mm mix for intermediate and base course',
    pricePerTon: 75.00,
    specifications: {
      aggregateSize: '19mm',
      asphaltContent: 5.2,
      voidRatio: 4.0,
      stability: 1600,
      flow: 14,
      additives: ['Anti-Strip Agent'],
      gradation: 'FDOT Type SP-19'
    },
    performanceGrade: 'PG 64-22',
    applications: ['Intermediate Course', 'Base Course'],
    minimumTemperature: 270,
    maximumTemperature: 320,
    active: true,
    availableForOrders: true
  },
  {
    id: 'sp-25',
    mixId: 'SP-25',
    type: 'Superpave',
    name: 'SP-25',
    description: 'Superpave 25mm mix for heavy-duty base course',
    pricePerTon: 70.00,
    specifications: {
      aggregateSize: '25mm',
      asphaltContent: 4.8,
      voidRatio: 4.0,
      stability: 1400,
      flow: 16,
      additives: ['Recycled Asphalt Pavement (RAP)'],
      gradation: 'FDOT Type SP-25'
    },
    performanceGrade: 'PG 64-22',
    applications: ['Base Course', 'Heavy Traffic Areas'],
    minimumTemperature: 265,
    maximumTemperature: 315,
    active: true,
    availableForOrders: true
  },
  {
    id: 'friction-course',
    mixId: 'FC-9.5',
    type: 'Open-Graded Friction Course',
    name: 'Friction Course',
    description: 'Open-graded friction course for improved drainage',
    pricePerTon: 95.00,
    specifications: {
      aggregateSize: '9.5mm',
      asphaltContent: 6.2,
      voidRatio: 18.0,
      additives: ['Stone Matrix Asphalt (SMA)', 'Fibers'],
      gradation: 'FDOT Type FC-5'
    },
    performanceGrade: 'PG 76-22',
    applications: ['Surface Course', 'High-Speed Roads', 'Drainage'],
    minimumTemperature: 280,
    maximumTemperature: 330,
    active: true,
    availableForOrders: true
  }
];

export const OTHER_PRODUCTS: Product[] = [
  {
    id: 'asphalt-shovel',
    productId: 'ASH-001',
    type: 'tool',
    name: 'Asphalt Lute/Shovel',
    description: 'Heavy-duty aluminum lute for asphalt spreading',
    price: 85.00,
    stock: 25,
    minStock: 5,
    category: 'tools',
    manufacturer: 'DAP Tools',
    active: true
  },
  {
    id: 'asphalt-rake',
    productId: 'ARK-001',
    type: 'tool',
    name: 'Asphalt Rake',
    description: 'Professional grade asphalt rake with fiberglass handle',
    price: 65.00,
    stock: 18,
    minStock: 5,
    category: 'tools',
    manufacturer: 'DAP Tools',
    active: true
  },
  {
    id: 'screed-plate',
    productId: 'SPL-001',
    type: 'part',
    name: 'Screed Plate - 8ft',
    description: 'Replacement screed plate for paving equipment',
    price: 450.00,
    stock: 3,
    minStock: 1,
    category: 'parts',
    manufacturer: 'Volvo CE',
    active: true
  },
  {
    id: 'conveyor-belt',
    productId: 'CBL-001',
    type: 'part',
    name: 'Conveyor Belt Section',
    description: 'Heavy-duty conveyor belt for asphalt plant (10ft section)',
    price: 320.00,
    stock: 0,
    minStock: 2,
    category: 'parts',
    manufacturer: 'Continental',
    active: true
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