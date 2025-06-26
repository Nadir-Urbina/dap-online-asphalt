import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, createProduct } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') !== 'false';
    
    const products = await getAllProducts(activeOnly);
    
    return NextResponse.json({ products }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const {
      productId,
      type,
      name,
      description,
      price,
      stock,
      active = true,
      minStock,
      category,
      manufacturer,
      imageUrl
    } = body;

    if (!productId || !type || !name || !description || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['tool', 'equipment', 'part', 'supplies'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid product type' },
        { status: 400 }
      );
    }

    const productData = {
      productId,
      type,
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      active,
      ...(minStock !== undefined && { minStock: parseInt(minStock) }),
      ...(category && { category }),
      ...(manufacturer && { manufacturer }),
      ...(imageUrl && { imageUrl })
    };

    const productDocId = await createProduct(productData);
    
    return NextResponse.json(
      { message: 'Product created successfully', id: productDocId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
} 