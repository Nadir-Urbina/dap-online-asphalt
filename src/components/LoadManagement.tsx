'use client';

import React, { useState } from 'react';
import { Order, Load, CreateLoadRequest } from '@/types';
import { 
  calculateLoadSummary, 
  validateNewLoad, 
  createLoad, 
  getDeliveryProgress 
} from '@/lib/loadManagement';
import { useAuth } from '@/contexts/AuthContext';

interface LoadManagementProps {
  order: Order;
  onLoadAdded: () => void; // Callback to refresh order data (keeps modal open)
  onPaymentCompleted?: () => void; // Callback when payment is completed (closes modal)
}

export default function LoadManagement({ order, onLoadAdded, onPaymentCompleted }: LoadManagementProps) {
  const { user } = useAuth();
  const [isAddingLoad, setIsAddingLoad] = useState(false);
  const [newLoad, setNewLoad] = useState<Partial<CreateLoadRequest>>({
    tonnageDelivered: 0,
    truckId: '',
    driverName: '',
    ticketNumber: '',
    notes: ''
  });
  const [validationError, setValidationError] = useState<string>('');
  const [validationWarning, setValidationWarning] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ensure order has all required fields for load management
  const ensureOrderCompatibility = (order: Order): Order => {
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
  };

  const compatibleOrder = ensureOrderCompatibility(order);
  
  // Add error boundary for calculation functions
  let summary, progress;
  try {
    summary = calculateLoadSummary(compatibleOrder);
    progress = getDeliveryProgress(compatibleOrder);
  } catch (error) {
    console.error('Error calculating load summary:', error);
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">
          <h4 className="font-semibold">Error Loading Order Data</h4>
          <p className="text-sm mt-1">
            This order may be from an older version and needs to be updated. Please try placing a new order to test the load management system.
          </p>
        </div>
          </div>
  );
}

// Payment Processing Component for Partial Deliveries
interface PaymentProcessingSectionProps {
  order: Order;
  summary: any; // LoadSummary type
  onPaymentProcessed: () => void;
}

