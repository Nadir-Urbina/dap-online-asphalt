import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  DocumentReference 
} from 'firebase/firestore';
import { db } from './firebase';
import { Order, OrderItem, CustomerDetails, PickupLocation, User, Product, AsphaltMix } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Collections
const ORDERS_COLLECTION = 'orders';
const CUSTOMERS_COLLECTION = 'customers';
const USERS_COLLECTION = 'users';
const PRODUCTS_COLLECTION = 'products';
const ASPHALT_MIXES_COLLECTION = 'asphaltMixes';

// Order Management
export const createOrder = async (orderData: {
  customerId?: string | null;
  customerDetails: CustomerDetails;
  items: OrderItem[];
  pickupLocationId: string;
  destination?: string;
  specialInstructions?: string;
  paymentIntentId: string;
  authorizedAmount: number;
}): Promise<string> => {
  try {
    // Import PICKUP_LOCATIONS here to avoid circular dependency
    const { PICKUP_LOCATIONS } = await import('@/data/constants');
    
    // Find the full pickup location data
    const pickupLocation = PICKUP_LOCATIONS.find(loc => loc.id === orderData.pickupLocationId);
    
    if (!pickupLocation) {
      throw new Error(`Invalid pickup location: ${orderData.pickupLocationId}`);
    }

    // Calculate original tonnage from items (assuming first item is the asphalt order)
    const originalTonnage = orderData.items[0]?.tonnage || 0;
    const maxAllowedTonnage = originalTonnage * 1.1; // 110% limit
    
    // Determine if this is likely a multi-load order (arbitrary threshold of 50 tons)
    const isMultiLoad = originalTonnage >= 50;

    const order: any = {
      customerDetails: orderData.customerDetails,
      items: orderData.items,
      pickupLocation: pickupLocation,
      status: 'pending',
      paymentIntentId: orderData.paymentIntentId,
      authorizedAmount: orderData.authorizedAmount,
      
      // Load tracking fields
      originalTonnage,
      totalDelivered: 0,
      maxAllowedTonnage,
      loads: [],
      isMultiLoad,
      
      // Payment tracking
      paymentStrategy: 'full_upfront', // Default strategy
      paidLoads: [],
      
      createdAt: Timestamp.fromDate(new Date()),
    };

    // Only include optional fields if they have values
    if (orderData.destination) {
      order.destination = orderData.destination;
    }
    if (orderData.specialInstructions) {
      order.specialInstructions = orderData.specialInstructions;
    }

    // Only include customerId if it exists (for logged-in users)
    if (orderData.customerId) {
      order.customerId = orderData.customerId;
    }

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), order);

    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Convert timestamps in loads array
      const loads = data.loads?.map((load: any) => ({
        ...load,
        deliveryTime: load.deliveryTime?.toDate ? load.deliveryTime.toDate() : load.deliveryTime,
        createdAt: load.createdAt?.toDate ? load.createdAt.toDate() : load.createdAt,
      })) || [];
      
      return {
        id: docSnap.id,
        ...data,
        loads,
        createdAt: data.createdAt.toDate(),
        estimatedReadyTime: data.estimatedReadyTime?.toDate(),
        completedAt: data.completedAt?.toDate(),
        lastPaymentDate: data.lastPaymentDate?.toDate(),
      } as Order;
    }

    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    throw new Error('Failed to get order');
  }
};

export const getAllOrders = async (status?: string): Promise<Order[]> => {
  try {
    let q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    if (status) {
      q = query(
        collection(db, ORDERS_COLLECTION),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Convert timestamps in loads array
      const loads = data.loads?.map((load: any) => ({
        ...load,
        deliveryTime: load.deliveryTime?.toDate ? load.deliveryTime.toDate() : load.deliveryTime,
        createdAt: load.createdAt?.toDate ? load.createdAt.toDate() : load.createdAt,
      })) || [];
      
      orders.push({
        id: doc.id,
        ...data,
        loads,
        createdAt: data.createdAt.toDate(),
        estimatedReadyTime: data.estimatedReadyTime?.toDate(),
        completedAt: data.completedAt?.toDate(),
        lastPaymentDate: data.lastPaymentDate?.toDate(),
      } as Order);
    });

    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw new Error('Failed to get orders');
  }
};

