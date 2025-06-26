import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd verify the user has admin permissions here
    // For now, we'll fetch all admin/staff users
    
    const users = await getAllUsers();
    
    return NextResponse.json({ users }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 