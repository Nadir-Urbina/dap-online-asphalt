import { NextRequest, NextResponse } from 'next/server';
import { getAsphaltMix, updateAsphaltMix, deactivateAsphaltMix } from '@/lib/firestore';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const mix = await getAsphaltMix(params.id);
    
    if (!mix) {
      return NextResponse.json(
        { error: 'Asphalt mix not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ mix });
  } catch (error) {
    console.error('Error fetching asphalt mix:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asphalt mix' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const mixData = await request.json();
    
    // Remove readonly fields
    const { id, createdAt, updatedAt, ...updateData } = mixData;
    
    await updateAsphaltMix(params.id, updateData);

    return NextResponse.json({
      success: true,
      message: 'Asphalt mix updated successfully'
    });
  } catch (error) {
    console.error('Error updating asphalt mix:', error);
    return NextResponse.json(
      { error: 'Failed to update asphalt mix' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    await deactivateAsphaltMix(params.id);

    return NextResponse.json({
      success: true,
      message: 'Asphalt mix deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating asphalt mix:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate asphalt mix' },
      { status: 500 }
    );
  }
} 