export const updateOrderStatus = async (
  orderId: string, 
  status?: Order['status'], // Made optional for partial payments
  additionalData?: {
    finalAmount?: number;
    estimatedReadyTime?: Date;
    actualTonnage?: number;
    partialPaymentAmount?: number;
    lastPaymentDate?: Date;
  }
): Promise<void> => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const updateData: any = {};

    // Only update status if provided
    if (status !== undefined) {
      updateData.status = status;
    }

    if (additionalData?.finalAmount !== undefined) {
      updateData.finalAmount = additionalData.finalAmount;
    }
    
    if (additionalData?.estimatedReadyTime) {
      updateData.estimatedReadyTime = Timestamp.fromDate(additionalData.estimatedReadyTime);
    }

    if (additionalData?.actualTonnage !== undefined) {
      updateData.actualTonnage = additionalData.actualTonnage;
    }

    if (additionalData?.partialPaymentAmount !== undefined) {
      updateData.partialPaymentAmount = additionalData.partialPaymentAmount;
    }

    if (additionalData?.lastPaymentDate) {
      updateData.lastPaymentDate = Timestamp.fromDate(additionalData.lastPaymentDate);
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status');
  }
};

export const getOrdersByLocation = async (pickupLocationId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('pickupLocationId', '==', pickupLocationId),
      where('status', 'in', ['pending', 'authorized', 'confirmed', 'in_production']),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        estimatedReadyTime: data.estimatedReadyTime?.toDate(),
      } as Order);
    });

    return orders;
  } catch (error) {
    console.error('Error getting orders by location:', error);
    throw new Error('Failed to get orders by location');
  }
};

export const getPendingOrders = async (): Promise<Order[]> => {
  return getAllOrders('pending');
};

export const getAuthorizedOrders = async (): Promise<Order[]> => {
  return getAllOrders('authorized');
};

export const getCustomerOrders = async (customerId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        estimatedReadyTime: data.estimatedReadyTime?.toDate(),
      } as Order);
    });

    return orders;
  } catch (error) {
    console.error('Error getting customer orders:', error);
    throw new Error('Failed to get customer orders');
  }
};

// User Management Functions
export const getAllUsers = async (): Promise<User[]> => {
  try {
    // First try to get all admin/staff users with role filter
    let q = query(
      collection(db, USERS_COLLECTION),
      where('role', 'in', ['admin', 'plant_operator'])
    );

    let querySnapshot = await getDocs(q);
    
    // If no results with role filter, try without filter to get all users
    if (querySnapshot.empty) {
      console.log('No users found with role filter, trying without filter...');
      q = query(collection(db, USERS_COLLECTION));
      querySnapshot = await getDocs(q);
    }

    const users: User[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('User data from Firestore:', { uid: doc.id, ...data });
      users.push({
        uid: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
      } as User);
    });

    console.log('Total users found:', users.length);
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    throw new Error('Failed to get users');
  }
};

export const getUsersByDomain = async (domain: string = '@duvalasphalt.com'): Promise<User[]> => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('email', '>=', domain.replace('@', '')),
      where('email', '<', domain.replace('@', '') + '\uf8ff'),
      orderBy('email', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const users: User[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email.includes(domain)) {
        users.push({
          uid: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
        } as User);
      }
    });

    return users;
  } catch (error) {
    console.error('Error getting users by domain:', error);
    // Fallback to get all admin/staff users
    return getAllUsers();
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      isActive: false,
      deactivatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw new Error('Failed to deactivate user');
  }
};

// Product Management Functions
export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const product: Omit<Product, 'id'> = {
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...product,
      createdAt: Timestamp.fromDate(product.createdAt!),
      updatedAt: Timestamp.fromDate(product.updatedAt!),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw new Error('Failed to create product');
  }
};

export const getAllProducts = async (activeOnly: boolean = true): Promise<Product[]> => {
  try {
    let q = query(
      collection(db, PRODUCTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    if (activeOnly) {
      q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Product);
    });

    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    throw new Error('Failed to get products');
  }
};

export const getProduct = async (productId: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Product;
    }

    return null;
  } catch (error) {
    console.error('Error getting product:', error);
    throw new Error('Failed to get product');
  }
};

export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<void> => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    };

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
};

