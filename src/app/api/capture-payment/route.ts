import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe-server';
import { updateOrderStatus } from '@/lib/firestore';
import { Load } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { 
      paymentIntentId, 
      actualAmount, 
      authorizedAmount,
      orderId,
      isPartialPayment = false,
      deliveredTonnage,
      loads = [] // Accept loads array
    } = await request.json();

    // Validate inputs
    if (!paymentIntentId || !actualAmount || !authorizedAmount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const actualAmountCents = Math.round(actualAmount * 100);
    const authorizedAmountCents = Math.round(authorizedAmount * 100);

    // Determine the amount to capture (never exceed authorized amount)
    const captureAmount = Math.min(actualAmountCents, authorizedAmountCents);

    // Prepare Stripe metadata with load information
    const stripeMetadata: Record<string, string> = {
      order_id: orderId || '',
      capture_date: new Date().toISOString(),
      delivered_tonnage: deliveredTonnage?.toString() || '0',
    };

    // Add load information if loads are provided
    if (loads && loads.length > 0) {
      // Format load summary: "Load1:25.5t(T001)|Load2:23.2t(T002)|Load3:24.8t(T003)"
      const loadSummary = loads.map((load: Load) => 
        `Load${load.loadNumber}:${load.tonnageDelivered}t(${load.ticketNumber || 'N/A'})`
      ).join('|');

      // Extract ticket numbers: "T001,T002,T003"
      const ticketNumbers = loads
        .map((load: Load) => load.ticketNumber || 'N/A')
        .join(',');

      // Additional metadata with load details
      stripeMetadata.load_count = loads.length.toString();
      stripeMetadata.load_summary = loadSummary;
      stripeMetadata.ticket_numbers = ticketNumbers;
      
      // Add truck information if available
      const truckIds = loads
        .map((load: Load) => load.truckId || 'N/A')
        .filter((truck: string) => truck !== 'N/A')
        .join(',');
      
      if (truckIds) {
        stripeMetadata.truck_ids = truckIds;
      }

      // Add delivery time range
      const deliveryTimes = loads.map((load: Load) => new Date(load.deliveryTime));
      const firstDelivery = new Date(Math.min(...deliveryTimes.map((d: Date) => d.getTime())));
      const lastDelivery = new Date(Math.max(...deliveryTimes.map((d: Date) => d.getTime())));
      
      stripeMetadata.first_delivery = firstDelivery.toISOString();
      stripeMetadata.last_delivery = lastDelivery.toISOString();
    }

    // Capture the payment with metadata
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: captureAmount,
      metadata: stripeMetadata,
    });

    // Update order status based on payment type
    let orderUpdateData: any = {
      finalAmount: captureAmount / 100,
    };

    // Always complete the order when processing payment for delivered loads
    orderUpdateData.actualTonnage = deliveredTonnage;
    if (orderId) {
      await updateOrderStatus(orderId, 'completed', orderUpdateData);
    }

    // Prepare response with message based on capture scenario
    let message: string;
    let excess_amount: number | undefined;

    if (actualAmountCents <= authorizedAmountCents) {
      message = `Payment captured successfully: $${(captureAmount / 100).toFixed(2)}`;
      if (loads && loads.length > 0) {
        message += ` for ${loads.length} load(s) totaling ${deliveredTonnage} tons`;
      }
    } else {
      message = `Captured maximum authorized amount: $${(captureAmount / 100).toFixed(2)}. Actual amount of $${actualAmount.toFixed(2)} exceeded authorization by $${(actualAmount - authorizedAmount).toFixed(2)}.`;
      excess_amount = actualAmount - authorizedAmount;
    }

    const response = {
      success: true,
      captured_amount: captureAmount,
      captured_amount_dollars: captureAmount / 100,
      authorized_amount_dollars: authorizedAmount,
      actual_amount_dollars: actualAmount,
      payment_intent: paymentIntent,
      message,
      is_partial_payment: isPartialPayment,
      load_count: loads?.length || 0,
      stripe_metadata: stripeMetadata, // Include metadata in response for debugging
      ...(excess_amount !== undefined && { excess_amount }),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error capturing payment:', error);
    
    // Handle specific Stripe errors
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Payment capture failed', 
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Payment capture failed' },
      { status: 500 }
    );
  }
} 