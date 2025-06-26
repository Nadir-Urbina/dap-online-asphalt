import { NextRequest, NextResponse } from 'next/server';
import { updateProduct, deactivateProduct, getProduct } from '@/lib/firestore';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Get current product to validate it exists
    const existingProduct = await getProduct(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate and prepare update data
    const updateData: any = {};
    
    if (body.productId !== undefined) updateData.productId = body.productId;
    if (body.type !== undefined) {
      if (!['tool', 'equipment', 'part', 'supplies'].includes(body.type)) {
        return NextResponse.json(
          { error: 'Invalid product type' },
          { status: 400 }
        );
      }
      updateData.type = body.type;
    }
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock);
    if (body.minStock !== undefined) updateData.minStock = parseInt(body.minStock);
    if (body.category !== undefined) updateData.category = body.category;
    if (body.manufacturer !== undefined) updateData.manufacturer = body.manufacturer;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.active !== undefined) updateData.active = body.active;

    await updateProduct(id, updateData);
    
    return NextResponse.json(
      { message: 'Product updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if product exists
    const existingProduct = await getProduct(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await deactivateProduct(id);
    
    return NextResponse.json(
      { message: 'Product deactivated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deactivating product:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate product' },
      { status: 500 }
    );
  }
} 