function PaymentProcessingSection({ order, summary, onPaymentProcessed }: PaymentProcessingSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Calculate payment amounts for delivered loads
  const calculatePaymentAmounts = () => {
    const pricePerTon = order.authorizedAmount / order.maxAllowedTonnage;
    const deliveredAmount = summary.totalDelivered * pricePerTon;
    const amountToCapture = Math.min(deliveredAmount, order.authorizedAmount);
    const remainingAuthorization = order.authorizedAmount - amountToCapture;

    return {
      pricePerTon,
      deliveredAmount,
      amountToCapture,
      remainingAuthorization
    };
  };

  const paymentAmounts = calculatePaymentAmounts();

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      if (!order.paymentIntentId) {
        throw new Error('No payment intent found for this order');
      }

      const response = await fetch('/api/capture-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: order.paymentIntentId,
          actualAmount: paymentAmounts.amountToCapture,
          authorizedAmount: order.authorizedAmount,
          orderId: order.id,
          isPartialPayment: false, // Complete the order
          deliveredTonnage: summary.totalDelivered,
          loads: order.loads // ✅ Pass the full loads array with truck IDs, driver names, ticket numbers
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Payment capture failed');
      }

      setSuccessMessage(`Order completed successfully! Captured $${paymentAmounts.amountToCapture.toFixed(2)} for ${summary.totalDelivered} tons delivered.`);
      setShowProcessing(false);
      
      // Close modal after a brief delay to show success message
      setTimeout(() => {
        onPaymentProcessed(); // This will close the modal since order is completed
      }, 2000);
    } catch (error) {
      console.error('Error processing payment:', error);
      setErrorMessage('Error processing payment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-bg-surface-light p-6 rounded-lg border-l-4 border-green-500">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{errorMessage}</p>
              <button
                onClick={() => setErrorMessage('')}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="heading-sm text-green-800">Complete Order</h4>
          <p className="text-sm text-text-secondary mt-1">
            Process payment and complete order for {summary.totalDelivered} tons delivered
          </p>
        </div>
        {!showProcessing && (
          <button
            onClick={() => setShowProcessing(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
          >
            Complete Order
          </button>
        )}
      </div>

      {showProcessing && (
        <div className="space-y-4 border-t border-border-secondary pt-4">
          <div className="bg-bg-surface p-4 rounded-lg">
            <h5 className="font-semibold text-text-primary mb-3">Payment Summary</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Tons Delivered:</span>
                <span className="font-medium text-text-primary">{summary.totalDelivered.toFixed(1)} tons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Price per Ton:</span>
                <span className="font-medium text-text-primary">${paymentAmounts.pricePerTon.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Total for Delivered:</span>
                <span className="font-medium text-text-primary">${paymentAmounts.deliveredAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-border-primary pt-2">
                <span className="text-text-secondary">Amount to Capture:</span>
                <span className="font-semibold text-green-600 text-lg">${paymentAmounts.amountToCapture.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Complete Order:</span> This will charge for the asphalt delivered and 
              complete the order. If the customer needs more asphalt, they can place a new order.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isProcessing ? 'Completing Order...' : `Complete & Capture $${paymentAmounts.amountToCapture.toFixed(2)}`}
            </button>
            <button
              onClick={() => setShowProcessing(false)}
              className="px-6 py-2 border border-border-primary rounded-md shadow-sm text-sm font-medium text-text-secondary bg-bg-surface-light hover:bg-bg-surface hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

  const handleTonnageChange = (tonnage: number) => {
    setNewLoad(prev => ({ ...prev, tonnageDelivered: tonnage }));
    
    if (tonnage > 0) {
      const validation = validateNewLoad(compatibleOrder, tonnage);
      setValidationError(validation.error || '');
      setValidationWarning(validation.warning || '');
    } else {
      setValidationError('');
      setValidationWarning('');
    }
  };

  const handleAddLoad = async () => {
    if (!user || !newLoad.tonnageDelivered) return;

    setIsSubmitting(true);
    try {
      const result = await createLoad({
        orderId: compatibleOrder.id,
        tonnageDelivered: newLoad.tonnageDelivered,
        truckId: newLoad.truckId,
        driverName: newLoad.driverName,
        ticketNumber: newLoad.ticketNumber,
        notes: newLoad.notes
      }, user.uid);

      if (result.success) {
        // Reset form
        setNewLoad({
          tonnageDelivered: 0,
          truckId: '',
          driverName: '',
          ticketNumber: '',
          notes: ''
        });
        setIsAddingLoad(false);
        setValidationError('');
        setValidationWarning('');
        
        // Show refreshing state and wait for parent to refresh
        setIsRefreshing(true);
        await onLoadAdded();
        setIsRefreshing(false);
      } else {
        setValidationError(result.error || 'Failed to add load');
      }
    } catch (error) {
      setValidationError('Failed to add load');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Refreshing Indicator */}
      {isRefreshing && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">Refreshing order data...</p>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Progress */}
      <div className="bg-bg-surface-light p-6 rounded-lg">
        <h4 className="heading-sm mb-4">Delivery Progress</h4>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-text-secondary mb-2">
            <span>Progress</span>
            <span>{progress.progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-bg-surface rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                progress.phase === 'completed' ? 'bg-green-500' :
                progress.phase === 'over_delivered' ? 'bg-orange-500' :
                'bg-secondary'
              }`}
              style={{ width: `${Math.min(100, progress.progressPercentage)}%` }}
            ></div>
          </div>
          <p className="text-sm text-text-secondary mt-2">{progress.statusMessage}</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-text-secondary">Original Order</div>
            <div className="font-semibold text-text-primary">{compatibleOrder.originalTonnage} tons</div>
          </div>
          <div>
            <div className="text-text-secondary">Delivered</div>
            <div className="font-semibold text-text-primary">{summary.totalDelivered.toFixed(1)} tons</div>
          </div>
          <div>
            <div className="text-text-secondary">Remaining</div>
            <div className="font-semibold text-text-primary">{summary.remainingTonnage.toFixed(1)} tons</div>
          </div>
          <div>
            <div className="text-text-secondary">Total Loads</div>
            <div className="font-semibold text-text-primary">{summary.totalLoads}</div>
          </div>
        </div>
      </div>

      {/* Load History */}
      <div className="bg-bg-surface-light p-6 rounded-lg">
        <h4 className="heading-sm mb-4">Load History</h4>
        
        {compatibleOrder.loads.length === 0 ? (
          <p className="text-text-secondary text-center py-4">No loads delivered yet</p>
        ) : (
          <div className="space-y-3">
            {compatibleOrder.loads.map((load) => (
              <div key={load.id} className="bg-bg-surface p-4 rounded border border-border-secondary">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-secondary text-text-on-secondary px-2 py-1 rounded text-sm font-semibold">
                      Load #{load.loadNumber}
                    </span>
                    <span className="font-semibold text-text-primary">
                      {load.tonnageDelivered} tons
                    </span>
                  </div>
                  <span className="text-sm text-text-secondary">
                    {formatDateTime(load.deliveryTime)}
                  </span>
                </div>
                
                {(load.truckId || load.driverName || load.ticketNumber) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {load.truckId && (
                      <div>
                        <span className="text-text-secondary">Truck: </span>
                        <span className="text-text-primary">{load.truckId}</span>
                      </div>
                    )}
                    {load.driverName && (
                      <div>
                        <span className="text-text-secondary">Driver: </span>
                        <span className="text-text-primary">{load.driverName}</span>
                      </div>
                    )}
                    {load.ticketNumber && (
                      <div>
                        <span className="text-text-secondary">Ticket: </span>
                        <span className="text-text-primary">{load.ticketNumber}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {load.notes && (
                  <div className="mt-2 text-sm">
                    <span className="text-text-secondary">Notes: </span>
                    <span className="text-text-primary">{load.notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Load */}
      {summary.canAddMoreLoads && (
        <div className="bg-bg-surface-light p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h4 className="heading-sm">Add New Load</h4>
            {!isAddingLoad && (
              <button
                onClick={() => setIsAddingLoad(true)}
                className="btn-primary"
              >
                Add Load
              </button>
            )}
          </div>

          {isAddingLoad && (
            <div className="space-y-4">
              {/* Tonnage Input */}
              <div>
                <label className="form-label">
                  Tonnage Delivered *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={newLoad.tonnageDelivered || ''}
                  onChange={(e) => handleTonnageChange(parseFloat(e.target.value) || 0)}
                  className="form-input"
                  placeholder="Enter tonnage delivered"
                />
                <p className="text-sm text-text-secondary mt-1">
                  Maximum additional: {summary.maxAdditionalTonnage.toFixed(1)} tons
                </p>
                {validationError && (
                  <p className="text-sm text-red-600 mt-1">{validationError}</p>
                )}
                {validationWarning && (
                  <p className="text-sm text-orange-600 mt-1">{validationWarning}</p>
                )}
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Truck ID</label>
                  <input
                    type="text"
                    value={newLoad.truckId || ''}
                    onChange={(e) => setNewLoad(prev => ({ ...prev, truckId: e.target.value }))}
                    className="form-input"
                    placeholder="e.g., TRK-001"
                  />
                </div>
                <div>
                  <label className="form-label">Driver Name</label>
                  <input
                    type="text"
                    value={newLoad.driverName || ''}
                    onChange={(e) => setNewLoad(prev => ({ ...prev, driverName: e.target.value }))}
                    className="form-input"
                    placeholder="Driver name"
                  />
                </div>
                <div>
                  <label className="form-label">Ticket Number</label>
                  <input
                    type="text"
                    value={newLoad.ticketNumber || ''}
                    onChange={(e) => setNewLoad(prev => ({ ...prev, ticketNumber: e.target.value }))}
                    className="form-input"
                    placeholder="Plant ticket #"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  value={newLoad.notes || ''}
                  onChange={(e) => setNewLoad(prev => ({ ...prev, notes: e.target.value }))}
                  className="form-input"
                  rows={2}
                  placeholder="Any delivery notes..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddLoad}
                  disabled={!newLoad.tonnageDelivered || !!validationError || isSubmitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add Load'}
                </button>
                <button
                  onClick={() => {
                    setIsAddingLoad(false);
                    setValidationError('');
                    setValidationWarning('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Processing for Delivered Loads */}
      {summary.totalDelivered > 0 && (
        <PaymentProcessingSection 
          order={compatibleOrder} 
          summary={summary} 
          onPaymentProcessed={onPaymentCompleted || onLoadAdded}
        />
      )}

      {/* Max Tonnage Reached */}
      {!summary.canAddMoreLoads && summary.totalDelivered > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <svg className="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-semibold text-orange-800">Maximum Tonnage Reached</h4>
              <p className="text-sm text-orange-700 mt-1">
                This order has reached the 110% delivery limit ({compatibleOrder.maxAllowedTonnage} tons). 
                No additional loads can be added.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 