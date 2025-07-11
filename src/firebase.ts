// Firebase Configuration for NTC Frontend
// Initialize Firebase services for authentication and Firestore

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// Using environment variables for better security and deployment flexibility
const firebaseConfig = {
  apiKey: "AIzaSyDRPc_RVdYxhXysqql-jeHC4V0w_N8aOXo",
  authDomain: "ntc-app-7ac7e.firebaseapp.com",
  projectId: "ntc-app-7ac7e",
  storageBucket: "ntc-app-7ac7e.firebasestorage.app",
  messagingSenderId: "580867573863",
  appId: "1:580867573863:web:f146130f87fe313b54acc2",
  measurementId: "G-9W9LKKVGST"
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
