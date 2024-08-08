import React, { createContext, useEffect, ReactNode, useState, useContext } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, User as FirebaseUser, signInWithPopup, GoogleAuthProvider, Auth, sendEmailVerification} from 'firebase/auth';
import { auth, db} from '../Components/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define a custom user type
interface AppUser extends FirebaseUser {
  username?: string;
  role?: string;
}

// Define the type for the context value
interface SignInContextType {
  user: AppUser | null;
  isAuthenticated: boolean | undefined;
  login: (email: string, password: string) => Promise<{ success: boolean }>;
  register: (email: string, password: string, username: string, role: string) => Promise<{ success: boolean; data?: AppUser; msg?: string }>;
  logout: () => void;
  
}

// Define the type for the provider props
interface SignInContextProviderProps {
  children: ReactNode;
}

// Create the context
export const SignInContext = createContext<SignInContextType | undefined>(undefined);

// Create the context provider component
export const SignInContextProvider: React.FC<SignInContextProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await updateUserData(user.uid);
        setUser({ ...user, ...userData } as AppUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });
    return unsub;
  }, []);

  const updateUserData = async (userId: string) => {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; msg?: string}> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
      if (user.emailVerified) {
        return { success: true };
      } else {
       
        return { success: false, msg: 'Please verify your email before logging in.' };
      }
    
    } catch (error) {
      console.error("Error signing in: ", error);
      return { success: false };
    }
  };
  
  /*const signInWithGoogle = async (): Promise<{ success: boolean }> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userData = await updateUserData(user.uid);
      setUser({ ...user, ...userData } as AppUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      return { success: false };
    }
  }; */

 

  const logout = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.clear(); // Clear all data from local storage
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  

  
  const register = async (email: string, password: string, username: string, role: string) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(response.user);
      await setDoc(doc(db, "users", response.user.uid), {
        username,
        role,
        userId: response.user.uid,
      });
  
      // Create an initial revenue document with separate month and year fields
    const date = new Date();
    const currentMonth = date.toLocaleString('default', { month: 'long' });
    const currentYear = date.getFullYear().toString();
    const revenueDocRef = doc(db, `users/${response.user.uid}/revenue/${currentYear}-${currentMonth}`);
    await setDoc(revenueDocRef, {
      total: 0,
      month: currentMonth,
      year: currentYear,
    });
      
      return { success: true, data: { ...response.user, username, role } as AppUser };
    } catch (e) {
      console.error("Error during registration: ", e);
      return { success: false, msg: 'Sign up failed' };
    }
  };
  

  

  return (
    <SignInContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </SignInContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(SignInContext);
  if (!value) {
    throw new Error('useAuth must be wrapped inside SignInContextProvider');
  }
  return value;
};