export const updateProductStock = async (productId: string, newStock: number): Promise<void> => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, {
      stock: newStock,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw new Error('Failed to update product stock');
  }
};

export const deactivateProduct = async (productId: string): Promise<void> => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, {
      active: false,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error deactivating product:', error);
    throw new Error('Failed to deactivate product');
  }
};

export const getLowStockProducts = async (threshold?: number): Promise<Product[]> => {
  try {
    const products = await getAllProducts(true);
    return products.filter(product => {
      const stockThreshold = threshold || product.minStock || 10;
      return product.stock <= stockThreshold;
    });
  } catch (error) {
    console.error('Error getting low stock products:', error);
    throw new Error('Failed to get low stock products');
  }
};

export const getProductsByType = async (type: Product['type']): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('type', '==', type),
      where('active', '==', true),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const products: Product[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as Product);
    });

    return products;
  } catch (error) {
    console.error('Error getting products by type:', error);
    throw new Error('Failed to get products by type');
  }
};

// Asphalt Mix Management Functions
export const createAsphaltMix = async (mixData: Omit<AsphaltMix, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const mix: Omit<AsphaltMix, 'id'> = {
      ...mixData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, ASPHALT_MIXES_COLLECTION), {
      ...mix,
      createdAt: Timestamp.fromDate(mix.createdAt!),
      updatedAt: Timestamp.fromDate(mix.updatedAt!),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating asphalt mix:', error);
    throw new Error('Failed to create asphalt mix');
  }
};

export const getAllAsphaltMixes = async (activeOnly: boolean = true): Promise<AsphaltMix[]> => {
  try {
    let q = query(
      collection(db, ASPHALT_MIXES_COLLECTION),
      orderBy('name', 'asc')
    );

    if (activeOnly) {
      q = query(
        collection(db, ASPHALT_MIXES_COLLECTION),
        where('active', '==', true),
        orderBy('name', 'asc')
      );
    }

    const querySnapshot = await getDocs(q);
    const mixes: AsphaltMix[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      mixes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as AsphaltMix);
    });

    return mixes;
  } catch (error) {
    console.error('Error getting asphalt mixes:', error);
    throw new Error('Failed to get asphalt mixes');
  }
};

export const getAsphaltMix = async (mixId: string): Promise<AsphaltMix | null> => {
  try {
    const docRef = doc(db, ASPHALT_MIXES_COLLECTION, mixId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as AsphaltMix;
    }

    return null;
  } catch (error) {
    console.error('Error getting asphalt mix:', error);
    throw new Error('Failed to get asphalt mix');
  }
};

export const updateAsphaltMix = async (mixId: string, updates: Partial<AsphaltMix>): Promise<void> => {
  try {
    const docRef = doc(db, ASPHALT_MIXES_COLLECTION, mixId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    };

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating asphalt mix:', error);
    throw new Error('Failed to update asphalt mix');
  }
};

export const deactivateAsphaltMix = async (mixId: string): Promise<void> => {
  try {
    const docRef = doc(db, ASPHALT_MIXES_COLLECTION, mixId);
    await updateDoc(docRef, {
      active: false,
      availableForOrders: false,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error deactivating asphalt mix:', error);
    throw new Error('Failed to deactivate asphalt mix');
  }
};

export const getAvailableAsphaltMixes = async (): Promise<AsphaltMix[]> => {
  try {
    const q = query(
      collection(db, ASPHALT_MIXES_COLLECTION),
      where('active', '==', true),
      where('availableForOrders', '==', true),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const mixes: AsphaltMix[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      mixes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as AsphaltMix);
    });

    return mixes;
  } catch (error) {
    console.error('Error getting available asphalt mixes:', error);
    throw new Error('Failed to get available asphalt mixes');
  }
};

export const updateAsphaltMixAvailability = async (mixId: string, availableForOrders: boolean): Promise<void> => {
  try {
    const docRef = doc(db, ASPHALT_MIXES_COLLECTION, mixId);
    await updateDoc(docRef, {
      availableForOrders,
      updatedAt: Timestamp.fromDate(new Date())
    });
  } catch (error) {
    console.error('Error updating asphalt mix availability:', error);
    throw new Error('Failed to update asphalt mix availability');
  }
}; 