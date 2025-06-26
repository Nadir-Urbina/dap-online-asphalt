import { NextRequest, NextResponse } from 'next/server';
import { createAsphaltMix, getAllAsphaltMixes } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const mixes = await getAllAsphaltMixes(activeOnly);

    return NextResponse.json({
      success: true,
      mixes
    });
  } catch (error) {
    console.error('Error fetching asphalt mixes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asphalt mixes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const mixData = await request.json();

    // Validate required fields
    if (!mixData.mixId || !mixData.name || !mixData.type || !mixData.description || mixData.pricePerTon <= 0) {
      return NextResponse.json(
        { error: 'Missing required fields: mixId, name, type, description, and pricePerTon are required' },
        { status: 400 }
      );
    }

    if (!mixData.specifications?.aggregateSize || mixData.specifications?.asphaltContent <= 0) {
      return NextResponse.json(
        { error: 'Missing required specifications: aggregateSize and asphaltContent are required' },
        { status: 400 }
      );
    }

    const mixId = await createAsphaltMix(mixData);

    return NextResponse.json({
      success: true,
      mixId,
      message: 'Asphalt mix created successfully'
    });
  } catch (error) {
    console.error('Error creating asphalt mix:', error);
    return NextResponse.json(
      { error: 'Failed to create asphalt mix' },
      { status: 500 }
    );
  }
} 