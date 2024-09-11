import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Import getStorage
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
    apiKey: "AIzaSyAX8WmBiC3cwT5q_5vvozZ6AeSEgZKDwjg",
    authDomain: "epharma-97b49.firebaseapp.com",
    databaseURL: "https://epharma-97b49-default-rtdb.firebaseio.com/",
    projectId: "epharma-97b49",
    storageBucket: "epharma-97b49.appspot.com",
    messagingSenderId: "28593816693",
    appId: "1:28593816693:web:31e1add2da4a2d0459243c",
    measurementId: "G-BDWQJ65WFJ"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app); // Initialize Firebase Storage

export const realtimeDb = getDatabase(app);

export const usersRef = collection(db, 'users');
export const roomRef = collection(db, 'room');
