import { NextRequest, NextResponse } from 'next/server';
import { updateProductStock, getProduct } from '@/lib/firestore';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (body.stock === undefined || isNaN(parseInt(body.stock))) {
      return NextResponse.json(
        { error: 'Valid stock number is required' },
        { status: 400 }
      );
    }

    const stock = parseInt(body.stock);
    if (stock < 0) {
      return NextResponse.json(
        { error: 'Stock cannot be negative' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await getProduct(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await updateProductStock(id, stock);
    
    return NextResponse.json(
      { 
        message: 'Stock updated successfully',
        newStock: stock,
        previousStock: existingProduct.stock 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating product stock:', error);
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
} 