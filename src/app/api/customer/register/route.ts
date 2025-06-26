import { NextRequest, NextResponse } from 'next/server';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface CustomerRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, company }: CustomerRegisterRequest = await request.json();

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Create customer profile in Firestore
      await setDoc(doc(db, 'users', newUser.uid), {
        email,
        firstName,
        lastName,
        phone: phone || null,
        company: company || null,
        role: 'customer',
        createdAt: Timestamp.now(),
        isActive: true,
        lastLogin: null,
        createdBy: 'self-registration',
      });

      return NextResponse.json({
        success: true,
        message: 'Customer account created successfully',
        userId: newUser.uid,
      });

    } catch (firebaseError: any) {
      console.error('Firebase error:', firebaseError);
      
      // Handle specific Firebase Auth errors
      if (firebaseError.code === 'auth/email-already-in-use') {
        return NextResponse.json(
          { error: 'An account with this email address already exists' },
          { status: 400 }
        );
      } else if (firebaseError.code === 'auth/weak-password') {
        return NextResponse.json(
          { error: 'Password is too weak. Please choose a stronger password.' },
          { status: 400 }
        );
      } else if (firebaseError.code === 'auth/invalid-email') {
        return NextResponse.json(
          { error: 'Invalid email address format' },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: 'Failed to create customer account' },
          { status: 500 }
        );
      }
    }

  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer account' },
      { status: 500 }
    );
  }
} 