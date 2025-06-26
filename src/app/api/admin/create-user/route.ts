import { NextRequest, NextResponse } from 'next/server';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { isValidDuvalEmail } from '@/lib/userManagement';
import { CreateUserRequest, UserRole } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, role, temporaryPassword }: CreateUserRequest = await request.json();

    // Validate input
    if (!email || !firstName || !lastName || !role || !temporaryPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email domain for admin/plant_operator roles
    if ((role === 'admin' || role === 'plant_operator') && !isValidDuvalEmail(email)) {
      return NextResponse.json(
        { error: 'Admin users must have @duvalasphalt.com email address' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'plant_operator', 'customer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check here to ensure only admins can create users
    // For now, we'll implement this and add auth check later

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, temporaryPassword);
      const newUser = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', newUser.uid), {
        email,
        firstName,
        lastName,
        role,
        createdAt: Timestamp.now(),
        isActive: true,
        lastLogin: null,
        createdBy: 'system', // TODO: Replace with actual admin user ID
      });

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        userId: newUser.uid,
      });

    } catch (firebaseError: any) {
      console.error('Firebase error:', firebaseError);
      
      // Handle specific Firebase Auth errors
      if (firebaseError.code === 'auth/email-already-in-use') {
        return NextResponse.json(
          { error: 'Email address is already in use' },
          { status: 400 }
        );
      } else if (firebaseError.code === 'auth/weak-password') {
        return NextResponse.json(
          { error: 'Password is too weak. Must be at least 6 characters.' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 