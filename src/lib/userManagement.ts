import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { User, CreateUserRequest, UserRole } from '@/types';

// Collections
const USERS_COLLECTION = 'users';

// Validate Duval Asphalt email domain
export const isValidDuvalEmail = (email: string): boolean => {
  return email.endsWith('@duvalasphalt.com');
};

// Get all admin users (admin + plant operators)
export const getAdminUsers = async (): Promise<User[]> => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('role', 'in', ['admin', 'plant_operator']),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const users: User[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        uid: doc.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        createdAt: data.createdAt.toDate(),
        lastLogin: data.lastLogin?.toDate(),
        isActive: data.isActive,
        createdBy: data.createdBy,
      });
    });

    return users;
  } catch (error) {
    console.error('Error getting admin users:', error);
    throw new Error('Failed to get admin users');
  }
};

// Get user by ID
export const getUserById = async (uid: string): Promise<User | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        createdAt: data.createdAt.toDate(),
        lastLogin: data.lastLogin?.toDate(),
        isActive: data.isActive,
        createdBy: data.createdBy,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw new Error('Failed to get user');
  }
};

// Create user profile in Firestore (after Firebase Auth user is created)
export const createUserProfile = async (
  uid: string,
  userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    createdBy: string;
  }
): Promise<void> => {
  try {
    const userDoc = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userDoc, {
      ...userData,
      createdAt: Timestamp.now(),
      isActive: true,
      lastLogin: null,
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (uid: string, isActive: boolean): Promise<void> => {
  try {
    const userDoc = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userDoc, {
      isActive,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw new Error('Failed to update user status');
  }
};

// Update user role
export const updateUserRole = async (uid: string, role: UserRole): Promise<void> => {
  try {
    const userDoc = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userDoc, {
      role,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
};

// Update last login timestamp
export const updateLastLogin = async (uid: string): Promise<void> => {
  try {
    const userDoc = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userDoc, {
      lastLogin: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    // Don't throw error for this, it's not critical
  }
};

// Check if user has permission to access admin features
export const canAccessAdmin = (user: User | null): boolean => {
  if (!user || !user.isActive) return false;
  return (user.role === 'admin' || user.role === 'plant_operator') && 
         isValidDuvalEmail(user.email);
};

// Check if user can manage other users
export const canManageUsers = (user: User | null): boolean => {
  if (!user || !user.isActive) return false;
  return user.role === 'admin' && isValidDuvalEmail(user.email);
}; 