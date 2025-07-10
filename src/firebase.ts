// Firebase Configuration for NTC Frontend
// Initialize Firebase services for authentication and Firestore

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// Using environment variables for better security and deployment flexibility
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDRPc_RVdYxhXysqql-jeHC4V0w_N8aOXo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ntc-app-7ac7e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ntc-app-7ac7e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ntc-app-7ac7e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "580867573863",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:580867573863:web:f146130f87fe313b54acc2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9W9LKKVGST"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Analytics
export const analytics = getAnalytics(app);

export default app;
