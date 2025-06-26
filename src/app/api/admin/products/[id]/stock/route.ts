import { NextRequest, NextResponse } from 'next/server';
import { updateProductStock, getProduct } from '@/lib/firestore';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const { stock } = await request.json();
    
    if (stock === undefined || isNaN(parseInt(stock))) {
      return NextResponse.json(
        { error: 'Valid stock number is required' },
        { status: 400 }
      );
    }

    const stockInt = parseInt(stock);
    if (stockInt < 0) {
      return NextResponse.json(
        { error: 'Stock cannot be negative' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await getProduct(params.id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await updateProductStock(params.id, stockInt);
    
    return NextResponse.json(
      { 
        message: 'Stock updated successfully',
        newStock: stockInt,
        previousStock: existingProduct.stock 
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
} 