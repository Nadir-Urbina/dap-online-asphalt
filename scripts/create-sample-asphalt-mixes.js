const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key-here",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dap-online-plant.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dap-online-plant",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dap-online-plant.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "843329550936",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:843329550936:web:ad5d9e6a8c1c9b5d123456"
};

// Check if required environment variables are set
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.warn('⚠️  NEXT_PUBLIC_FIREBASE_API_KEY not set. Using placeholder value.');
  console.log('To run this script with real Firebase, set the following environment variables:');
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, etc.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleAsphaltMixes = [
  {
    mixId: 'SP-12.5',
    type: 'Superpave',
    name: 'Superpave 12.5mm',
    description: 'Dense-graded hot mix asphalt with 12.5mm nominal maximum aggregate size. Commonly used for surface courses on highways and high-traffic areas.',
    pricePerTon: 85.00,
    specifications: {
      aggregateSize: '12.5mm',
      asphaltContent: 5.8,
      voidRatio: 4.0,
      stability: 2200,
      flow: 12.0,
      additives: ['Polymer modifier'],
      gradation: 'Dense'
    },
    performanceGrade: 'PG 64-22',
    applications: ['Highway surface', 'High-traffic roads', 'Urban streets'],
    minimumTemperature: 275,
    maximumTemperature: 325,
    active: true,
    availableForOrders: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    mixId: 'SP-19',
    type: 'Superpave',
    name: 'Superpave 19mm',
    description: 'Dense-graded hot mix asphalt with 19mm nominal maximum aggregate size. Ideal for base and intermediate courses.',
    pricePerTon: 75.00,
    specifications: {
      aggregateSize: '19mm',
      asphaltContent: 5.2,
      voidRatio: 4.5,
      stability: 1800,
      flow: 14.0,
      additives: [],
      gradation: 'Dense'
    },
    performanceGrade: 'PG 64-22',
    applications: ['Base course', 'Intermediate course', 'Parking lots'],
    minimumTemperature: 275,
    maximumTemperature: 320,
    active: true,
    availableForOrders: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    mixId: 'SP-25',
    type: 'Superpave',
    name: 'Superpave 25mm',
    description: 'Dense-graded hot mix asphalt with 25mm nominal maximum aggregate size. Heavy-duty mix for base courses and high-load applications.',
    pricePerTon: 70.00,
    specifications: {
      aggregateSize: '25mm',
      asphaltContent: 4.8,
      voidRatio: 5.0,
      stability: 1600,
      flow: 16.0,
      additives: [],
      gradation: 'Dense'
    },
    performanceGrade: 'PG 58-28',
    applications: ['Heavy-duty base course', 'Industrial areas', 'Airport runways'],
    minimumTemperature: 270,
    maximumTemperature: 315,
    active: true,
    availableForOrders: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    mixId: 'FC-12.5',
    type: 'Friction Course',
    name: 'Friction Course 12.5mm',
    description: 'Open-graded friction course designed for enhanced skid resistance and improved drainage. Premium surface treatment.',
    pricePerTon: 95.00,
    specifications: {
      aggregateSize: '12.5mm',
      asphaltContent: 6.5,
      voidRatio: 18.0,
      stability: 1200,
      flow: 8.0,
      additives: ['Fiber modifier', 'Anti-stripping agent'],
      gradation: 'Open'
    },
    performanceGrade: 'PG 76-22',
    applications: ['Highway surface', 'Bridge decks', 'High-speed corridors'],
    minimumTemperature: 285,
    maximumTemperature: 335,
    active: true,
    availableForOrders: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    mixId: 'SMA-12.5',
    type: 'Stone Matrix Asphalt',
    name: 'Stone Matrix Asphalt 12.5mm',
    description: 'Gap-graded mix with high stone content and polymer-modified binder. Superior durability and rut resistance.',
    pricePerTon: 105.00,
    specifications: {
      aggregateSize: '12.5mm',
      asphaltContent: 6.8,
      voidRatio: 3.5,
      stability: 2800,
      flow: 10.0,
      additives: ['Cellulose fiber', 'Polymer modifier'],
      gradation: 'Gap'
    },
    performanceGrade: 'PG 76-22',
    applications: ['Heavy traffic highways', 'Intersections', 'Bus lanes'],
    minimumTemperature: 285,
    maximumTemperature: 340,
    active: true,
    availableForOrders: false, // Premium mix, special order only
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    mixId: 'WARM-12.5',
    type: 'Warm Mix Asphalt',
    name: 'Warm Mix Asphalt 12.5mm',
    description: 'Environmentally friendly asphalt produced at lower temperatures. Reduces emissions and energy consumption.',
    pricePerTon: 88.00,
    specifications: {
      aggregateSize: '12.5mm',
      asphaltContent: 5.5,
      voidRatio: 4.2,
      stability: 2000,
      flow: 11.0,
      additives: ['Warm mix additive', 'Zeolite'],
      gradation: 'Dense'
    },
    performanceGrade: 'PG 64-22',
    applications: ['Residential areas', 'School zones', 'Environmental projects'],
    minimumTemperature: 230,
    maximumTemperature: 280,
    active: true,
    availableForOrders: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

async function createSampleAsphaltMixes() {
  try {
    console.log('Creating sample asphalt mixes...');
    
    const mixCollection = collection(db, 'asphaltMixes');
    
    for (const mix of sampleAsphaltMixes) {
      const docRef = await addDoc(mixCollection, mix);
      console.log(`Created asphalt mix: ${mix.name} (ID: ${docRef.id})`);
    }
    
    console.log('✅ Sample asphalt mixes created successfully!');
  } catch (error) {
    console.error('❌ Error creating sample asphalt mixes:', error);
  }
}

// Run the script
createSampleAsphaltMixes().then(() => {
  console.log('Script completed. You can now use the asphalt mix management system.');
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
}); 