import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error handling helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Auth helpers
export const loginWithGoogle = async () => {
  try {
    console.log('Starting Google login...');
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log('Google login successful, checking registration...');
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('User not registered, signing out...');
      await signOut(auth);
      throw new Error('USER_NOT_REGISTERED');
    }
    
    console.log('User logged in successfully');
    return user;
  } catch (error) {
    console.error('Login error details:', error);
    throw error;
  }
};

export const registerUserWithGoogle = async (role: 'medium' | 'consulente') => {
  try {
    console.log('Starting Google registration...');
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('User already registered');
      await signOut(auth);
      throw new Error('USER_ALREADY_REGISTERED');
    }

    // Check if it's the admin email
    const isAdminEmail = user.email === 'thiagosalvinots2020@gmail.com';
    const finalRole = isAdminEmail ? 'admin' : role;
    const finalStatus = (isAdminEmail || role === 'consulente') ? 'approved' : 'pending';

    console.log(`Creating new user document with role: ${finalRole} and status: ${finalStatus}...`);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Usuário',
      role: finalRole,
      status: finalStatus
    });
    console.log('User registered successfully');
    
    return user;
  } catch (error: any) {
    if (error.message !== 'USER_ALREADY_REGISTERED') {
      console.error('Registration error details:', error);
    }
    throw error;
  }
};

export const logout = () => signOut(auth);
