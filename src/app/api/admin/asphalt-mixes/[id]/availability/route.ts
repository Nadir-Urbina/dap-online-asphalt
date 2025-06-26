import { NextRequest, NextResponse } from 'next/server';
import { updateAsphaltMixAvailability } from '@/lib/firestore';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const { availableForOrders } = await request.json();

    if (typeof availableForOrders !== 'boolean') {
      return NextResponse.json(
        { error: 'availableForOrders must be a boolean value' },
        { status: 400 }
      );
    }

    await updateAsphaltMixAvailability(params.id, availableForOrders);

    return NextResponse.json({
      success: true,
      message: `Asphalt mix availability ${availableForOrders ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error('Error updating asphalt mix availability:', error);
    return NextResponse.json(
      { error: 'Failed to update asphalt mix availability' },
      { status: 500 }
    );
  }
} 