import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe-server';

export async function POST(request: NextRequest) {
  try {
    const { 
      paymentIntentId, 
      actualAmount, 
      authorizedAmount,
      orderId 
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

    // Capture the payment
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: captureAmount,
    });

    // Prepare response with message based on capture scenario
    let message: string;
    let excess_amount: number | undefined;

    if (actualAmountCents <= authorizedAmountCents) {
      message = `Payment captured successfully: $${(captureAmount / 100).toFixed(2)}`;
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