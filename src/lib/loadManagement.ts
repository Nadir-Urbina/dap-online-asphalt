import { Order, Load, LoadSummary, CreateLoadRequest } from '@/types';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Ensure order has all required fields for load management
 */
function ensureOrderCompatibility(order: Order): Order {
  return {
    ...order,
    originalTonnage: order.originalTonnage || order.items[0]?.tonnage || 0,
    totalDelivered: order.totalDelivered || 0,
    maxAllowedTonnage: order.maxAllowedTonnage || (order.items[0]?.tonnage || 0) * 1.1,
    loads: order.loads || [],
    isMultiLoad: order.isMultiLoad ?? ((order.items[0]?.tonnage || 0) >= 50),
    paymentStrategy: order.paymentStrategy || 'full_upfront',
    paidLoads: order.paidLoads || []
  };
}

/**
 * Calculate load summary for an order
 */
export function calculateLoadSummary(order: Order): LoadSummary {
  const compatibleOrder = ensureOrderCompatibility(order);
  const totalLoads = compatibleOrder.loads.length;
  const totalDelivered = compatibleOrder.loads.reduce((sum, load) => sum + load.tonnageDelivered, 0);
  const remainingTonnage = Math.max(0, compatibleOrder.originalTonnage - totalDelivered);
  const percentComplete = (totalDelivered / compatibleOrder.originalTonnage) * 100;
  
  // Check if more loads can be added (within 110% limit)
  const maxAdditionalTonnage = Math.max(0, compatibleOrder.maxAllowedTonnage - totalDelivered);
  const canAddMoreLoads = maxAdditionalTonnage > 0;
  
  return {
    totalLoads,
    totalDelivered,
    remainingTonnage,
    percentComplete: Math.min(100, percentComplete),
    canAddMoreLoads,
    maxAdditionalTonnage
  };
}

/**
 * Validate if a new load can be safely added
 */
export function validateNewLoad(order: Order, tonnageToAdd: number): {
  isValid: boolean;
  error?: string;
  warning?: string;
} {
  const compatibleOrder = ensureOrderCompatibility(order);
  const summary = calculateLoadSummary(compatibleOrder);
  
  // Check if adding this load would exceed 110% limit
  if (tonnageToAdd > summary.maxAdditionalTonnage) {
    return {
      isValid: false,
      error: `Cannot deliver ${tonnageToAdd} tons. Maximum additional tonnage allowed: ${summary.maxAdditionalTonnage} tons (110% limit: ${compatibleOrder.maxAllowedTonnage} tons total)`
    };
  }
  
  // Check for minimum load size (optional business rule)
  if (tonnageToAdd < 0.5) {
    return {
      isValid: false,
      error: 'Minimum load size is 0.5 tons'
    };
  }
  
  // Warning if this load would complete or exceed the original order
  const newTotal = summary.totalDelivered + tonnageToAdd;
  if (newTotal >= compatibleOrder.originalTonnage) {
    const excess = newTotal - compatibleOrder.originalTonnage;
    return {
      isValid: true,
      warning: excess > 0 
        ? `This load will exceed the original order by ${excess.toFixed(1)} tons`
        : 'This load will complete the original order'
    };
  }
  
  return { isValid: true };
}

/**
 * Create a new load for an order
 */
export async function createLoad(loadRequest: CreateLoadRequest, createdBy: string): Promise<{
  success: boolean;
  loadId?: string;
  error?: string;
}> {
  try {
    // Get current order data
    const orderRef = doc(db, 'orders', loadRequest.orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      return { success: false, error: 'Order not found' };
    }
    
    const rawOrder = { id: orderSnap.id, ...orderSnap.data() } as Order;
    const order = ensureOrderCompatibility(rawOrder);
    
    // Validate the new load
    const validation = validateNewLoad(order, loadRequest.tonnageDelivered);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }
    
    // Create new load
    const loadId = `load_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newLoad: Load = {
      id: loadId,
      loadNumber: order.loads.length + 1,
      tonnageDelivered: loadRequest.tonnageDelivered,
      deliveryTime: new Date(),
      truckId: loadRequest.truckId,
      driverName: loadRequest.driverName,
      ticketNumber: loadRequest.ticketNumber,
      notes: loadRequest.notes,
      status: 'delivered',
      createdAt: new Date(),
      createdBy
    };
    
    // Calculate new totals
    const newTotalDelivered = order.totalDelivered + loadRequest.tonnageDelivered;
    
    // Determine new order status
    let newStatus = order.status;
    // Only change to partial_delivery if this is the first load
    // Never automatically mark as completed - only payment processing does that
    if (order.loads.length === 0) {
      // First load
      newStatus = 'partial_delivery';
    }
    // Keep existing status if loads are already being delivered
    
    // Update order with new load
    await updateDoc(orderRef, {
      loads: arrayUnion(newLoad),
      totalDelivered: newTotalDelivered,
      status: newStatus,
      // Ensure compatibility fields are set if they don't exist
      originalTonnage: order.originalTonnage,
      maxAllowedTonnage: order.maxAllowedTonnage,
      isMultiLoad: order.isMultiLoad,
      paymentStrategy: order.paymentStrategy,
      paidLoads: order.paidLoads
    });
    
    return { success: true, loadId };
    
  } catch (error) {
    console.error('Error creating load:', error);
    return { success: false, error: 'Failed to create load' };
  }
}

/**
 * Get delivery progress for an order
 */
export function getDeliveryProgress(order: Order): {
  phase: 'not_started' | 'in_progress' | 'completed' | 'over_delivered';
  progressPercentage: number;
  statusMessage: string;
} {
  const compatibleOrder = ensureOrderCompatibility(order);
  const summary = calculateLoadSummary(compatibleOrder);
  
  if (summary.totalDelivered === 0) {
    return {
      phase: 'not_started',
      progressPercentage: 0,
      statusMessage: 'No deliveries yet'
    };
  }
  
  if (summary.totalDelivered > compatibleOrder.originalTonnage) {
    const excess = summary.totalDelivered - compatibleOrder.originalTonnage;
    return {
      phase: 'over_delivered',
      progressPercentage: summary.percentComplete,
      statusMessage: `Over-delivered by ${excess.toFixed(1)} tons`
    };
  }
  
  if (summary.totalDelivered >= compatibleOrder.originalTonnage) {
    return {
      phase: 'completed',
      progressPercentage: 100,
      statusMessage: 'Order completed'
    };
  }
  
  return {
    phase: 'in_progress',
    progressPercentage: summary.percentComplete,
    statusMessage: `${summary.remainingTonnage.toFixed(1)} tons remaining`
  };
}

/**
 * Calculate payment amounts for load-based billing
 */
export function calculateLoadPayments(order: Order): {
  totalAuthorized: number;
  totalDelivered: number;
  amountToCapture: number;
  refundAmount: number;
} {
  const compatibleOrder = ensureOrderCompatibility(order);
  const summary = calculateLoadSummary(compatibleOrder);
  const pricePerTon = compatibleOrder.authorizedAmount / compatibleOrder.maxAllowedTonnage; // Back-calculate price per ton
  
  const totalAuthorized = compatibleOrder.authorizedAmount;
  const totalDelivered = summary.totalDelivered * pricePerTon;
  const amountToCapture = Math.min(totalDelivered, totalAuthorized);
  const refundAmount = Math.max(0, totalAuthorized - amountToCapture);
  
  return {
    totalAuthorized,
    totalDelivered,
    amountToCapture,
    refundAmount
  };
} 