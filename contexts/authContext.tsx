import React, { createContext, useEffect, ReactNode, useState, useContext } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, User as FirebaseUser, sendEmailVerification, Auth, User, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, db } from '../Components/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'; // Import Google Sign-In


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
  googleSignIn: () => Promise<{ success: boolean; msg?: string }>; // Add Google sign-in method
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
  const [userInfo, setUserInfo] = useState<User | false>(false);
  const [error, setError] = useState<string | undefined>();
  
  useEffect(() => {
    // Initialize Google Sign-In
    GoogleSignin.configure({
      webClientId: '28593816693-b124120j98nrn22s45vv4soords0u8nt.apps.googleusercontent.com', // Replace with your Google Web Client ID
      offlineAccess: true,
    });

    
    // Check if user is logged in when app loads
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await updateUserData(firebaseUser.uid); 
        setUser({ ...firebaseUser, ...userData } as AppUser);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('authToken', await firebaseUser.getIdToken()); // Store token in AsyncStorage
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

    return docSnap.exists() ? docSnap.data() : null;
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; msg?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (firebaseUser.emailVerified) {
        const userData = await updateUserData(firebaseUser.uid);
        setUser({ ...firebaseUser, ...userData } as AppUser);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('authToken', await firebaseUser.getIdToken()); // Store token
        return { success: true };
      } else {
        return { success: false, msg: 'Please verify your email before logging in.' };
      }
    } catch (error) {
      console.error("Error signing in: ", error);
      return { success: false };
    }
  };

  const register = async (email: string, password: string, username: string, role: string) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(response.user);
      await setDoc(doc(db, "users", response.user.uid), {
        email,
        username,
        role,
        userId: response.user.uid,
      });

      const date = new Date();
      const currentMonth = date.toLocaleString('default', { month: 'long' });
      const currentYear = date.getFullYear().toString();
      const revenueDocRef = doc(db, `users/${response.user.uid}/revenue/${currentYear}-${currentMonth}`);
      await setDoc(revenueDocRef, {
        total: 0,
        month: currentMonth,
        year: currentYear,
      });

      const userData = { username, role, userId: response.user.uid };
      setUser({ ...response.user, ...userData } as AppUser);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('authToken', await response.user.getIdToken()); // Store token
      return { success: true, data: { ...response.user, username, role } as AppUser };
    } catch (error) {
      console.error("Error during registration: ", error);
      return { success: false, msg: 'Sign up failed' };
    }
  };

  

  
  // Google Sign-In function without Firebase Auth
  // Google Sign-In function without Firebase Auth
const googleSignIn = async (): Promise<{ success: boolean; msg?: string }> => {
  try {
    console.log("Checking Google Play Services...");
    // Check if Google Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    console.log("Google Play Services available");

    // Perform Google Sign-In
    const googleData = await GoogleSignin.signIn();
    console.log("Google sign-in successful, user data: ", googleData);

    // Get the email selected by the user
    const googleEmail = googleData.user.email;
    if (!googleEmail) {
      console.log("No email found from Google account.");
      return { success: false, msg: "No email found from Google account." };
    }

    console.log("Checking if email exists in Firestore: ", googleEmail);

    // Query Firestore to check if the email exists in the users collection
    const userSnapshot = await getDoc(doc(db, "users", googleData.user.id));
    const isUserRegistered = userSnapshot.exists();

    if (isUserRegistered) {
      console.log("Email found in Firestore, signing in with Google credentials...");

      // If email exists, sign in using the Google credential
      const googleIdToken = (await GoogleSignin.getTokens()).idToken;
      const credential = GoogleAuthProvider.credential(googleIdToken);
      const userCredential = await signInWithCredential(auth, credential);

      // Retrieve user data from Firestore
      const userData = await updateUserData(userCredential.user.uid);
      setUser({ ...userCredential.user, ...userData } as AppUser);
      setIsAuthenticated(true);

      console.log("Google sign-in successful, user signed in.");
      return { success: true };
    } else {
      console.log("Email not found in Firestore, asking user to sign up.");
      return { success: false, msg: "Email not registered. Please sign up." };
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Google Sign-In error: ", error.message);
      return { success: false, msg: `Error during Google Sign-In: ${error.message}` };
    }
    return { success: false, msg: "Unexpected error occurred during Google Sign-In." };
  }
};

  

  const logout = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.clear(); // Clear stored token
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <SignInContext.Provider value={{ user, isAuthenticated, login, register, logout, googleSignIn }}>
      {children}
    </SignInContext.Provider>
  );
};

// Custom hook to use authentication context
export const useAuth = () => {
  const value = useContext(SignInContext);
  if (!value) {
    throw new Error('useAuth must be wrapped inside SignInContextProvider');
  }
  return value;
};
